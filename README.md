# amoghg.xyz

Personal site of Amogh Gulati: ML engineer and researcher. React (Create React App), built
as a static site and deployed on Render.

## Philosophy

- **Paper, not an app.** The site should feel like a page from a Muji graph-paper notebook:
  off-white paper, a blue-grey 5mm grid, Space Grotesk for reading, JetBrains Mono for labels,
  square corners. Quiet by default, so the content does the talking.
- **Link to the evidence.** Every claim points somewhere real: the Samudra repo, the papers,
  the patents, the Samsung and Cadbury campaigns, Google Scholar, the CV. A reader should never
  have to take a sentence on faith.
- **One source of truth.** All career content lives in `src/data/profile.js`, kept in step
  with the CV (`cv/cv.tex`). Change it once and every page agrees.
- **Play lives in the margins.** The scroll-driven race is a toy that never blocks reading. It
  runs behind the text, tracks your scroll so the balls stay in view, and only says
  "scroll to race" until you start.
- **Honest physics.** The race is a real simulation: frictionless beads released from rest,
  timed by energy conservation. No fudge factors, and tests check the cycloid and straight-line
  times against their exact formulas.
- **A whole person, within limits.** "Off the clock" shows life outside work (Akhilesh the cat,
  films, music, books, running), but only things that are already public: no review text, no
  routes, no private or followers-only activities, no photo metadata, and no phone number on
  the site.
- **Colors are earned, not chosen.** The accent color and race-ball colors are pulled from the
  posters and album covers of what I've recently watched and listened to, then adjusted to stay
  readable in light and dark mode. The site's look slowly changes with my taste.
- **Cheap, static, and fails soft.** No servers, no databases, no paid APIs, no AI in the loop.
  Everything dynamic happens at build time; a missing key or a broken feed hides one block and
  never breaks the build.

## What's on the site

| Page | What it shows |
|---|---|
| About (`/`) | Intro and links (CV, email, GitHub, LinkedIn, Scholar), Now / Before, selected papers, writing, Off the clock, and today's race |
| Experience | Roles with linked highlights, education, skills |
| Research | Publications and patents, with links |
| Writing (`/blog`) | Notes, currently the CRPS explainer |

**The race.** Each page load picks two of nine descending curves (cycloid, straight line,
Galileo's arc, parabola, √x, logarithm, exponential decay, tanh, exponential growth). Scrolling
sets how far the balls have fallen; the legend shows live heights and time, and the results
list fills in 1st and 2nd as each ball reaches the bottom. The cycloid always wins when it runs.

**Off the clock.** Photos with Akhilesh, then a color strip and recent media:

| Source | Shows | Needs |
|---|---|---|
| Letterboxd | Last 6 films, with ratings and posters | Nothing (public RSS) |
| Spotify | Top 5 tracks of the last 4 weeks | `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` |
| Strava | 28-day totals per sport and last 4 public activities | `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN` |
| Goodreads | Rated or reviewed books from the read shelf | `GOODREADS_USER_ID` (off until set; mine is 39804764) |

## How it works

- `scripts/personal.mjs` runs before every build (`prebuild`). It fetches each source, saves
  small stripped thumbnails to `public/personal/`, picks each image's most vivid color, and
  writes `src/data/personal.json`. Both outputs are git-ignored.
- `src/theme.js` applies the derived colors at startup, overriding the defaults in
  `src/index.css`.
- `.github/workflows/refresh-personal.yml` calls the Render deploy hook daily so the data stays
  fresh (needs the `RENDER_DEPLOY_HOOK_URL` repo secret).

## Updating

| To change | Edit |
|---|---|
| Career content and links | `src/data/profile.js` |
| CV | `cv/cv.tex`, then `tectonic cv/cv.tex --outdir public` |
| Photos and captions | `public/photos/` and `PHOTOS` in `src/components/OffTheClock.js` |
| Colors, fonts, grid, corner radius | tokens at the top of `src/index.css` |
| Race curves | `TRACKS` in `src/components/Brachistochrone.js` |
| Blog posts | `src/components/blogs/`, registered in `BLOGS` in `src/components/BlogsTab.js` |

Spotify and Strava tokens are created once with `scripts/spotify-auth.mjs` and
`scripts/strava-auth.mjs`; the instructions are at the top of each file.

## Running locally

```sh
npm install
npm start          # dev server; creates an empty personal.json if none exists
npm run personal   # fetch fresh Off the clock data
npm test
npm run build
```
