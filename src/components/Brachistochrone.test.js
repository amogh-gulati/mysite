import { simulate, solveCycloid, timeAtDepth, TRACKS } from './Brachistochrone';

const G = 980;

describe.each([
    [1200, 1800],
    [360, 2400],
])('race on a %ix%i track', (dx, dy) => {
    const start = { x: 0, y: 0 };
    const runs = TRACKS.map((track) => simulate(track, start, dx, dy));
    const byId = Object.fromEntries(runs.map((r) => [r.track.id, r]));

    test('simulated cycloid time matches the analytic θ√(r/g)', () => {
        const { thetaEnd, r } = solveCycloid(dx, dy);
        expect(byId.cycloid.total).toBeCloseTo(thetaEnd * Math.sqrt(r / G), 2);
    });

    test('straight line matches √(2L²/(g·dy))', () => {
        expect(byId.line.total).toBeCloseTo(Math.sqrt((2 * (dx * dx + dy * dy)) / (G * dy)), 2);
    });

    test('every track is monotone, ends at B, and loses to the cycloid', () => {
        for (const run of runs) {
            for (let i = 1; i < run.ys.length; i++) expect(run.ys[i]).toBeGreaterThanOrEqual(run.ys[i - 1] - 1e-9);
            expect(run.xs[run.xs.length - 1]).toBeCloseTo(dx, 3);
            expect(run.ys[run.ys.length - 1]).toBeCloseTo(dy, 3);
            expect(Number.isFinite(run.total)).toBe(true);
            if (run.track.id !== 'cycloid') expect(run.total).toBeGreaterThan(byId.cycloid.total);
        }
    });
});

test('scroll maps to average depth, ending when both balls finish', () => {
    const dx = 1200;
    const dy = 1800;
    const runs = [TRACKS[0], TRACKS[TRACKS.length - 1]].map((track) => simulate(track, { x: 0, y: 0 }, dx, dy));
    expect(timeAtDepth(runs, 0, 0)).toBe(0);
    expect(timeAtDepth(runs, dy, 0)).toBeCloseTo(Math.max(...runs.map((r) => r.total)), 6);
    let prev = 0;
    for (let k = 1; k < 10; k++) {
        const t = timeAtDepth(runs, (k / 10) * dy, 0);
        expect(t).toBeGreaterThan(prev);
        prev = t;
    }
});
