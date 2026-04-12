import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import MiniMap from '../components/MiniMap.jsx'
import ElevationProfile from '../components/ElevationProfile.jsx'
import { STAGES } from '../data/stages.js'
import { useGpxTrack } from '../hooks/useGpxTrack.js'
import styles from './StagePage.module.css'

const TERRAIN_LABEL = {
  mountain: 'Mountain',
  hilly: 'Hilly',
  flat: 'Flat',
}

export default function StagePage() {
  const { id } = useParams()
  const stage = STAGES.find((s) => s.id === Number(id))
  const { track, loading: gpxLoading } = useGpxTrack(stage?.gpx)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  if (!stage) {
    return (
      <div className={styles.page}>
        <p className={styles.statusError}>Stage not found</p>
        <Link to="/" className={styles.backBtn}>← Back</Link>
      </div>
    )
  }

  const maxEle = track ? Math.max(...track.map((p) => p.ele)) : '—'
  const minEle = track ? Math.min(...track.map((p) => p.ele)) : '—'

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.backBtn}>← All Stages</Link>
        <span className={styles.navStage}>Stage {stage.id} / 5</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerMeta}>
          <span className={`${styles.badge} ${styles[`badge_${stage.terrain}`]}`}>
            {TERRAIN_LABEL[stage.terrain]}
          </span>
          <span className={styles.subtitle}>{stage.subtitle}</span>
        </div>
        <h1 className={styles.title}>{stage.name}</h1>
        <p className={styles.route}>
          <span className={styles.routeCity}>{stage.start}</span>
          <span className={styles.routeArrow}> ——→ </span>
          <span className={styles.routeCity}>{stage.finish}</span>
        </p>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stage.distance_km}</span>
          <span className={styles.statLabel}>km distance</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>+{stage.elevation_gain_m.toLocaleString()}</span>
          <span className={styles.statLabel}>m gain</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{maxEle}</span>
          <span className={styles.statLabel}>m highest point</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{minEle}</span>
          <span className={styles.statLabel}>m lowest point</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mapSection}>
          <p className={styles.sectionLabel}>GPS Track</p>
          <div className={styles.mapWrap}>
            {gpxLoading
              ? <div className={styles.status}>Loading map…</div>
              : <MiniMap track={track} height={340} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />}
          </div>
        </div>

        <div className={styles.chartSection}>
          <ElevationProfile
            track={track}
            terrain={stage.terrain}
            hoveredIdx={hoveredIdx}
            onHover={setHoveredIdx}
          />
        </div>

        <div className={styles.descSection}>
          <p className={styles.sectionLabel}>Stage Notes</p>
          <p className={styles.description}>{stage.description}</p>
        </div>
      </div>

      <nav className={styles.stageNav}>
        {stage.id > 1 && (
          <Link to={`/stage/${stage.id - 1}`} className={styles.stageNavBtn}>
            ← Stage {stage.id - 1}
          </Link>
        )}
        {stage.id < 5 && (
          <Link to={`/stage/${stage.id + 1}`} className={`${styles.stageNavBtn} ${styles.stageNavNext}`}>
            Stage {stage.id + 1} →
          </Link>
        )}
      </nav>
    </div>
  )
}
