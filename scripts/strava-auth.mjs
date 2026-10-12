// One-time helper to get a Strava refresh token for scripts/personal.mjs.
//
// 1. Create an app at https://www.strava.com/settings/api and set the
//    Authorization Callback Domain to 127.0.0.1
// 2. STRAVA_CLIENT_ID=... STRAVA_CLIENT_SECRET=... node scripts/strava-auth.mjs
// 3. Open the printed URL, approve, and copy the refresh token it prints into
//    Render as STRAVA_REFRESH_TOKEN (alongside the client id and secret).
//
// The `activity:read` scope only exposes activities visible to Everyone or
// Followers; the build script further keeps only Everyone-visible ones.

import { randomBytes } from 'node:crypto';
import http from 'node:http';

const { STRAVA_CLIENT_ID: id, STRAVA_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
    console.error('Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET first.');
    process.exit(1);
}

const REDIRECT = 'http://127.0.0.1:8889/callback';
const state = randomBytes(12).toString('hex');
const authUrl = `https://www.strava.com/oauth/authorize?${new URLSearchParams({
    client_id: id,
    response_type: 'code',
    redirect_uri: REDIRECT,
    approval_prompt: 'force',
    scope: 'activity:read',
    state,
})}`;

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, REDIRECT);
    if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
    }
    if (url.searchParams.get('state') !== state || !url.searchParams.get('code')) {
        res.writeHead(400).end('Authorization failed or was denied.');
        server.close();
        return;
    }
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: id,
            client_secret: secret,
            code: url.searchParams.get('code'),
            grant_type: 'authorization_code',
        }),
    });
    const body = await tokenRes.json();
    if (!body.refresh_token) {
        res.writeHead(500).end('No refresh token returned; check the terminal.');
        console.error(body);
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done. You can close this tab.');
        console.log(`\nSTRAVA_REFRESH_TOKEN=${body.refresh_token}\n`);
    }
    server.close();
});

server.listen(8889, '127.0.0.1', () => {
    console.log(`Open this URL and approve access:\n\n${authUrl}\n`);
});
