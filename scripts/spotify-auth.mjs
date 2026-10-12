// One-time helper to get a Spotify refresh token for scripts/personal.mjs.
//
// 1. Create an app at https://developer.spotify.com/dashboard and add the
//    redirect URI http://127.0.0.1:8888/callback
// 2. SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-auth.mjs
// 3. Open the printed URL, approve, and copy the refresh token it prints into
//    Render as SPOTIFY_REFRESH_TOKEN (alongside the client id and secret).

import { randomBytes } from 'node:crypto';
import http from 'node:http';

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
    console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
    process.exit(1);
}

const REDIRECT = 'http://127.0.0.1:8888/callback';
const state = randomBytes(12).toString('hex');
const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: id,
    response_type: 'code',
    redirect_uri: REDIRECT,
    scope: 'user-top-read',
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
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: url.searchParams.get('code'),
            redirect_uri: REDIRECT,
        }),
    });
    const body = await tokenRes.json();
    if (!body.refresh_token) {
        res.writeHead(500).end('No refresh token returned; check the terminal.');
        console.error(body);
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done. You can close this tab.');
        console.log(`\nSPOTIFY_REFRESH_TOKEN=${body.refresh_token}\n`);
    }
    server.close();
});

server.listen(8888, '127.0.0.1', () => {
    console.log(`Open this URL and approve access:\n\n${authUrl}\n`);
});
