import MiniMap from '../components/MiniMap.jsx'
import styles from './StageCard.module.css'

const TERRAIN_LABEL = {
  mountain: 'Mountain',
  hilly: 'Hilly',
  flat: 'Flat',
}

export default function StageCard({ stage }) {
  return (
    <article className={`${styles.card} ${styles[stage.terrain]}`}>
      <div className={styles.top}>
        <div className={styles.meta}>
          <span className={styles.stageNum}>
            Stage {stage.id}
          </span>
          <span className={`${styles.badge} ${styles[`badge_${stage.terrain}`]}`}>
            {TERRAIN_LABEL[stage.terrain]}
          </span>
        </div>
        <h2 className={styles.name}>{stage.name}</h2>
        <p className={styles.route}>
          {stage.start}
          <span className={styles.arrow}> → </span>
          {stage.finish}
        </p>
      </div>

      <div className={styles.mapArea}>
        <MiniMap track={stage.track} terrain={stage.terrain} />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stage.distance_km}</span>
          <span className={styles.statLabel}>km</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>
            +{stage.elevation_gain_m.toLocaleString()}
          </span>
          <span className={styles.statLabel}>m gain</span>
        </div>
        <div className={styles.viewLink}>View stage →</div>
      </div>
    </article>
  )
}
