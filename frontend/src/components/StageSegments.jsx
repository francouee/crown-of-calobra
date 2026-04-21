import stageSegments from '../data/stage-segments.json'
import styles from './StageSegments.module.css'

export default function StageSegments({ stageId }) {
  const segments = stageSegments[String(stageId)]
  if (!segments || segments.length === 0) return null

  return (
    <div className={styles.wrap}>
      <p className={styles.sectionLabel}>Key Segments</p>
      <div className={styles.segments}>
        {segments.map((seg) => (
          <a
            key={seg.id}
            className={styles.segment}
            href={seg.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.segName}>
              {seg.name}
              <span className={styles.segLink}>↗</span>
            </div>
            <div className={styles.segMeta}>
              <span>{(seg.distance_m / 1000).toFixed(1)} km</span>
              <span className={styles.dot}>·</span>
              <span>+{seg.elevation_m} m</span>
              <span className={styles.dot}>·</span>
              <span>{seg.avg_grade}%</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
