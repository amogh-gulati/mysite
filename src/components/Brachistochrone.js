import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Brachistochrone.css';

const G = 980; // px/s²
const PX_PER_M = 100;
const BALL_RADIUS = 9;
const SAMPLES = 600;

// Solve (θ - sinθ) / (1 - cosθ) = dx/dy for the cycloid through both endpoints.
export const solveCycloid = (dx, dy) => {
    const f = (t) => (t - Math.sin(t)) / (1 - Math.cos(t));
    let lo = 1e-6;
    let hi = 2 * Math.PI - 1e-6;
    for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (f(mid) < dx / dy) lo = mid;
        else hi = mid;
    }
    const thetaEnd = (lo + hi) / 2;
    return { thetaEnd, r: dy / (1 - Math.cos(thetaEnd)) };
};

// Each track's shape(dx, dy) maps k ∈ [0, 1] to a fraction of the way across (x) and down (y).
// Height never increases, and every track leaves A with a nonzero slope so a
// ball released from rest actually moves.
export const TRACKS = [
    {
        id: 'cycloid',
        name: 'cycloid',
        note: 'Johann Bernoulli, 1696: the brachistochrone. Nothing is faster.',
        shape: (dx, dy) => {
            const { thetaEnd, r } = solveCycloid(dx, dy);
            return (k) => {
                const t = k * thetaEnd;
                return [(r * (t - Math.sin(t))) / dx, (r * (1 - Math.cos(t))) / dy];
            };
        },
    },
    {
        id: 'line',
        name: 'straight line',
        note: 'The shortest path is not the quickest.',
        shape: () => (k) => [k, k],
    },
    {
        id: 'galileo',
        name: "Galileo's arc",
        note: 'Galileo, 1638, guessed a circular arc was fastest. Close, but no.',
        shape: () => (k) => {
            const t = (k * Math.PI) / 2;
            return [1 - Math.cos(t), Math.sin(t)];
        },
    },
    {
        id: 'parabola',
        name: 'parabola',
        note: 'Steep start, flat finish. y = 1 − (1 − x)².',
        shape: () => (k) => [k, 1 - (1 - k) ** 2],
    },
    {
        id: 'sqrt',
        name: '√x',
        note: 'Starts in free fall, then has a long way to roll.',
        shape: () => (k) => [k * k, k],
    },
    {
        id: 'log',
        name: 'logarithm',
        note: 'y = ln(1 + 9x) / ln 10.',
        shape: () => (k) => [k, Math.log1p(9 * k) / Math.log(10)],
    },
    {
        id: 'exp-decay',
        name: 'exponential decay',
        note: 'Height ∝ e^(−4x), the shape of every cooling cup of coffee.',
        shape: () => (k) => [k, (1 - Math.exp(-4 * k)) / (1 - Math.exp(-4))],
    },
    {
        id: 'tanh',
        name: 'tanh',
        note: "The activation function, on its side. y = tanh(3x) / tanh 3.",
        shape: () => (k) => [k, Math.tanh(3 * k) / Math.tanh(3)],
    },
    {
        id: 'exp-growth',
        name: 'exponential growth',
        note: 'Saves the drop for last. A cautionary tale.',
        shape: () => (k) => [k, Math.expm1(2 * k) / Math.expm1(2)],
    },
];

const pickTwo = () => {
    const i = Math.floor(Math.random() * TRACKS.length);
    let j = Math.floor(Math.random() * (TRACKS.length - 1));
    if (j >= i) j += 1;
    return [TRACKS[i], TRACKS[j]];
};

// Frictionless bead released from rest at A. Speed follows from energy
// conservation, v = √(2g·depth); each segment takes 2·ds / (v₀ + v₁).
export const simulate = (track, start, dx, dy) => {
    const xs = new Float64Array(SAMPLES + 1);
    const ys = new Float64Array(SAMPLES + 1);
    const ts = new Float64Array(SAMPLES + 1);
    const at = track.shape(dx, dy);
    for (let i = 0; i <= SAMPLES; i++) {
        const [fx, fy] = at(i / SAMPLES);
        xs[i] = start.x + fx * dx;
        ys[i] = start.y + fy * dy;
        if (i > 0) {
            const ds = Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
            const v0 = Math.sqrt(2 * G * Math.max(ys[i - 1] - start.y, 0));
            const v1 = Math.sqrt(2 * G * Math.max(ys[i] - start.y, 0));
            ts[i] = ts[i - 1] + (v0 + v1 > 0 ? (2 * ds) / (v0 + v1) : 0);
        }
    }
    const path = Array.from(xs, (x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    return { track, xs, ys, ts, path, total: ts[SAMPLES] };
};

const positionAt = (run, t) => {
    const { xs, ys, ts } = run;
    if (t >= run.total) return { x: xs[SAMPLES], y: ys[SAMPLES], done: true };
    let lo = 0;
    let hi = SAMPLES;
    while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (ts[mid] <= t) lo = mid;
        else hi = mid;
    }
    const f = (t - ts[lo]) / (ts[hi] - ts[lo] || 1);
    return { x: xs[lo] + (xs[hi] - xs[lo]) * f, y: ys[lo] + (ys[hi] - ys[lo]) * f, done: false };
};

// Scroll drives depth, not time: find the moment the pair's average depth
// equals the target. Depth grows with t, so bisection works, and the balls
// descend through the viewport at the same pace as the page scrolls.
export const timeAtDepth = (runs, depth, startY) => {
    const meanDepth = (t) => runs.reduce((sum, run) => sum + positionAt(run, t).y - startY, 0) / runs.length;
    let lo = 0;
    let hi = Math.max(...runs.map((run) => run.total));
    if (depth <= 0) return 0;
    if (meanDepth(hi) <= depth) return hi;
    for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (meanDepth(mid) < depth) lo = mid;
        else hi = mid;
    }
    return hi;
};

const useElementSize = (ref) => {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width, height });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return size;
};

const useScrollProgress = () => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const update = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);
    return progress;
};

const LANES = ['lane-a', 'lane-b'];
const meters = (px) => (px / PX_PER_M).toFixed(1);
const secs = (t) => `${t.toFixed(3)}s`;

// A scroll-driven race between two randomly chosen tracks from A to B.
// Wraps the page so the overlay spans it; `children` receives the race state.
const Brachistochrone = ({ className, children }) => {
    const ref = useRef(null);
    const { width, height } = useElementSize(ref);
    const progress = useScrollProgress();
    const [pair, setPair] = useState(pickTwo);
    const reroll = useCallback(() => setPair(pickTwo()), []);

    const geo = useMemo(() => {
        if (!width || !height) return null;
        const marginX = Math.max(22, width * 0.04);
        const start = { x: marginX, y: 28 };
        const end = { x: width - marginX, y: height - 36 };
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        return { start, end, dx, dy };
    }, [width, height]);

    const runs = useMemo(
        () => (geo ? pair.map((track) => simulate(track, geo.start, geo.dx, geo.dy)) : null),
        [geo, pair]
    );

    let race = null;
    if (geo && runs) {
        const t = timeAtDepth(runs, progress * geo.dy, geo.start.y);
        const balls = runs.map((run) => {
            const pos = positionAt(run, t);
            return { ...pos, run, height: meters(geo.end.y - pos.y) };
        });
        const standings = [...runs].sort((a, b) => a.total - b.total);
        race = { t, balls, standings, drop: meters(geo.dy), reroll };
    }

    return (
        <main ref={ref} className={className}>
            {race && (
                <div className="brach" aria-hidden="true">
                    <svg width={width} height={height}>

                        {race.balls.map((b, i) => (
                            <path key={b.run.track.id} className={`track ${LANES[i]}`} d={b.run.path} />
                        ))}
                        <line
                            className="connector"
                            x1={race.balls[0].x}
                            y1={race.balls[0].y}
                            x2={race.balls[1].x}
                            y2={race.balls[1].y}
                        />
                        {race.balls.map((b, i) => (
                            <circle key={b.run.track.id} className={`ball ${LANES[i]}`} cx={b.x} cy={b.y} r={BALL_RADIUS} />
                        ))}

                        <text className="mark" x={geo.start.x + 16} y={geo.start.y + 4}>
                            A · h={race.drop}m
                        </text>
                        <text className="mark" x={geo.end.x - 16} y={geo.end.y + 26} textAnchor="end">B · h=0</text>
                    </svg>
                </div>
            )}

            {race && (
                <div className="brach-legend" aria-hidden="true">
                    {race.balls.map((b, i) => (
                        <span key={b.run.track.id}>
                            <i className={`dot ${LANES[i]}`} />
                            {b.run.track.name}
                            <span className="brach-num">{b.done ? '✓' : `${b.height}m`}</span>
                        </span>
                    ))}
                    {race.t > 0 ? (
                        <span className="brach-num">t = {race.t.toFixed(2)}s</span>
                    ) : (
                        <span className="brach-hint">scroll to race <i className="brach-arrow">↓</i></span>
                    )}
                </div>
            )}

            {children(race)}
        </main>
    );
};

// Final standings, revealed per ball as it reaches B.
export const RaceResults = ({ race }) => {
    if (!race) return null;
    const [first, second] = race.standings;
    const finished = (run) => race.t >= run.total;

    return (
        <section className="race-results">
            <h2 className="section-label">Today&rsquo;s race</h2>
            <p className="meta">
                Two tracks picked at random, dropping {race.drop}m from A to B. Frictionless, released from rest,
                g = 9.8 m/s². Scroll to run it.
            </p>
            <ol>
                {race.balls.map(({ run }, i) => (
                    <li key={run.track.id}>
                        <span className="place">
                            {finished(run) ? (run === first ? '1st' : '2nd') : '···'}
                        </span>
                        <span>
                            <i className={`dot ${LANES[i]}`} />
                            <strong>{run.track.name}</strong>
                            <span className="meta"> · {run.track.note}</span>
                        </span>
                        <span className="brach-num">{finished(run) ? secs(run.total) : 'racing'}</span>
                    </li>
                ))}
            </ol>
            <p className="meta race-foot">
                <span>
                    {finished(second)
                        ? `${first.track.name} wins by ${secs(second.total - first.total)}.`
                        : finished(first)
                            ? `${first.track.name} is home. Waiting on ${second.track.name}…`
                            : 'No finishers yet.'}
                </span>
                <button type="button" className="more race-again" onClick={race.reroll}>New matchup ↻</button>
            </p>
        </section>
    );
};

export default Brachistochrone;
