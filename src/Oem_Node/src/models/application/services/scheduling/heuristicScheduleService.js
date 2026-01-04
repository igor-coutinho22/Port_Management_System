// heuristicScheduleService.js
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const webAppService = require('../../../infrastructure/integration/webAppService'); // adapt path if needed
const SchedulingResult = require('../../../domain/scheduling/schedulingResult');   // adapt path if needed
const VesselScheduleEntry = require('../../../domain/scheduling/vesselScheduleEntry'); // adapt path
const MultiCraneComparisonResultDTO = require('../../dtos/scheduling/multiCraneComparisonResultDTO'); //
const { SchedulingResultDTO, VesselScheduleEntryDTO } = require('../../dtos/schedulingResultDTOs'); //

// Command to run Prolog. Ensure 'swipl' is in your System PATH.
const PROLOG_COMMAND = 'swipl';

// Path to the .pl file. Adjust this path to your repository layout.
const PROLOG_FILE_PATH = path.join(__dirname, '../../../../models/domain/scheduling/prolog/heuristic_schedule.pl');

class HeuristicScheduleService {
    constructor() {
        // default timeout (ms) to wait for swipl
        this._prologTimeoutMs = 30_000;
    }

    // --- public API ------------------------------------------------

    async ensurePrologAvailable() {
        return new Promise((resolve, reject) => {
            let proc;
            try {
                proc = spawn(PROLOG_COMMAND, ['--version']);
            } catch (err) {
                return reject(new Error(`SWI-Prolog command '${PROLOG_COMMAND}' not found in PATH.`));
            }

            let stderr = '';
            proc.stderr.on('data', d => stderr += d.toString());
            proc.on('error', () => reject(new Error(`SWI-Prolog command '${PROLOG_COMMAND}' not found in PATH.`)));
            proc.on('close', code => {
                if (code === 0) resolve();
                else reject(new Error(`SWI-Prolog check failed. Stderror: ${stderr}`));
            });
        });
    }

    // targetDate: "YYYY-MM-DD" (string) or Date object; heuristicName: string; token: bearer token string (optional)
    async generateDailySchedule(targetDate, heuristicName = 'auto', token = null) {
        await this.ensurePrologAvailable();

        // Fetch visits first (so "auto" algorithm can depend on vessel count)
        const visits = await webAppService.getApprovedVisitsForDate(targetDate, token);

        if (!visits || visits.length === 0) {
            return new SchedulingResult({
                heuristicName: heuristicName,
                totalDelayMinutes: 0,
                runtimeSeconds: 0,
                entries: [],
                warnings: ['No vessel visit notifications found for selected date.']
            });
        }

        // Auto selection (like your C# SelectAlgorithmAutomatically)
        const selectedAlgorithm = this.selectAlgorithmAutomatically(heuristicName, visits.length);
        const algorithmAtom = this.normalizeHeuristicName(selectedAlgorithm);
        this.validateHeuristic(algorithmAtom); // throws if invalid

        const startMs = Date.now();

        const { facts: vesselFacts, idMap } = this.buildPrologVesselFacts(visits, targetDate);

        const { seqLine, delayLine } = await this.runProlog(vesselFacts, algorithmAtom);

        const entries = this.parseSeqTripletsLine(seqLine, idMap, targetDate);

        const totalDelay = parseFloat(delayLine);
        if (Number.isNaN(totalDelay)) throw new Error(`Could not parse delay value from Prolog: '${delayLine}'`);

        const runtimeSeconds = (Date.now() - startMs) / 1000.0;

        return new SchedulingResult({
            heuristicName: algorithmAtom,
            totalDelayMinutes: totalDelay,
            runtimeSeconds: runtimeSeconds,
            entries: entries
        });
    }

    async generateDailyScheduleWithMultiCrane(targetDate, heuristicName = 'auto', token = null) {
        // 1) run single-crane using the same logic
        const single = await this.generateDailySchedule(targetDate, heuristicName, token);

        if (single.totalDelayMinutes <= 0.0001) {
            return new MultiCraneComparisonResultDTO({
                singleCrane: this.mapToDTO(single),
                multiCrane: null,
                craneHoursSingle: this.computeCraneHours(single),
                craneHoursMulti: null
            });
        }

        // 2) fetch visits and facts again
        const visits = await webAppService.getApprovedVisitsForDate(targetDate, token);
        const { facts: vesselFacts, idMap } = this.buildPrologVesselFacts(visits, targetDate);

        const sequenceFacts = this.buildSequenceFacts(single.entries);

        const { seqLine, delayLine, craneMinutesLine } = await this.runPrologMultiCrane(vesselFacts, sequenceFacts);

        const multiEntries = this.parseSeqQuadrupletsLine(seqLine, idMap, targetDate);
        const multiDelay = parseFloat(delayLine);
        const totalCraneMinutes = parseFloat(craneMinutesLine);

        if (Number.isNaN(multiDelay)) throw new Error(`Could not parse multi-crane delay: '${delayLine}'`);
        if (Number.isNaN(totalCraneMinutes)) throw new Error(`Could not parse crane-minutes: '${craneMinutesLine}'`);

        const multiResult = new SchedulingResult({
            heuristicName: this.normalizeHeuristicName(heuristicName) + '_multi',
            totalDelayMinutes: multiDelay,
            runtimeSeconds: 0,
            entries: multiEntries
        });

        return new MultiCraneComparisonResultDTO({
            singleCrane: this.mapToDTO(single),
            multiCrane: this.mapToDTO(multiResult),
            craneHoursSingle: this.computeCraneHours(single),
            craneHoursMulti: totalCraneMinutes / 60.0
        });
    }

    // Apply a dock rebalance: run Prolog rebalance and then call backend to persist assignments.
    // token required so we can call backend with Authorization header.
    async applyDockRebalance(targetDate, token = null) {
        await this.ensurePrologAvailable();

        const visits = await webAppService.getApprovedVisitsForDate(targetDate, token);
        if (!visits || visits.length === 0) throw new Error('No approved visits to rebalance.');

        const docks = await webAppService.getDocks(token);
        if (!docks || docks.length === 0) throw new Error('No docks available.');

        const { facts: vesselFacts, idMap: vesselIdMap } = this.buildPrologVesselFacts(visits, targetDate);
        const dockFacts = this.buildDockFacts(docks);
        const dockIdMap = this.buildDockIdMap(docks);

        const { assignLine, delayLine } = await this.runPrologRebalance(vesselFacts, dockFacts);

        const assignments = this.parseAssignments(assignLine);

        const totalDelay = parseFloat(delayLine);
        if (Number.isNaN(totalDelay)) throw new Error(`Could not parse delay value '${delayLine}'`);

        // Build DTO expected by backend: [{ vesselVisitId: GUID, dockId: GUID }, ...]
        const dto = assignments.map(a => {
            const visitGuid = vesselIdMap[a.prologVisitId] && vesselIdMap[a.prologVisitId].id
                ? vesselIdMap[a.prologVisitId].id
                : (vesselIdMap[a.prologVisitId] && vesselIdMap[a.prologVisitId].Id) || null;

            const dockGuid = dockIdMap[a.dockId];

            if (!visitGuid) throw new Error(`Unknown vessel for prolog id ${a.prologVisitId}`);
            if (!dockGuid) throw new Error(`Unknown dock for prolog id ${a.dockId}`);

            return { vesselVisitId: visitGuid, dockId: dockGuid };
        });

        // Now call backend to apply schedule. Adjust the webAppService method name to your actual implementation.
        // I assume a method webAppService.applySchedule(dto, token) or webAppService.putSchedule(dto, token).
        if (typeof webAppService.applySchedule === 'function') {
            await webAppService.applySchedule(dto, token);
        } else if (typeof webAppService.putSchedule === 'function') {
            await webAppService.putSchedule(dto, token);
        } else {
            // fallback to a generic path using webAppService.request? adjust as needed
            throw new Error('Please adapt the call that applies the rebalance to the backend (webAppService.applySchedule / putSchedule).');
        }

        return { totalDelay, assignments: dto };
    }

    // --- helpers / small utilities ---------------------------------

    selectAlgorithmAutomatically(requestedAlgorithm, vesselCount) {
        if (!requestedAlgorithm || requestedAlgorithm.toLowerCase() !== 'auto') return requestedAlgorithm;
        if (vesselCount <= 6) return 'optimal';
        if (vesselCount <= 12) return 'genetic';
        return 'atc';
    }

    normalizeHeuristicName(name) {
        return name.trim().toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
    }

    validateHeuristic(name) {
        const allowed = new Set([
            'minimum_slack_time',
            'early_departure_time',
            'arrived_shortest_departure_time',
            'atc',
            'optimal',
            'genetic'
        ]);
        if (!allowed.has(name)) throw new Error(`Unknown heuristic '${name}'. Allowed: ${Array.from(allowed).join(', ')}`);
    }

    // Build vessel facts string + idMap
    buildPrologVesselFacts(visits, targetDate) {
        // targetDate can be Date or string 'YYYY-MM-DD'
        const sb = [];
        const idMap = {};

        // Midnight explicit UTC to match C# DateOnly->DateTime behavior
        const midnight = (d => {
            if (d instanceof Date) {
                const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
                return new Date(Date.UTC(y, m, day, 0, 0, 0));
            }
            // assume 'YYYY-MM-DD'
            return new Date(`${d}T00:00:00Z`);
        })(targetDate);

        for (const v of visits) {
            // create prolog id matching C# Guid:N formatting (no dashes)
            const rawId = (v.id || v.Id || v.visitId || '').toString();
            const idNoDash = rawId.replace(/-/g, '').toLowerCase();
            const prologId = `v_${idNoDash}`;

            idMap[prologId] = v;

            const arrivalMs = new Date(v.arrivalTime || v.ArrivalTime).getTime();
            const departureMs = new Date(v.desiredDepartureTime || v.DesiredDepartureTime).getTime();
            const arrivalMin = Math.round((arrivalMs - midnight.getTime()) / 60000);
            const departureMin = Math.round((departureMs - midnight.getTime()) / 60000);

            const loading = Number(v.estimatedLoadingDurationMinutes ?? v.EstimatedLoadingDurationMinutes ?? 0);
            const unloading = Number(v.estimatedUnloadingDurationMinutes ?? v.EstimatedUnloadingDurationMinutes ?? 0);

            sb.push(`vessel(${prologId},${arrivalMin},${departureMin},${loading},${unloading}).`);
        }

        return { facts: sb.join('\n') + '\n', idMap };
    }

    // Build dock facts string, mirroring the C# BuildDockFacts
    buildDockFacts(docks) {
        const dockLines = [];
        const typeLines = [];

        for (const d of docks) {
            const rawId = (d.id || d.Id || '').toString();
            const idNoDash = rawId.replace(/-/g, '').toLowerCase();
            const did = `d_${idNoDash}`;

            const len = Number(d.lengthMeters ?? d.LengthMeters ?? 0);
            const depth = Number(d.depthMeters ?? d.DepthMeters ?? 0);
            const maxDraft = Number(d.maxDraftMeters ?? d.MaxDraftMeters ?? 0);

            dockLines.push(`dock(${did}, ${len}, ${depth}, ${maxDraft}).`);

            const allowed = d.allowedVesselTypes || d.AllowedVesselTypes || [];
            for (const vt of allowed) {
                const normalized = vt.toString().replace(/\s+/g, '_').toLowerCase();
                typeLines.push(`allowed_type(${did}, ${normalized}).`);
            }
        }
        // Return all docks grouped, then all allowed_types grouped
        return dockLines.join('\n') + '\n' + typeLines.join('\n') + '\n';
    }

    // returns map prologDockId -> original GUID
    buildDockIdMap(docks) {
        const map = {};
        for (const d of docks) {
            const rawId = (d.id || d.Id || '').toString();
            if (!rawId) throw new Error('Dock without Id encountered');
            const idNoDash = rawId.replace(/-/g, '').toLowerCase();
            const prologId = `d_${idNoDash}`;
            map[prologId] = rawId;
        }
        return map;
    }

    buildSequenceFacts(entries) {
        // entries is array of schedule entries (with vesselVisitId fields)
        const arr = Array.from(entries || []);
        arr.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        const sb = [];
        for (const e of arr) {
            const raw = (e.vesselVisitId || e.VesselVisitId || e.vesselVisitId || '').toString();
            const idNoDash = raw.replace(/-/g, '').toLowerCase();
            sb.push(`sequence(v_${idNoDash}).`);
        }
        return sb.join('\n') + '\n';
    }

    // --- run prolog helpers (with timeout) ------------------------

    async runProlog(vesselFacts, heuristicAtom) {
        const tempFile = path.join(os.tmpdir(), `schedule_${uuidv4()}.pl`);
        try {
            const safePrologPath = PROLOG_FILE_PATH.replace(/\\/g, '/').replace(/'/g, "\\'");
            const script =
                `${":- consult('" + safePrologPath + "')."}\n
% Vessel facts (generated by node):
${vesselFacts}
main :-
${heuristicAtom === 'genetic' ? '    run_genetic,' : `    run_heuristic(${heuristicAtom}),`}
    halt.
`;
            await fs.writeFile(tempFile, script, { encoding: 'utf8' });
            const output = await this.executeSwipl(tempFile, this._prologTimeoutMs);
            const lines = output.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length < 2) throw new Error(`Unexpected Prolog output. Expected >=2 lines, got ${lines.length}. Output:\n${output}`);
            return { seqLine: lines[0], delayLine: lines[1] };
        } finally {
            try { await fs.unlink(tempFile); } catch (e) { /* ignore */ }
        }
    }

    async runPrologMultiCrane(vesselFacts, sequenceFacts) {
        const tempFile = path.join(os.tmpdir(), `schedule_multi_${uuidv4()}.pl`);
        try {
            const safePrologPath = PROLOG_FILE_PATH.replace(/\\/g, '/').replace(/'/g, "\\'");
            const script =
                `${":- consult('" + safePrologPath + "')."}\n
% Vessel facts:
${vesselFacts}
% Sequence facts:
${sequenceFacts}
main :-
    run_multi_from_sequence,
    halt.
`;
            await fs.writeFile(tempFile, script, { encoding: 'utf8' });
            const output = await this.executeSwipl(tempFile, this._prologTimeoutMs);
            const lines = output.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length < 3) throw new Error(`Unexpected Prolog multi-crane output. Expected >=3 lines, got ${lines.length}. Output:\n${output}`);
            return { seqLine: lines[0], delayLine: lines[1], craneMinutesLine: lines[2] };
        } finally {
            try { await fs.unlink(tempFile); } catch (e) { /* ignore */ }
        }
    }

    async runPrologRebalance(vesselFacts, dockFacts) {
        const tempFile = path.join(os.tmpdir(), `rebalance_${uuidv4()}.pl`);
        try {
            const safePrologPath = PROLOG_FILE_PATH.replace(/\\/g, '/').replace(/'/g, "\\'");
            const script =
                `${":- consult('" + safePrologPath + "')."}\n
% Vessel facts:
${vesselFacts}
% Dock facts:
${dockFacts}
main :-
    main_rebalance,
    halt.
`;
            await fs.writeFile(tempFile, script, { encoding: 'utf8' });
            const output = await this.executeSwipl(tempFile, this._prologTimeoutMs);
            const lines = output.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length < 2) throw new Error(`Unexpected Prolog rebalance output. Expected >=2 lines, got ${lines.length}. Output:\n${output}`);
            return { assignLine: lines[0], delayLine: lines[1] };
        } finally {
            try { await fs.unlink(tempFile); } catch (e) { /* ignore */ }
        }
    }

    executeSwipl(filePath, timeoutMs = 30000) {
        return new Promise((resolve, reject) => {
            const prologDir = path.dirname(PROLOG_FILE_PATH);

            const proc = spawn(PROLOG_COMMAND,
                ['-q', '-s', filePath, '-g', 'main', '-t', 'halt'],
                {
                    cwd: prologDir,
                    env: process.env
                }
            );

            let stdout = '', stderr = '';
            let killed = false;

            const timer = setTimeout(() => {
                killed = true;
                try { proc.kill('SIGKILL'); } catch (e) { /* ignore */ }
            }, timeoutMs);

            proc.stdout.on('data', d => stdout += d.toString());
            proc.stderr.on('data', d => stderr += d.toString());

            proc.on('error', err => {
                clearTimeout(timer);
                reject(new Error(`Failed to start Prolog process: ${err.message}`));
            });

            proc.on('close', code => {
                clearTimeout(timer);
                if (killed) {
                    return reject(new Error(`Prolog process timed out after ${timeoutMs}ms. Stdout:\n${stdout}\nStderr:\n${stderr}`));
                }
                if (code !== 0) {
                    return reject(new Error(`Prolog exited with code ${code}. Stderr:\n${stderr}\nStdout:\n${stdout}`));
                }
                resolve(stdout);
            });
        });
    }

    // ---------------- parsing helpers -------------------------------

    parseSeqTripletsLine(line, idMap, targetDate) {
        const regex = /\(\s*([^,]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
        const entries = [];
        const midnight = (d => {
            if (d instanceof Date) {
                const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
                return new Date(Date.UTC(y, m, day, 0, 0, 0));
            }
            return new Date(`${d}T00:00:00Z`);
        })(targetDate);

        let m;
        while ((m = regex.exec(line)) !== null) {
            const idAtom = m[1].trim();
            const startMin = parseInt(m[2], 10);
            const endMin = parseInt(m[3], 10);

            const visit = idMap[idAtom];
            if (!visit) throw new Error(`Unknown vessel ID: ${idAtom}`);

            entries.push(new VesselScheduleEntry({
                vesselVisitId: visit.id || visit.Id,
                vesselIMO: visit.vesselIMO || visit.VesselIMO,
                startTime: new Date(midnight.getTime() + startMin * 60000),
                endTime: new Date(midnight.getTime() + endMin * 60000),
                numberOfCranes: 1
            }));
        }
        return entries;
    }

    parseSeqQuadrupletsLine(line, idMap, targetDate) {
        const regex = /\(\s*([^,]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
        const entries = [];
        const midnight = (d => {
            if (d instanceof Date) {
                const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
                return new Date(Date.UTC(y, m, day, 0, 0, 0));
            }
            return new Date(`${d}T00:00:00Z`);
        })(targetDate);

        let m;
        while ((m = regex.exec(line)) !== null) {
            const idAtom = m[1].trim();
            const startMin = parseInt(m[2], 10);
            const endMin = parseInt(m[3], 10);
            const cranes = parseInt(m[4], 10);

            const visit = idMap[idAtom];
            if (!visit) throw new Error(`Unknown vessel ID: ${idAtom}`);

            entries.push(new VesselScheduleEntry({
                vesselVisitId: visit.id || visit.Id,
                vesselIMO: visit.vesselIMO || visit.VesselIMO,
                startTime: new Date(midnight.getTime() + startMin * 60000),
                endTime: new Date(midnight.getTime() + endMin * 60000),
                numberOfCranes: cranes
            }));
        }
        return entries;
    }

    // parse assign(v_xxx, d_yyy) -> [{ prologVisitId: 'v_xxx', dockId: 'd_yyy' }, ...]
    parseAssignments(line) {
        const pattern = /assign\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/g;
        const out = [];
        let m;
        while ((m = pattern.exec(line)) !== null) {
            out.push({ prologVisitId: m[1].trim(), dockId: m[2].trim() });
        }
        return out;
    }

    // map result DTO helpers
    mapToDTO(result) {
        return new SchedulingResultDTO({
            heuristicName: result.heuristicName,
            totalDelayMinutes: result.totalDelayMinutes,
            runtimeSeconds: result.runtimeSeconds,
            warnings: result.warnings,
            entries: (result.entries || []).map(e => new VesselScheduleEntryDTO(e))
        });
    }

    computeCraneHours(result) {
        const totalMinutes = (result.entries || []).reduce((acc, e) => {
            const end = new Date(e.endTime || e.EndTime);
            const start = new Date(e.startTime || e.StartTime);
            const duration = (end.getTime() - start.getTime()) / 60000;
            return acc + (duration * Math.max(e.numberOfCranes || e.NumberOfCranes || 1, 1));
        }, 0);
        return totalMinutes / 60.0;
    }
}

module.exports = new HeuristicScheduleService();
