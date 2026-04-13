// Global tuning parameters
//
// Constraint: INTERVAL_M must satisfy
//   INTERVAL_M  <=  MERGE_GAP_KM * 1000 / 2   (= 100 m with defaults)
// All distance-based windows in gradients.js and detectClimbs.js depend on
// INTERVAL_M being small enough that each window spans at least 2–3 points.

/** Resample interval for GPX tracks (meters between display points). Max: 100 m. */
export const INTERVAL_M = 200
/** Minimum resample interval used when brush-zooming the elevation chart (meters). */
export const MIN_ZOOM_INTERVAL_M = 20

// ─── gradients.js ────────────────────────────────────────────────────────────
/** Half-width of the sliding window used to smooth per-point gradients (meters). Must be >= 2 × INTERVAL_M. */
export const GRADIENT_WINDOW_M = 500

// ─── detectClimbs.js ─────────────────────────────────────────────────────────
/** Minimum average gradient (%) for a segment to qualify as a climb. */
export const MIN_AVG_GRAD = 4
/** Minimum climb length to keep (km). Must be >= 2 × INTERVAL_M / 1000. */
export const MIN_CLIMB_KM = 1
/** Rolling-average window for climb detection (km). Must be >= 2 × INTERVAL_M / 1000. */
export const WINDOW_KM = 0.3
/** Maximum gap allowed inside a climb before it is split (km). Must be > INTERVAL_M / 1000. */
export const MERGE_GAP_KM = 0.5
/** Minimum net elevation gain (m) for a climb to be kept. */
export const MIN_GAIN_M = 100
