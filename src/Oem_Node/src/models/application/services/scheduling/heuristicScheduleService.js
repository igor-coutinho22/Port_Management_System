const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const webAppService = require('../../../infrastructure/integration/webAppService'); //
const SchedulingResult = require('../../../domain/scheduling/schedulingResult'); //
const VesselScheduleEntry = require('../../../domain/scheduling/vesselScheduleEntry'); //
const MultiCraneComparisonResultDTO = require('../../dtos/scheduling/multiCraneComparisonResultDTO'); //
const { SchedulingResultDTO, VesselScheduleEntryDTO } = require('../../dtos/schedulingResultDTOs'); //

// Command to run Prolog. Ensure 'swipl' is in your System PATH.
const PROLOG_COMMAND = 'swipl';

// Path to the .pl file. Adjusting ../ based on folder depth.
const PROLOG_FILE_PATH = path.join(__dirname, '../../../../models/domain/scheduling/prolog/heuristic_schedule.pl');

class HeuristicScheduleService {

    // Helper: Verify SWI-Prolog exists
    async ensurePrologAvailable() {
        return new Promise((resolve, reject) => {
            const process = spawn(PROLOG_COMMAND, ['--version']);
            process.on('error', () => reject(new Error(`SWI-Prolog command '${PROLOG_COMMAND}' not found in PATH.`)));
            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error('SWI-Prolog check failed.'));
            });
        });
    }

    // Matches: GenerateDailyScheduleAsync
    async generateDailySchedule(targetDate, heuristicName, token) {
        await this.ensurePrologAvailable();

        const heuristicAtom = this.normalizeHeuristicName(heuristicName);
        this.validateHeuristic(heuristicAtom);

        const startTime = Date.now();

        // 1. Fetch Visits
        const visits = await webAppService.getApprovedVisitsForDate(targetDate, token);

        if (!visits || visits.length === 0) {
            return new SchedulingResult({
                heuristicName: heuristicAtom,
                warnings: ['No vessel visit notifications found for selected date.']
            });
        }

        // 2. Build Facts
        const { facts, idMap } = this.buildPrologVesselFacts(visits, targetDate);

        // 3. Run Prolog
        const { seqLine, delayLine } = await this.runProlog(facts, heuristicAtom);

        // 4. Parse Results
        const entries = this.parseSeqTripletsLine(seqLine, idMap, targetDate);
        const totalDelay = parseFloat(delayLine);

        if (isNaN(totalDelay)) throw new Error(`Could not parse delay: ${delayLine}`);

        const runtime = (Date.now() - startTime) / 1000;

        return new SchedulingResult({
            heuristicName: heuristicAtom,
            totalDelayMinutes: totalDelay,
            runtimeSeconds: runtime,
            entries: entries
        });
    }

    // Matches: GenerateDailyScheduleWithMultiCraneAsync
    async generateDailyScheduleWithMultiCrane(targetDate, heuristicName, token) {
        // 1. Run Single Crane
        const single = await this.generateDailySchedule(targetDate, heuristicName, token);

        // Short-circuit if perfect (tiny epsilon check)
        if (single.totalDelayMinutes <= 0.0001) {
            return new MultiCraneComparisonResultDTO({
                singleCrane: this.mapToDTO(single),
                multiCrane: null,
                craneHoursSingle: this.computeCraneHours(single),
                craneHoursMulti: null
            });
        }

        // 2. Run Multi Crane logic (using same visits)
        const visits = await webAppService.getApprovedVisitsForDate(targetDate, token);
        const { facts, idMap } = this.buildPrologVesselFacts(visits, targetDate);
        
        const sequenceFacts = this.buildSequenceFacts(single.entries);
        
        const { seqLine, delayLine, craneMinutesLine } = await this.runPrologMultiCrane(facts, sequenceFacts);

        const multiEntries = this.parseSeqQuadrupletsLine(seqLine, idMap, targetDate);
        const multiDelay = parseFloat(delayLine);
        const totalCraneMinutes = parseFloat(craneMinutesLine);

        const multiResult = new SchedulingResult({
            heuristicName: this.normalizeHeuristicName(heuristicName) + '_multi',
            totalDelayMinutes: multiDelay,
            entries: multiEntries
        });

        return new MultiCraneComparisonResultDTO({
            singleCrane: this.mapToDTO(single),
            multiCrane: this.mapToDTO(multiResult),
            craneHoursSingle: this.computeCraneHours(single),
            craneHoursMulti: totalCraneMinutes / 60.0
        });
    }

    // --- Private Helpers ---

    normalizeHeuristicName(name) {
        return name.trim().toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
    }

    validateHeuristic(name) {
        const allowed = ['minimum_slack_time', 'early_departure_time', 'arrived_shortest_departure_time', 'atc', 'optimal'];
        if (!allowed.includes(name)) throw new Error(`Unknown heuristic '${name}'`);
    }

    buildPrologVesselFacts(visits, targetDate) {
        let sb = '';
        const idMap = {};
        const midnight = new Date(targetDate).setHours(0,0,0,0);

        visits.forEach(v => {
            const prologId = `v_${v.id.replace(/-/g, '_')}`; // Prolog implies atoms start with lowercase
            idMap[prologId] = v;

            // Date math: (Difference in ms) / 60000 = minutes
            const arrival = (new Date(v.arrivalTime) - midnight) / 60000;
            const departure = (new Date(v.desiredDepartureTime) - midnight) / 60000;
            const loading = v.estimatedLoadingDurationMinutes;
            const unloading = v.estimatedUnloadingDurationMinutes;

            sb += `vessel(${prologId},${Math.round(arrival)},${Math.round(departure)},${loading},${unloading}).\n`;
        });
        return { facts: sb, idMap };
    }

    buildSequenceFacts(entries) {
        let sb = '';
        // Sort by start time to maintain order
        const sorted = [...entries].sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
        
        sorted.forEach(e => {
             const prologId = `v_${e.vesselVisitId.replace(/-/g, '_')}`;
             sb += `sequence(${prologId}).\n`;
        });
        return sb;
    }

    async runProlog(vesselFacts, heuristicAtom) {
        const tempFile = path.join(os.tmpdir(), `schedule_${uuidv4()}.pl`);
        
        // IMPORTANT: We escape backslashes for Prolog paths on Windows
        const safePrologPath = PROLOG_FILE_PATH.replace(/\\/g, '/');

        const script = `
            :- consult('${safePrologPath}').
            
            % Vessel facts
            ${vesselFacts}
            
            main :-
                run_heuristic(${heuristicAtom}),
                halt.
        `;

        try {
            await fs.writeFile(tempFile, script);
            const output = await this.executeSwipl(tempFile);
            
            // Split lines and clean empty ones
            const lines = output.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
            
            if (lines.length < 2) throw new Error('Unexpected Prolog output format.');
            return { seqLine: lines[0], delayLine: lines[1] };
        } finally {
            try { await fs.unlink(tempFile); } catch (e) {}
        }
    }

    async runPrologMultiCrane(vesselFacts, sequenceFacts) {
        const tempFile = path.join(os.tmpdir(), `schedule_multi_${uuidv4()}.pl`);
        const safePrologPath = PROLOG_FILE_PATH.replace(/\\/g, '/');
        
        const script = `
            :- consult('${safePrologPath}').
            
            % Vessel facts
            ${vesselFacts}
            
            % Sequence facts
            ${sequenceFacts}
            
            main :-
                run_multi_from_sequence,
                halt.
        `;

        try {
            await fs.writeFile(tempFile, script);
            const output = await this.executeSwipl(tempFile);
            const lines = output.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
            
            if (lines.length < 3) throw new Error('Unexpected Prolog multi-crane output.');
            return { seqLine: lines[0], delayLine: lines[1], craneMinutesLine: lines[2] };
        } finally {
            try { await fs.unlink(tempFile); } catch (e) {}
        }
    }

    executeSwipl(filePath) {
        return new Promise((resolve, reject) => {
            const process = spawn(PROLOG_COMMAND, ['-q', '-s', filePath, '-g', 'main', '-t', 'halt']);
            
            let stdout = '';
            let stderr = '';

            process.stdout.on('data', d => stdout += d.toString());
            process.stderr.on('data', d => stderr += d.toString());

            process.on('close', code => {
                if (code !== 0) reject(new Error(`Prolog exited with code ${code}: ${stderr}`));
                else resolve(stdout);
            });
        });
    }

    parseSeqTripletsLine(line, idMap, targetDate) {
        // Regex matches (v_xxx, 123, 456)
        const regex = /\(\s*([^,]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
        const entries = [];
        const midnight = new Date(targetDate).setHours(0,0,0,0);
        
        let match;
        while ((match = regex.exec(line)) !== null) {
            const idAtom = match[1];
            const startMin = parseInt(match[2]);
            const endMin = parseInt(match[3]);
            
            const visit = idMap[idAtom];
            if (!visit) throw new Error(`Unknown vessel ID: ${idAtom}`);

            entries.push(new VesselScheduleEntry({
                vesselVisitId: visit.id,
                vesselIMO: visit.vesselIMO,
                startTime: new Date(midnight + startMin * 60000),
                endTime: new Date(midnight + endMin * 60000),
                numberOfCranes: 1
            }));
        }
        return entries;
    }

    parseSeqQuadrupletsLine(line, idMap, targetDate) {
        // Regex matches (v_xxx, 123, 456, 2)
        const regex = /\(\s*([^,]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
        const entries = [];
        const midnight = new Date(targetDate).setHours(0,0,0,0);
        
        let match;
        while ((match = regex.exec(line)) !== null) {
            const idAtom = match[1];
            const startMin = parseInt(match[2]);
            const endMin = parseInt(match[3]);
            const cranes = parseInt(match[4]);
            
            const visit = idMap[idAtom];
            if (!visit) throw new Error(`Unknown vessel ID: ${idAtom}`);

            entries.push(new VesselScheduleEntry({
                vesselVisitId: visit.id,
                vesselIMO: visit.vesselIMO,
                startTime: new Date(midnight + startMin * 60000),
                endTime: new Date(midnight + endMin * 60000),
                numberOfCranes: cranes
            }));
        }
        return entries;
    }

    mapToDTO(result) {
        return new SchedulingResultDTO({
            heuristicName: result.heuristicName,
            totalDelayMinutes: result.totalDelayMinutes,
            runtimeSeconds: result.runtimeSeconds,
            warnings: result.warnings,
            entries: result.entries.map(e => new VesselScheduleEntryDTO(e))
        });
    }

    computeCraneHours(result) {
        const totalMinutes = result.entries.reduce((sum, e) => {
            const duration = (new Date(e.endTime) - new Date(e.startTime)) / 60000;
            return sum + (duration * Math.max(e.numberOfCranes, 1));
        }, 0);
        return totalMinutes / 60.0;
    }
}

module.exports = new HeuristicScheduleService();