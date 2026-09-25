const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Runs the Prolog scheduling algorithms directly with SWI-Prolog (skipped when swipl is not installed).
const PROLOG_FILE = path.join(__dirname, '../../src/models/domain/scheduling/prolog/heuristic_schedule.pl')
    .replace(/\\/g, '/');
const hasSwipl = spawnSync('swipl', ['--version']).status === 0;
const describeIfSwipl = hasSwipl ? describe : describe.skip;

// vessel(Id, Arrival, DesiredDeparture, Unloading, Loading) in minutes; overlapping visits cause delays
const VESSELS = `
vessel(v1, 0, 200, 60, 50).
vessel(v2, 20, 150, 40, 30).
vessel(v3, 30, 400, 90, 80).
vessel(v4, 60, 180, 20, 20).
vessel(v5, 90, 500, 70, 60).
vessel(v6, 100, 260, 30, 40).
vessel(v7, 150, 330, 50, 20).
vessel(v8, 200, 380, 25, 35).
vessel(v9, 240, 600, 80, 70).
`;

const run = (goal) => {
    const file = path.join(os.tmpdir(), `prolog_test_${process.pid}_${Date.now()}.pl`);
    fs.writeFileSync(file, `:- consult('${PROLOG_FILE}').\n${VESSELS}`);
    try {
        const res = spawnSync('swipl', ['-q', '-s', file, '-g', goal, '-t', 'halt'], { encoding: 'utf8', timeout: 30000 });
        const lines = (res.stdout || '').split(/\r?\n/).filter(Boolean);
        return { status: res.status, sequence: lines[0], delay: Number(lines[1]), stderr: res.stderr };
    } finally {
        fs.unlinkSync(file);
    }
};

describeIfSwipl('SUT=Prolog: dock scheduling algorithms', () => {
    let bestHeuristicDelay;

    beforeAll(() => {
        const delays = ['atc', 'early_departure_time', 'minimum_slack_time', 'arrived_shortest_departure_time']
            .map((h) => run(`run_heuristic(${h})`).delay);
        bestHeuristicDelay = Math.min(...delays);
    });

    it('heuristics produce a schedule for every vessel', () => {
        const res = run('run_heuristic(atc)');
        expect(res.status).toBe(0);
        expect(res.sequence.match(/v\d+/g).sort()).toEqual(['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9']);
    });

    it('genetic algorithm always finishes and is never worse than the best heuristic', () => {
        for (let i = 0; i < 5; i++) {
            const res = run('run_genetic');
            expect(res.status).toBe(0);
            expect(res.sequence.match(/v\d+/g)).toHaveLength(9);
            expect(res.delay).toBeLessThanOrEqual(bestHeuristicDelay);
        }
    });

    it('genetic algorithm works with fewer vessels than the population size', () => {
        const file = path.join(os.tmpdir(), `prolog_small_${process.pid}.pl`);
        fs.writeFileSync(file, `:- consult('${PROLOG_FILE}').\nvessel(a, 0, 100, 30, 20).\nvessel(b, 10, 90, 20, 20).\n`);
        try {
            const res = spawnSync('swipl', ['-q', '-s', file, '-g', 'run_genetic', '-t', 'halt'], { encoding: 'utf8', timeout: 30000 });
            expect(res.status).toBe(0);
        } finally {
            fs.unlinkSync(file);
        }
    });
});
