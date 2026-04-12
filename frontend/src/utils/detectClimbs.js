/**
 * Detects climbs in a processed track (output of processTrack()).
 *
 * A climb segment is defined as a contiguous section where the rolling
 * average gradient over MIN_CLIMB_KM stays above MIN_AVG_GRAD.
 *
 * Rules:
 *  - Entry trigger: forward average gradient over MIN_CLIMB_KM >= MIN_AVG_GRAD
 *  - Exit:          forward average gradient over MIN_CLIMB_KM <  MIN_AVG_GRAD
 *  - Merge:         two climbs separated by < MERGE_GAP_KM are joined
 *  - Discard:       result shorter than MIN_CLIMB_KM or gain < MIN_GAIN_M
 *
 * Input:  processTrack() output — [{ lat, lon, ele, dist, gradient }, ...]
 *         `dist` is cumulative km from start.
 * Output: [{ startDist, endDist, startEle, endEle, lengthKm, gainM, avgGrad, maxGrad }, ...]
 */

const MIN_AVG_GRAD  = 5     // % — minimum average gradient to qualify
const MIN_CLIMB_KM  = 0.3     // km — minimum climb length to keep
const WINDOW_KM     = 0.3     // km — rolling-average window (same as min length)
const MERGE_GAP_KM  = 0.2  // km — brief dip allowed before ending a climb
const MIN_GAIN_M    = 30    // m  — discard if net elevation gain is too small

export function detectClimbs(processed) {
  if (!processed || processed.length < 2) return []

  const n = processed.length

  // Pre-compute a forward rolling average gradient over WINDOW_KM windows.
  // rollingAvg[i] = average gradient from point i over the next WINDOW_KM.
  const rollingAvg = new Float64Array(n)
  let hi = 0
  let sumGrad = 0
  let count = 0

  for (let i = 0; i < n; i++) {
    // Advance hi until window covers WINDOW_KM ahead of i
    while (
      hi < n - 1 &&
      processed[hi].dist - processed[i].dist < WINDOW_KM
    ) {
      hi++
      sumGrad += processed[hi].gradient
      count++
    }
    rollingAvg[i] = count > 0 ? sumGrad / count : processed[i].gradient

    // Shrink window from the back as i advances
    if (i < n - 1) {
      sumGrad -= processed[i + 1].gradient
      count = Math.max(0, count - 1)
    }
  }

  // Walk the track: enter a climb when rollingAvg >= threshold, exit when it
  // stays below threshold for MERGE_GAP_KM (allows brief flat / descent sections).
  const climbs = []
  let climbStart = -1
  let gapStart = -1

  for (let i = 0; i < n; i++) {
    const above = rollingAvg[i] >= MIN_AVG_GRAD

    if (above) {
      if (climbStart === -1) climbStart = i   // start new climb
      gapStart = -1                            // reset gap timer
    } else {
      if (climbStart !== -1) {
        // We're in a climb but dropped below threshold
        if (gapStart === -1) gapStart = i
        const gapLen = processed[i].dist - processed[gapStart].dist
        if (gapLen >= MERGE_GAP_KM) {
          // Gap too long — end the climb at where the gap started
          climbs.push([climbStart, gapStart])
          climbStart = -1
          gapStart = -1
        }
      }
    }
  }
  if (climbStart !== -1) {
    climbs.push([climbStart, gapStart !== -1 ? gapStart : n - 1])
  }

  // Convert index pairs into climb objects and filter
  return climbs
    .map(([si, rawEi]) => {
      // Bug fix: rolling avg drops below threshold WINDOW_KM before the actual
      // summit (it's a forward average). Search up to WINDOW_KM beyond rawEi
      // to find the true peak (max elevation).
      let searchEnd = rawEi
      while (
        searchEnd < n - 1 &&
        processed[searchEnd].dist - processed[rawEi].dist < WINDOW_KM
      ) searchEnd++

      let ei = si
      let maxEle = -Infinity
      for (let k = si; k <= searchEnd; k++) {
        if (processed[k].ele > maxEle) { maxEle = processed[k].ele; ei = k }
      }

      const start = processed[si]
      const end   = processed[ei]
      const lengthKm = end.dist - start.dist
      const slice    = processed.slice(si, ei + 1)

      // Sum only uphill segments for true elevation gain
      let gainM = 0
      for (let k = 1; k < slice.length; k++) {
        const diff = slice[k].ele - slice[k - 1].ele
        if (diff > 0) gainM += diff
      }
      gainM = Math.round(gainM)

      const maxGrad = Math.max(...slice.map(p => p.gradient))
      const avgGrad = lengthKm > 0
        ? ((end.ele - start.ele) / (lengthKm * 1000)) * 100
        : 0

      return {
        startDist: start.dist,
        endDist:   end.dist,
        startEle:  Math.round(start.ele),
        endEle:    Math.round(end.ele),
        lengthKm:  Math.round(lengthKm * 10) / 10,
        gainM,
        avgGrad:   Math.round(avgGrad * 10) / 10,
        maxGrad:   Math.round(maxGrad * 10) / 10,
        points:    slice,
      }
    })
    .filter(c => c.lengthKm >= MIN_CLIMB_KM && c.gainM >= MIN_GAIN_M)
}
