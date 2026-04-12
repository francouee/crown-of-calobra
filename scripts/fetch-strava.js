#!/usr/bin/env node
'use strict'

const https = require('node:https')
const fs = require('node:fs')
const path = require('node:path')

// ── Paths ─────────────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..')
const FRONTEND = path.join(ROOT, 'frontend')
const GPX_DIR = path.join(FRONTEND, 'public', 'gpx')
const META_OUT = path.join(FRONTEND, 'src', 'data', 'strava-routes.json')

// ── Load .env ─────────────────────────────────────────────────────────────────

const envFile = path.join(ROOT, '.env')
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  })
}

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env

// ── Stage → Strava route ID mapping ──────────────────────────────────────────
// Add route IDs here as you link more stages to Strava routes.

const STRAVA_ROUTES = {
  1: '3344944257020996360',
  2: '3477722180890340586',
  3: '3478463895839646202',
  4: '3478419423307930224',
  5: '3478416891530131894',
  6: '3478423919759871600'
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ ...options, rejectUnauthorized: false }, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve({
        status: res.statusCode,
        body: Buffer.concat(chunks),
      }))
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET,
    refresh_token: STRAVA_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  }).toString()

  const res = await httpsRequest({
    hostname: 'www.strava.com',
    path: '/oauth/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body)

  if (res.status !== 200) {
    throw new Error(`OAuth failed (${res.status}): ${res.body.toString()}`)
  }

  return JSON.parse(res.body.toString()).access_token
}

async function fetchRouteMeta(routeId, token) {
  const res = await httpsRequest({
    hostname: 'www.strava.com',
    path: `/api/v3/routes/${routeId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status !== 200) {
    throw new Error(`Route metadata failed (${res.status}): ${res.body.toString()}`)
  }

  return JSON.parse(res.body.toString())
}

async function fetchRouteGpx(routeId, token) {
  const res = await httpsRequest({
    hostname: 'www.strava.com',
    path: `/api/v3/routes/${routeId}/export_gpx`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status !== 200) {
    throw new Error(`GPX export failed (${res.status}): ${res.body.toString()}`)
  }

  return res.body
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
    console.error('Missing environment variables. Create a .env file at the project root with:')
    console.error('  STRAVA_CLIENT_ID=...')
    console.error('  STRAVA_CLIENT_SECRET=...')
    console.error('  STRAVA_REFRESH_TOKEN=...')
    process.exit(1)
  }

  fs.mkdirSync(GPX_DIR, { recursive: true })

  console.log('Fetching Strava access token…')
  const token = await getAccessToken()
  console.log('Access token obtained.\n')

  const meta = {}

  for (const [stageNum, routeId] of Object.entries(STRAVA_ROUTES)) {
    if (!routeId) {
      console.log(`Stage ${stageNum}: no Strava route ID, skipping.`)
      continue
    }

    console.log(`Stage ${stageNum} (route ${routeId})`)

    const route = await fetchRouteMeta(routeId, token)
    meta[stageNum] = {
      name: route.name,
      description: route.description || '',
      distance: route.distance,
      elevation_gain: route.elevation_gain,
      updated_at: route.updated_at,
    }
    console.log(`  Metadata: "${route.name}"`)

    const gpxBuffer = await fetchRouteGpx(routeId, token)
    const gpxPath = path.join(GPX_DIR, `stage-${stageNum}.gpx`)
    fs.writeFileSync(gpxPath, gpxBuffer)
    console.log(`  GPX saved: ${path.relative(ROOT, gpxPath)}`)
  }

  fs.writeFileSync(META_OUT, JSON.stringify(meta, null, 2) + '\n')
  console.log(`\nMetadata saved: ${path.relative(ROOT, META_OUT)}`)
  console.log('\nDone. Run "npm run dev" in frontend/ to see the changes.')
}

main().catch(err => {
  console.error(`\nError: ${err.message}`)
  process.exit(1)
})
