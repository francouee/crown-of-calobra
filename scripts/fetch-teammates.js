#!/usr/bin/env node
'use strict'

const https = require('node:https')
const fs = require('node:fs')
const path = require('node:path')

// ── Paths ─────────────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..')
const TEAMMATES_FILE = path.join(ROOT, 'frontend', 'src', 'data', 'teammates.json')

// ── Load .env ─────────────────────────────────────────────────────────────────

const envFile = path.join(ROOT, '.env')
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  })
}

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = process.env

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

async function getAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET,
    refresh_token: refreshToken,
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

async function fetchAthleteProfile(token) {
  const res = await httpsRequest({
    hostname: 'www.strava.com',
    path: '/api/v3/athlete',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status !== 200) {
    throw new Error(`Athlete profile failed (${res.status}): ${res.body.toString()}`)
  }

  return JSON.parse(res.body.toString())
}

async function fetchAthleteStats(stravaAthleteId, token) {
  const res = await httpsRequest({
    hostname: 'www.strava.com',
    path: `/api/v3/athletes/${stravaAthleteId}/stats`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status !== 200) {
    throw new Error(`Athlete stats failed (${res.status}): ${res.body.toString()}`)
  }

  return JSON.parse(res.body.toString())
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
    console.error('Missing environment variables. Create a .env file at the project root with:')
    console.error('  STRAVA_CLIENT_ID=...')
    console.error('  STRAVA_CLIENT_SECRET=...')
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(TEAMMATES_FILE, 'utf8'))

  for (const athlete of data) {
    const label = `Athlete ${athlete.id} (${athlete.firstName} ${athlete.name})`

    if (!athlete.strava_athlete_id) {
      console.log(`${label}: no Strava ID, skipping`)
      continue
    }

    const refreshTokenKey = `STRAVA_REFRESH_TOKEN_${athlete.id}`
    const refreshToken = process.env[refreshTokenKey]

    if (!refreshToken) {
      console.warn(`${label}: ${refreshTokenKey} not set, skipping`)
      continue
    }

    try {
      const token = await getAccessToken(refreshToken)

      if (athlete.firstName === 'TBD') {
        const profile = await fetchAthleteProfile(token)
        athlete.firstName = profile.firstname
        athlete.name = profile.lastname.toUpperCase()
        console.log(`${label}: profile updated → ${athlete.firstName} ${athlete.name}`)
      }

      const stats = await fetchAthleteStats(athlete.strava_athlete_id, token)

      const km = Math.round((stats.ytd_ride_totals.distance / 1000) * 10) / 10
      const elevation = Math.round(stats.ytd_ride_totals.elevation_gain)
      const best_day_elevation = Math.round(stats.biggest_climb_elevation_gain)

      athlete.stats.km = km
      athlete.stats.elevation = elevation
      athlete.stats.best_day_elevation = best_day_elevation

      console.log(`${label}: km=${km}, elevation=${elevation}, D+=${best_day_elevation}`)
    } catch (err) {
      console.error(`${label}: error — ${err.message}`)
    }
  }

  fs.writeFileSync(TEAMMATES_FILE, JSON.stringify(data, null, 2) + '\n')
  console.log('Done.')
}

main().catch(err => {
  console.error(`\nError: ${err.message}`)
  process.exit(1)
})
