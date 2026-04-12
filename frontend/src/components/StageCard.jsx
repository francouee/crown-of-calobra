import MiniMap from '../components/MiniMap.jsx'
import ElevationProfile from '../components/ElevationProfile.jsx'
import { useGpxTrack } from '../hooks/useGpxTrack.js'
import styles from './StageCard.module.css'

const TERRAIN_LABEL = {
  mountain: 'Mountain',
  hilly: 'Hilly',
  flat: 'Flat',
}

export default function StageCard({ stage }) {
  const { track } = useGpxTrack(stage.gpx)

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

      <div className={styles.content}>
        <div className={styles.mapSection}>
          <p className={styles.sectionLabel}>GPS Track</p>
          <div className={styles.mapWrap}>
            <MiniMap track={track} height={340}/>
          </div>
        </div>

        <div className={styles.chartSection}>
          <ElevationProfile
            track={track}
            terrain={stage.terrain}
          />
        </div>

        <div className={styles.descSection}>
          <p className={styles.sectionLabel}>Stage Notes</p>
          <p className={styles.description}>{stage.description}</p>
        </div>
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
