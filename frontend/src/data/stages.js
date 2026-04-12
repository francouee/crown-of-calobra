import stravaRoutes from './strava-routes.json'

// Terrain is inferred from elevation gain per km of distance.
// Thresholds (m gained per km ridden):
//   mountain  ≥ 12 m/km
//   hilly      8–12 m/km
//   flat      < 8 m/km
function inferTerrain(elevationGainM, distanceM) {
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

export const STAGES = Object.entries(stravaRoutes)
  .sort(([a], [b]) => Number(a) - Number(b))
  .map(([key, route]) => {
    const id = Number(key)
    const meta = STAGE_META[id] ?? {}
    const terrain = inferTerrain(route.elevation_gain, route.distance)
    return {
      id,
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
  })
