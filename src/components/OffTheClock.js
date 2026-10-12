import React from 'react';
import personal from '../data/personal.json';

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const shortDate = (ymd) => new Date(`${ymd}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// "TrailRun" -> "Trail run"
const sportName = (sport) => sport.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^(\w)(.*)$/, (_, a, b) => a + b.toLowerCase());

const duration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
};

const PACED = new Set(['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike']);

// min/km on foot, km/h on wheels and everything else.
const effort = (sport, km, seconds) => {
    if (!km) return null;
    if (PACED.has(sport)) {
        const pace = seconds / km;
        return `${Math.floor(pace / 60)}:${String(Math.round(pace % 60)).padStart(2, '0')} /km`;
    }
    return `${(km / (seconds / 3600)).toFixed(1)} km/h`;
};

const Covers = ({ items, caption, label }) => (
    <ul className="covers">
        {items.map((item) => (
            <li key={item.href}>
                <a href={item.href} target="_blank" rel="noreferrer" className="cover">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={label(item)}
                            width="240"
                            height="360"
                            loading="lazy"
                            style={item.color ? { borderBottomColor: item.color.hex } : undefined}
                        />
                    ) : (
                        <span className="cover-blank" />
                    )}
                    <span className="cover-title">{item.title}</span>
                    <span className="meta">{caption(item)}</span>
                </a>
            </li>
        ))}
    </ul>
);

const Swatch = ({ color }) => (
    <li className="swatch" style={{ background: color.hex }} title={`${color.hex} · ${color.from}`}>
        <span className="sr-only">{color.hex} from {color.from}</span>
    </li>
);

const PHOTOS = [
    {
        src: '/photos/amogh-and-akhilesh.webp',
        alt: 'Amogh smiling with his orange tabby cat Akhilesh perched on his shoulder',
        caption: 'Me and Akhilesh, his preferred seat.',
    },
    {
        src: '/photos/akhilesh-studying.webp',
        alt: 'Akhilesh the cat resting his chin on a textbook open to a figure about eigenvectors',
        caption: 'Akhilesh, reviewing eigendecompositions.',
    },
];

const OffTheClock = () => {
    // Read fields individually: webpack mangles destructuring defaults on JSON imports.
    const { films, tracks, strava, palette, updated, links } = personal;
    const books = personal.books ?? [];
    const hasMedia = Boolean(films.length || tracks.length || books.length || strava?.totals.length);

    return (
        <section className="otc">
            <h2 className="section-label">Off the clock</h2>
            <div className="photos">
                {PHOTOS.map((photo) => (
                    <figure key={photo.src}>
                        <img src={photo.src} alt={photo.alt} width="900" height="1200" loading="lazy" />
                        <figcaption className="meta">{photo.caption}</figcaption>
                    </figure>
                ))}
            </div>

            {hasMedia && (
                <>
                    <p>
                        The colors on this site come from what I&rsquo;ve been watching, reading and listening to: each
                        poster and cover below contributes its most vivid color, and the links and racing balls are
                        tinted to match.
                    </p>

                    {palette.length > 0 && (
                        <ul className="palette" aria-label="Current palette">
                            {palette.map((c) => <Swatch key={`${c.hex}-${c.from}`} color={c} />)}
                        </ul>
                    )}

                    {tracks.length > 0 && (
                        <div className="otc-block">
                            <h3 className="otc-title">
                                On repeat <span className="meta">· last 4 weeks</span>
                            </h3>
                            <ol className="tracks">
                                {tracks.map((t) => (
                                    <li key={t.href}>
                                        <a href={t.href} target="_blank" rel="noreferrer" className="track">
                                            {t.image && <img src={t.image} alt="" width="48" height="48" loading="lazy" />}
                                            <span>
                                                <span className="track-title">{t.title}</span>
                                                <span className="meta">{t.artist}</span>
                                            </span>
                                            {t.color && <i className="chip-dot" style={{ background: t.color.hex }} />}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {films.length > 0 && (
                        <div className="otc-block">
                            <h3 className="otc-title">Recently watched</h3>
                            <Covers
                                items={films}
                                label={(f) => `Poster for ${f.title}`}
                                caption={(f) => (
                                <>
                                        {f.year}
                                        {f.stars && <> · <span className="stars">{f.stars}</span></>}
                                </>
                        )}
                    />
                </div>
            )}

            {books.length > 0 && (
                <div className="otc-block">
                    <h3 className="otc-title">Recently read</h3>
                    <Covers
                        items={books}
                        label={(b) => `Cover of ${b.title}`}
                        caption={(b) => (
                            <>
                                {b.author}
                                {b.stars && <> · <span className="stars">{b.stars}</span></>}
                            </>
                        )}
                    />
                </div>
            )}

            {strava?.totals.length > 0 && (
                <div className="otc-block">
                    <h3 className="otc-title">
                        Moving <span className="meta">· last {strava.days} days</span>
                    </h3>
                    <ul className="moving-totals">
                        {strava.totals.map((t) => (
                            <li key={t.sport}>
                                <span className="moving-sport">{sportName(t.sport)}</span>
                                <span className="moving-big">{t.km} km</span>
                                <span className="meta">
                                    {t.count} {t.count === 1 ? 'activity' : 'activities'} · {duration(t.seconds)}
                                    {t.elevation > 0 && ` · ${t.elevation} m up`}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <ol className="moving-recent">
                        {strava.recent.map((a) => (
                            <li key={a.href}>
                                <a href={a.href} target="_blank" rel="noreferrer">
                                    <span className="meta">{shortDate(a.date)}</span>
                                    <span className="moving-name">{a.name}</span>
                                    <span className="moving-nums">
                                        {a.km} km · {duration(a.seconds)}
                                        {effort(a.sport, a.km, a.seconds) && ` · ${effort(a.sport, a.km, a.seconds)}`}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            <p className="meta otc-foot">
                <span className="otc-links">
                    {[
                        ['Letterboxd', links.letterboxd],
                        ['Goodreads', books.length ? links.goodreads : null],
                        ['Spotify', links.spotify],
                        ['Strava', links.strava],
                    ].filter(([, href]) => href).map(([name, href]) => (
                        <a key={name} href={href} target="_blank" rel="noreferrer">{name}</a>
                    ))}
                </span>
                {updated && <span>Updated {formatDate(updated)}</span>}
            </p>
            </>
            )}
        </section>
    );
};

export default OffTheClock;
