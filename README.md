vibecoded mess

## Updating content

- Site text and links: `src/data/profile.js`
- CV: edit `cv/cv.tex`, then `tectonic cv/cv.tex --outdir public` (writes `public/cv.pdf`)
- Off the clock (films, music, books, activity, site colors): generated at build time by
  `scripts/personal.mjs`. Run `npm run personal` locally to refresh. Render env vars:
  `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` (get it once with
  `scripts/spotify-auth.mjs`), `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`
  (`scripts/strava-auth.mjs`), optional `LETTERBOXD_USERNAME`, and `GOODREADS_USER_ID` (unset = no books section; mine is 39804764). A daily GitHub Action hits the Render deploy hook
  (`RENDER_DEPLOY_HOOK_URL` repo secret) to rebuild.
