import { useState, useEffect } from 'react'
import { gpx as toGeoJSON } from '@tmcw/togeojson'
import { smoothStaircases } from '../utils/gradients.js'
import { INTERVAL_M } from '../config.js'

const EARTH_R = 6371000

function haversine(p1, p2) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(p2.lat - p1.lat)
  const dLon = toRad(p2.lon - p1.lon)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLon / 2) ** 2
  return EARTH_R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

/**
 * Resamples a raw GPX track so that consecutive points are spaced
 * exactly `intervalMeters` apart (linear interpolation along segments).
 */
function resampleTrack(points, intervalMeters) {
  if (points.length < 2) return points

  const result = [points[0]]
  let accumulated = 0

  for (let i = 1; i < points.length; i++) {
    const segDist = haversine(points[i - 1], points[i])
    let remaining = segDist

    while (accumulated + remaining >= intervalMeters) {
      const t = (intervalMeters - accumulated) / remaining
      const prev = result[result.length - 1]
      const next = points[i]

      // Interpolate position using the proportion along the current sub-segment
      const segStart = {
        lat: lerp(points[i - 1].lat, points[i].lat, 1 - remaining / segDist),
        lon: lerp(points[i - 1].lon, points[i].lon, 1 - remaining / segDist),
        ele: lerp(points[i - 1].ele, points[i].ele, 1 - remaining / segDist),
      }
      const newPt = {
        lat: lerp(segStart.lat, next.lat, t),
        lon: lerp(segStart.lon, next.lon, t),
        ele: lerp(segStart.ele, next.ele, t),
      }
      result.push(newPt)
      remaining -= intervalMeters - accumulated
      accumulated = 0
    }

    accumulated += remaining
  }

  // Always include the last point
  const last = points[points.length - 1]
  const prev = result[result.length - 1]
  if (haversine(prev, last) > 1) result.push(last)

  return result
}

/**
 * Fetches and parses a GPX file.
 * Returns { track, loading, error } where track is an array of
 * { lat, lon, ele } objects resampled every INTERVAL_M meters.
 */

export function useGpxTrack(gpxPath) {
  const [track, setTrack] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!gpxPath) return
    setLoading(true)
    setError(null)
    setTrack(null)
    setStats(null)

    fetch(`${import.meta.env.BASE_URL}${gpxPath.replace(/^\//, '')}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load GPX: ${r.status}`)
        return r.text()
      })
      .then((text) => {
        const dom = new DOMParser().parseFromString(text, 'application/xml')
        const geojson = toGeoJSON(dom)
        const feature = geojson.features.find(
          (f) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
        )
        if (!feature) throw new Error('No track found in GPX')

        let coords
        if (feature.geometry.type === 'MultiLineString') {
          coords = feature.geometry.coordinates.flat()
        } else {
          coords = feature.geometry.coordinates
        }

        // togeojson coordinates are [lon, lat, ele?]
        const points = coords.map(([lon, lat, ele = 0]) => ({ lat, lon, ele }))
        const smoothed = smoothStaircases(points)

        // Compute distance and elevation gain on smoothed GPX points
        let distance = 0
        let elevationGain = 0
        for (let i = 1; i < smoothed.length; i++) {
          distance += haversine(smoothed[i - 1], smoothed[i])
          const diff = smoothed[i].ele - smoothed[i - 1].ele
          if (diff > 0) elevationGain += diff
        }
        setStats({
          distanceKm: Math.round(distance / 100) / 10,
          elevationGainM: Math.round(elevationGain),
        })
        setTrack(resampleTrack(smoothed, INTERVAL_M))
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [gpxPath])

  return { track, stats, loading, error }
}
