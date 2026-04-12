export const GRADIENT_SCALE = [
  { label: 'Downhill', max: 0,        color: '#d1fae5' },
  { label: '0–2%',     max: 2,        color: '#a7f3d0' },
  { label: '2–4%',     max: 4,        color: '#6ee7b7' },
  { label: '4–6%',     max: 6,        color: '#34d399' },
  { label: '6–8%',     max: 8,        color: '#10b981' },
  { label: '8–10%',    max: 10,       color: '#059669' },
  { label: '>10%',     max: Infinity, color: '#064e3b' },
]

export function gradientColor(pct) {
  if (pct < 0) return GRADIENT_SCALE[0].color
  for (const { max, color } of GRADIENT_SCALE.slice(1)) {
    if (pct < max) return color
  }
  return GRADIENT_SCALE[GRADIENT_SCALE.length - 1].color
}

export function haversineMeters(p1, p2) {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(p2.lat - p1.lat)
  const dLon = toRad(p2.lon - p1.lon)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Gradient thresholds for staircase detection
const SPIKE_GRAD = 20   // % — gradient that qualifies as a quantization spike
const FLAT_GRAD  = 0.1  // % — gradient considered effectively zero (flat plateau)

/**
 * Implements the following rule on the raw forward-gradient sequence:
 *
 *   For each index t where g(t) > SPIKE_GRAD AND g(t-1) ≈ 0:
 *     Find j = the greatest k such that g(t-k) ≈ 0 AND g(t-k-1) ≇ 0.
 *     (i.e. the start of the flat plateau that precedes the spike.)
 *     Linearly interpolate elevations of all interior points j+1 … t-1
 *     between e(j) and e(t).
 *
 * All detection uses the ORIGINAL raw gradients so previously-patched
 * regions never interfere with later ones.
 */
export function smoothStaircases(track) {
  if (track.length < 3) return track.map(p => ({ ...p }))

  // Cumulative distances from original track
  const dists = [0]
  for (let i = 1; i < track.length; i++) {
    dists.push(dists[i - 1] + haversineMeters(track[i - 1], track[i]))
  }

  // Raw forward gradients — g[i] is the gradient of segment (i-1) → i
  const g = [0]
  for (let i = 1; i < track.length; i++) {
    const d = dists[i] - dists[i - 1]
    g.push(d > 0 ? ((track[i].ele - track[i - 1].ele) / d) * 100 : 0)
  }

  const result = track.map(p => ({ ...p }))

  for (let t = 2; t < track.length; t++) {
    // Trigger: spike at t preceded by a flat segment
    if (Math.abs(g[t]) <= SPIKE_GRAD) continue
    if (Math.abs(g[t - 1]) >= FLAT_GRAD) continue

    // Walk back to find j — the start of the flat plateau.
    // j is the greatest index < t such that g[j] ≈ 0 AND g[j-1] ≇ 0
    // (equivalently: the leftmost point of the flat block).
    let j = t - 1
    while (j > 1 && Math.abs(g[j - 1]) < FLAT_GRAD) {
      j--
    }

    // Linearly interpolate interior points j+1 … t-1 between e(j) and e(t)
    const eleStart  = track[j].ele
    const eleEnd    = track[t].ele
    const distStart = dists[j]
    const distEnd   = dists[t]
    const span      = distEnd - distStart
    if (span > 0) {
      for (let k = j + 1; k < t; k++) {
        result[k].ele = eleStart + (eleEnd - eleStart) * (dists[k] - distStart) / span
      }
    }
  }

  return result
}

/**
 * Enriches raw GPX track points with cumulative distance (km) and gradient (%).
 * Quantization staircases are smoothed first, then gradient is measured over a
 * ±GRADIENT_WINDOW_M/2 sliding window to suppress residual point-level noise.
 * Input:  [{ lat, lon, ele }, ...]
 * Output: [{ lat, lon, ele, dist, gradient }, ...]
 */
import { GRADIENT_WINDOW_M } from '../config.js'

export function processTrack(track) {
  if (!track || track.length === 0) return []

  // Cumulative distances (track is already smoothed upstream)
  const cumDists = [0]
  for (let i = 1; i < track.length; i++) {
    cumDists.push(cumDists[i - 1] + haversineMeters(track[i - 1], track[i]))
  }

  const halfW = GRADIENT_WINDOW_M / 2
  const result = []
  let lo = 0
  let hi = 0

  for (let i = 0; i < track.length; i++) {
    if (hi < i) hi = i
    while (lo < i && cumDists[i] - cumDists[lo] > halfW) lo++
    while (hi < track.length - 1 && cumDists[hi + 1] - cumDists[i] <= halfW) hi++

    const eleDiff   = track[hi].ele - track[lo].ele
    const horizDist = cumDists[hi] - cumDists[lo]
    const gradient  = horizDist > 0 ? (eleDiff / horizDist) * 100 : 0

    result.push({ ...track[i], dist: cumDists[i] / 1000, gradient })
  }

  return result
}

/**
 * Groups consecutive track points of the same gradient color into Polyline-ready segments.
 * Input:  processTrack() output
 * Output: [{ color, points: [[lat, lon], ...] }, ...]
 */
export function buildColoredSegments(processed) {
  if (!processed || processed.length < 2) return []
  const segments = []
  let currentColor = gradientColor(processed[1].gradient)
  let currentUphill = processed[1].gradient >= 0
  let currentPoints = [
    [processed[0].lat, processed[0].lon],
    [processed[1].lat, processed[1].lon],
  ]

  for (let i = 2; i < processed.length; i++) {
    const color = gradientColor(processed[i].gradient)
    if (color === currentColor) {
      currentPoints.push([processed[i].lat, processed[i].lon])
    } else {
      segments.push({ color: currentColor, points: currentPoints, uphill: currentUphill })
      currentColor = color
      currentUphill = processed[i].gradient >= 0
      currentPoints = [
        [processed[i - 1].lat, processed[i - 1].lon],
        [processed[i].lat, processed[i].lon],
      ]
    }
  }
  segments.push({ color: currentColor, points: currentPoints, uphill: currentUphill })
  return segments
}
