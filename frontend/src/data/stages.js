import stravaRoutes from './strava-routes.json'

// Terrain is inferred from elevation gain per km of distance.
// Thresholds (m gained per km ridden):
//   mountain  ≥ 12 m/km
//   hilly      8–12 m/km
//   flat      < 8 m/km
function inferTerrain(elevationGainM, distanceM) {
  if (distanceM < 70000) return 'rest'
  if (distanceM > 200000) return 'big_boss'
  const gainPerKm = elevationGainM / (distanceM / 1000)
  if (gainPerKm >= 12) return 'mountain'
  if (gainPerKm >= 8) return 'hilly'
  return 'flat'
}

// Manual metadata — only fields that cannot be derived from Strava/GPX.
// Add start, finish, and description for each stage here.
const STAGE_META = {
  1: {
    start: '',
    finish: '',
    description: '',
  },
  2: {
    start: 'Alcúdia',
    finish: 'Formentor',
    description: '',
  },
  3: {
    start: '',
    finish: '',
    description: '',
  },
  4: {
    start: '',
    finish: '',
    description: '',
  },
  5: {
    start: '',
    finish: '',
    description: '',
  },
  6: {
    start: '',
    finish: '',
    description: '',
  },
}

// Race start date — Stage 1 is on this date, each subsequent stage is +1 day.
const RACE_START = new Date('2026-04-13')

// The first SELECTED_COUNT routes in strava-routes.json are the confirmed race
// stages. Everything beyond that is treated as a proposal.
const SELECTED_COUNT = 6

function buildStage(id, route, meta = {}, stageIndex = null) {
  const terrain = inferTerrain(route.elevation_gain, route.distance)
  let date = null
  if (stageIndex !== null) {
    const d = new Date(RACE_START)
    d.setDate(RACE_START.getDate() + stageIndex)
    date = d.toISOString().slice(0, 10)
  }
  return {
    id,
    date,
    name: route.name,
    subtitle: `Stage ${id} · ${terrain.charAt(0).toUpperCase() + terrain.slice(1)}`,
    terrain,
    start: meta.start ?? '',
    finish: meta.finish ?? '',
    description: meta.description ?? '',
    gpx: `/gpx/stage-${id}.gpx`,
    strava_route_id: route.route_id ?? null,
    strava_url: route.route_id
      ? `https://www.strava.com/routes/${route.route_id}`
      : null,
  }
}

const allEntries = Object.entries(stravaRoutes).sort(([a], [b]) => Number(a) - Number(b))

export const STAGES = allEntries.slice(0, SELECTED_COUNT).map(([key, route], i) => {
  const id = Number(key)
  return buildStage(id, route, STAGE_META[id] ?? {}, i)
})

export const PROPOSALS = allEntries.slice(SELECTED_COUNT).map(([key, route]) => {
  const id = Number(key)
  return buildStage(id, route, STAGE_META[id] ?? {}, null)
})
