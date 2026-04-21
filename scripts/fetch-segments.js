#!/usr/bin/env node
'use strict'

/**
 * fetch-segments.js
 *
 * Fetches Strava segment metadata and the "following" leaderboard for each
 * segment defined in stage-segments.json.
 *
 * Requirements:
 *   - STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN in .env
 *   - The token owner must follow all teammates on Strava
 *   - Teammates must have public profiles (or follow the token owner back)
 *
 * Usage:
 *   node scripts/fetch-segments.js
 */

const https = require('node:https')
const fs = require('node:fs')
const path = require('node:path')

// ── Paths ─────────────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..')
const FRONTEND = path.join(ROOT, 'frontend')
const SEGMENTS_FILE = path.join(FRONTEND, 'src', 'data', 'stage-segments.json')
const TEAMMATES_FILE = path.join(FRONTEND, 'src', 'data', 'teammates.json')

// ── Load .env ─────────────────────────────────────────────────────────────────

const envFile = path.join(ROOT, '.env')
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  })
}

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function httpsGet(path_, token) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.strava.com',
      path: path_,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      rejectUnauthorized: false,
    }, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(Buffer.concat(chunks).toString()) }))
    })
    req.on('error', reject)
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

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.strava.com',
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
      rejectUnauthorized: false,
    }, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks).toString())
        if (res.statusCode !== 200) reject(new Error(`OAuth failed: ${JSON.stringify(data)}`))
        else resolve(data.access_token)
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Segment fetchers ──────────────────────────────────────────────────────────

async function fetchSegmentMeta(segmentId, token) {
  const res = await httpsGet(`/api/v3/segments/${segmentId}`, token)
  if (res.status !== 200) throw new Error(`Segment ${segmentId} meta failed (${res.status})`)
  return res.body
}

async function fetchFollowingLeaderboard(segmentId, token) {
  // following=true returns efforts from athletes the token owner follows.
  // Requires a Strava subscription on the token owner's account; otherwise
  // returns only the token owner's own entry.
  const res = await httpsGet(
    `/api/v3/segments/${segmentId}/leaderboard?following=true&per_page=200`,
    token,
  )
  if (res.status === 402) {
    console.warn(`  ⚠  Segment ${segmentId}: following leaderboard requires Strava subscription. Falling back to own effort.`)
    return fetchOwnEffort(segmentId, token)
  }
  if (res.status !== 200) throw new Error(`Leaderboard ${segmentId} failed (${res.status}): ${JSON.stringify(res.body)}`)
  return res.body.entries ?? []
}

async function fetchOwnEffort(segmentId, token) {
  // Fetches the token owner's starred segment efforts as a fallback
  const res = await httpsGet(
    `/api/v3/segment_efforts?segment_id=${segmentId}&per_page=1`,
    token,
  )
  if (res.status !== 200 || !res.body.length) return []
  const effort = res.body[0]
  return [{
    athlete_name: effort.athlete?.firstname + ' ' + effort.athlete?.lastname,
    athlete_id: effort.athlete?.id,
    elapsed_time: effort.elapsed_time,
    rank: 1,
  }]
}

// ── Time formatting ───────────────────────────────────────────────────────────

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
    console.error('Missing .env variables: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN')
    process.exit(1)
  }

  const teammates = JSON.parse(fs.readFileSync(TEAMMATES_FILE, 'utf8'))
  // Build a map strava_athlete_id → teammate id for matching leaderboard entries
  const stravaIdToTeammate = {}
  for (const t of teammates) {
    if (t.strava_athlete_id) stravaIdToTeammate[t.strava_athlete_id] = t.id
  }

  const segments = JSON.parse(fs.readFileSync(SEGMENTS_FILE, 'utf8'))

  console.log('Fetching Strava access token…')
  const token = await getAccessToken()
  console.log('Token obtained.\n')

  for (const [stageId, segList] of Object.entries(segments)) {
    console.log(`\n── Stage ${stageId} ──`)
    for (const seg of segList) {
      console.log(`  Segment: ${seg.id} — ${seg.name}`)

      // 1. Refresh metadata
      try {
        const meta = await fetchSegmentMeta(seg.id, token)
        seg.name = meta.name
        seg.distance_m = Math.round(meta.distance)
        seg.elevation_m = Math.round(meta.total_elevation_gain)
        seg.avg_grade = Math.round(meta.average_grade * 10) / 10
        seg.url = `https://www.strava.com/segments/${seg.id}`
        console.log(`    Meta: ${meta.name} — ${seg.distance_m}m / ${seg.avg_grade}%`)
      } catch (e) {
        console.warn(`    ⚠ Meta fetch failed: ${e.message}`)
      }

      // 2. Fetch following leaderboard
      try {
        const entries = await fetchFollowingLeaderboard(seg.id, token)
        console.log(`    Leaderboard entries: ${entries.length}`)

        // Match each entry to a teammate by strava_athlete_id
        const results = []
        for (const entry of entries) {
          const athleteStravaId = entry.athlete_id
          const teammateId = stravaIdToTeammate[athleteStravaId]
          if (teammateId) {
            results.push({
              athlete_id: teammateId,
              time: formatTime(entry.elapsed_time),
            })
            const t = teammates.find(x => x.id === teammateId)
            console.log(`    • ${t.firstName} ${t.name}: ${formatTime(entry.elapsed_time)}`)
          }
        }

        // Preserve any manually entered results for athletes not in the leaderboard
        const updatedAthleteIds = new Set(results.map(r => r.athlete_id))
        for (const existing of (seg.results ?? [])) {
          if (!updatedAthleteIds.has(existing.athlete_id)) {
            results.push(existing)
            console.log(`    (kept manual entry for athlete_id ${existing.athlete_id})`)
          }
        }

        seg.results = results
      } catch (e) {
        console.warn(`    ⚠ Leaderboard fetch failed: ${e.message}`)
      }
    }
  }

  fs.writeFileSync(SEGMENTS_FILE, JSON.stringify(segments, null, 2) + '\n')
  console.log(`\n✓ Saved: ${path.relative(ROOT, SEGMENTS_FILE)}`)
}

main().catch(err => {
  console.error(`\nError: ${err.message}`)
  process.exit(1)
})
