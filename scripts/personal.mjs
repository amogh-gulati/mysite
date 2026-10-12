// Builds src/data/personal.json from Letterboxd and Spotify, saves small
// thumbnails to public/personal/, and derives the site's accent colors from
// the artwork. Runs before `npm run build` (see package.json).
//
//   node scripts/personal.mjs              fetch fresh data
//   node scripts/personal.mjs --if-missing only write a placeholder if no data yet
//
// Env: LETTERBOXD_USERNAME (default amogh7777), GOODREADS_USER_ID (optional;
// read shelf, rated or reviewed books only), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN,
// STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN. Missing
// credentials or a failed fetch never fail the build; that source is just
// left empty.

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_JSON = path.join(ROOT, 'src/data/personal.json');
const IMG_DIR = path.join(ROOT, 'public/personal');

const LETTERBOXD_USER = process.env.LETTERBOXD_USERNAME || 'amogh7777';
// Off unless set (mine is 39804764).
const GOODREADS_USER = process.env.GOODREADS_USER_ID;
const FILM_COUNT = 6;
const TRACK_COUNT = 5;
const BOOK_COUNT = 6;
const ACTIVITY_COUNT = 4;
const STATS_DAYS = 28;

// Must match --paper in src/index.css for the contrast checks.
const PAPER = { light: '#f5f3ec', dark: '#16191d' };

const EMPTY = { updated: null, films: [], tracks: [], books: [], strava: null, palette: [], theme: null, links: {} };

const log = (...args) => console.log('[personal]', ...args);

// ---------- color math ----------

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

const rgbToHsl = ([r, g, b]) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return [h * 60, s, l];
};

const hslToRgb = ([h, s, l]) => {
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
};

const luminance = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

// Darken (light mode) or lighten (dark mode) until the color clears `ratio`
// against the paper, keeping hue and saturation.
const fitContrast = (hex, mode, ratio) => {
    const paper = hexToRgb(PAPER[mode]);
    let [h, s, l] = rgbToHsl(hexToRgb(hex));
    s = Math.max(s, 0.45);
    for (let i = 0; i < 100 && contrast(hslToRgb([h, s, l]), paper) < ratio; i++) {
        l += mode === 'light' ? -0.01 : 0.01;
    }
    return rgbToHex(hslToRgb([h, s, Math.min(Math.max(l, 0), 1)]));
};

const hueDistance = (a, b) => {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
};

// The most vivid well-represented color in an image: pixels are bucketed by
// hue, scored by population × saturation, and the winning bucket is averaged.
const dominantColor = async (buffer) => {
    const { data } = await sharp(buffer).resize(48, 48, { fit: 'cover' }).removeAlpha().raw()
        .toBuffer({ resolveWithObject: true });
    const bins = new Map();
    let sum = [0, 0, 0];
    for (let i = 0; i < data.length; i += 3) {
        const rgb = [data[i], data[i + 1], data[i + 2]];
        sum = sum.map((v, j) => v + rgb[j]);
        const [h, s, l] = rgbToHsl(rgb);
        if (s < 0.2 || l < 0.12 || l > 0.9) continue;
        const key = Math.floor(h / 15);
        const bin = bins.get(key) || { score: 0, rgb: [0, 0, 0], n: 0 };
        bin.score += s;
        bin.rgb = bin.rgb.map((v, j) => v + rgb[j]);
        bin.n += 1;
        bins.set(key, bin);
    }
    const best = [...bins.values()].sort((a, b) => b.score - a.score)[0];
    const pixels = data.length / 3;
    if (!best || best.n < pixels * 0.03) {
        return { hex: rgbToHex(sum.map((v) => v / pixels)), vivid: false };
    }
    return { hex: rgbToHex(best.rgb.map((v) => v / best.n)), vivid: true };
};

// ---------- fetching ----------

const fetchOk = async (url, init) => {
    const res = await fetch(url, { ...init, headers: { 'User-Agent': 'amogh-website/1.0', ...init?.headers } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return res;
};

const tag = (xml, name) => {
    const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
    return m ? m[1].trim().replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1').trim() || null : null;
};

const decodeEntities = (s) => s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'");

const stars = (rating) => {
    if (rating == null) return null;
    const full = Math.floor(rating);
    return '★'.repeat(full) + (rating - full >= 0.5 ? '½' : '');
};

const fetchLetterboxd = async () => {
    const xml = await (await fetchOk(`https://letterboxd.com/${LETTERBOXD_USER}/rss/`)).text();
    const items = xml.split('<item>').slice(1);
    return items
        .map((item) => {
            const title = tag(item, 'letterboxd:filmTitle');
            if (!title) return null; // lists, not diary entries
            const rating = tag(item, 'letterboxd:memberRating');
            return {
                title: decodeEntities(title),
                year: tag(item, 'letterboxd:filmYear'),
                rating: rating ? Number(rating) : null,
                stars: stars(rating ? Number(rating) : null),
                watched: tag(item, 'letterboxd:watchedDate'),
                href: tag(item, 'link'),
                image: item.match(/<img src="([^"]+)"/)?.[1] ?? null,
            };
        })
        .filter(Boolean)
        .slice(0, FILM_COUNT);
};

const fetchSpotify = async () => {
    const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
    if (!id || !secret || !refresh) {
        log('Spotify credentials not set; skipping music.');
        return { tracks: [], profile: null };
    }
    const tokenRes = await fetchOk('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
    });
    const { access_token: token } = await tokenRes.json();
    const api = async (p) => (await fetchOk(`https://api.spotify.com/v1${p}`, {
        headers: { Authorization: `Bearer ${token}` },
    })).json();

    const [top, me] = await Promise.all([
        api(`/me/top/tracks?time_range=short_term&limit=${TRACK_COUNT}`),
        api('/me').catch(() => null),
    ]);
    return {
        tracks: top.items.map((t) => ({
            title: t.name,
            artist: t.artists.map((a) => a.name).join(', '),
            href: t.external_urls.spotify,
            // Smallest image that is still ≥ 160px.
            image: [...t.album.images].sort((a, b) => a.width - b.width).find((i) => i.width >= 160)?.url
                ?? t.album.images[0]?.url ?? null,
        })),
        profile: me?.external_urls?.spotify ?? null,
    };
};

// Drops series tags and long marketing subtitles:
// "The Art of Fielding: A Humorous and Deeply Satisfying..." -> "The Art of Fielding".
const shortTitle = (title) => {
    const base = title.replace(/\s*\([^)]*#[^)]*\)\s*$/, '');
    return base.length > 40 && base.includes(': ') ? base.split(': ')[0] : base;
};

// Books I've finished and rated or reviewed, newest first.
const fetchGoodreads = async () => {
    if (!GOODREADS_USER) {
        log('GOODREADS_USER_ID not set; skipping books.');
        return null;
    }
    const xml = await (await fetchOk(
        `https://www.goodreads.com/review/list_rss/${GOODREADS_USER}?shelf=read&per_page=100`,
    )).text();
    return xml.split('<item>').slice(1)
        .map((item) => {
            const rating = Number(tag(item, 'user_rating')) || null;
            const reviewed = Boolean(tag(item, 'user_review'));
            if (!rating && !reviewed) return null;
            const cover = tag(item, 'book_large_image_url');
            return {
                title: shortTitle(decodeEntities(tag(item, 'title'))),
                author: decodeEntities(tag(item, 'author_name') || ''),
                rating,
                stars: stars(rating),
                reviewed,
                href: `https://www.goodreads.com/book/show/${tag(item, 'book_id')}`,
                image: cover && !cover.includes('/nophoto/') ? cover : null,
            };
        })
        .filter(Boolean)
        .slice(0, BOOK_COUNT);
};

// Strava rotates refresh tokens occasionally; a stale one stops working, so
// say so loudly when it changes.
const fetchStrava = async () => {
    const { STRAVA_CLIENT_ID: id, STRAVA_CLIENT_SECRET: secret, STRAVA_REFRESH_TOKEN: refresh } = process.env;
    if (!id || !secret || !refresh) {
        log('Strava credentials not set; skipping activities.');
        return null;
    }
    const token = await (await fetchOk('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: id, client_secret: secret, grant_type: 'refresh_token', refresh_token: refresh,
        }),
    })).json();
    if (token.refresh_token && token.refresh_token !== refresh) {
        log('Strava issued a new refresh token. If Strava starts failing, rerun scripts/strava-auth.mjs '
            + 'and update STRAVA_REFRESH_TOKEN.');
    }
    const after = Math.floor(Date.now() / 1000) - STATS_DAYS * 86400;
    const activities = await (await fetchOk(
        `https://www.strava.com/api/v3/athlete/activities?per_page=100&after=${after}`,
        { headers: { Authorization: `Bearer ${token.access_token}` } },
    )).json();

    // Only what's already public on Strava.
    const visible = activities
        .filter((a) => !a.private && (a.visibility ?? 'everyone') === 'everyone')
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    const totals = {};
    for (const a of visible) {
        const t = totals[a.sport_type] || { sport: a.sport_type, count: 0, km: 0, seconds: 0, elevation: 0 };
        t.count += 1;
        t.km += a.distance / 1000;
        t.seconds += a.moving_time;
        t.elevation += a.total_elevation_gain || 0;
        totals[a.sport_type] = t;
    }
    return {
        days: STATS_DAYS,
        totals: Object.values(totals)
            .sort((a, b) => b.seconds - a.seconds)
            .map((t) => ({ ...t, km: Math.round(t.km * 10) / 10, elevation: Math.round(t.elevation) })),
        recent: visible.slice(0, ACTIVITY_COUNT).map((a) => ({
            name: a.name,
            sport: a.sport_type,
            date: a.start_date_local.slice(0, 10),
            km: Math.round(a.distance / 100) / 10,
            seconds: a.moving_time,
            href: `https://www.strava.com/activities/${a.id}`,
        })),
        profile: activities[0]?.athlete?.id ? `https://www.strava.com/athletes/${activities[0].athlete.id}` : null,
    };
};

// Downloads artwork, writes a small webp next to the site, and attaches its color.
const withArtwork = async (items, size) => {
    const out = [];
    for (const item of items) {
        if (!item.image) {
            out.push({ ...item, image: null, color: null });
            continue;
        }
        try {
            const buffer = Buffer.from(await (await fetchOk(item.image)).arrayBuffer());
            const name = `${createHash('sha1').update(item.image).digest('hex').slice(0, 12)}.webp`;
            await sharp(buffer).resize(size.w, size.h, { fit: 'cover' }).webp({ quality: 78 })
                .toFile(path.join(IMG_DIR, name));
            out.push({ ...item, image: `/personal/${name}`, color: await dominantColor(buffer) });
        } catch (err) {
            log(`artwork failed for ${item.title}: ${err.message}`);
            out.push({ ...item, image: null, color: null });
        }
    }
    return out;
};

// ---------- theme ----------

const buildTheme = (palette) => {
    const vivid = palette.filter((p) => p.vivid);
    if (!vivid.length) return null;
    const hsl = vivid.map((p) => ({ ...p, hsl: rgbToHsl(hexToRgb(p.hex)) }));
    const bySaturation = [...hsl].sort((a, b) => b.hsl[1] - a.hsl[1]);

    const accent = bySaturation[0];
    // Race balls: the most saturated pair that sits far apart in hue.
    let pair = [bySaturation[0], bySaturation[1] ?? bySaturation[0]];
    let bestScore = -1;
    for (let i = 0; i < hsl.length; i++) {
        for (let j = i + 1; j < hsl.length; j++) {
            const score = hueDistance(hsl[i].hsl[0], hsl[j].hsl[0]) * (hsl[i].hsl[1] + hsl[j].hsl[1]);
            if (score > bestScore) {
                bestScore = score;
                pair = [hsl[i], hsl[j]];
            }
        }
    }

    const mode = (m) => ({
        accent: fitContrast(accent.hex, m, 4.5),
        curve: fitContrast(pair[0].hex, m, 3),
        line: fitContrast(pair[1].hex, m, 3),
    });
    return {
        light: mode('light'),
        dark: mode('dark'),
        sources: { accent: accent.from, curve: pair[0].from, line: pair[1].from },
    };
};

// ---------- main ----------

const main = async () => {
    if (process.argv.includes('--if-missing') && existsSync(OUT_JSON)) return;
    if (process.argv.includes('--if-missing')) {
        await writeFile(OUT_JSON, `${JSON.stringify(EMPTY, null, 2)}\n`);
        log('wrote empty placeholder; run `npm run personal` to fetch real data.');
        return;
    }

    const previous = existsSync(OUT_JSON) ? JSON.parse(await readFile(OUT_JSON, 'utf8')) : EMPTY;

    const attempt = (name, fn) => fn().catch((err) => {
        log(`${name} failed: ${err.message}`);
        return null;
    });
    const [films, spotify, books, strava] = await Promise.all([
        attempt('Letterboxd', fetchLetterboxd),
        attempt('Spotify', fetchSpotify),
        attempt('Goodreads', fetchGoodreads),
        attempt('Strava', fetchStrava),
    ]);

    // If everything failed, keep whatever we had rather than blanking the section.
    if (!films && !spotify && !books && !strava && previous.updated) {
        log('all sources failed; keeping previous data.');
        return;
    }

    await rm(IMG_DIR, { recursive: true, force: true });
    await mkdir(IMG_DIR, { recursive: true });
    const filmItems = films ? await withArtwork(films, { w: 240, h: 360 }) : [];
    const trackItems = spotify ? await withArtwork(spotify.tracks, { w: 160, h: 160 }) : [];
    const bookItems = books ? await withArtwork(books, { w: 240, h: 360 }) : [];

    const palette = [
        ...trackItems.map((t) => ({ ...t.color, from: `${t.title} by ${t.artist}`, kind: 'track' })),
        ...filmItems.map((f) => ({ ...f.color, from: `${f.title} (${f.year})`, kind: 'film' })),
        ...bookItems.map((b) => ({ ...b.color, from: `${b.title} by ${b.author}`, kind: 'book' })),
    ].filter((p) => p.hex);

    const data = {
        updated: new Date().toISOString(),
        films: filmItems,
        tracks: trackItems,
        books: bookItems,
        strava,
        palette,
        theme: buildTheme(palette),
        links: {
            letterboxd: `https://letterboxd.com/${LETTERBOXD_USER}/`,
            spotify: spotify?.profile ?? null,
            goodreads: GOODREADS_USER ? `https://www.goodreads.com/user/show/${GOODREADS_USER}` : null,
            strava: strava?.profile ?? null,
        },
    };

    await writeFile(OUT_JSON, `${JSON.stringify(data, null, 2)}\n`);
    log(`wrote ${filmItems.length} films, ${trackItems.length} tracks, ${bookItems.length} books, `
        + `${strava ? strava.recent.length : 0} activities, ${palette.length} colors.`);
};

main().catch((err) => {
    // Never fail the site build over this section.
    log(`unexpected error: ${err.stack || err}`);
    if (!existsSync(OUT_JSON)) return writeFile(OUT_JSON, `${JSON.stringify(EMPTY, null, 2)}\n`);
    return undefined;
});
