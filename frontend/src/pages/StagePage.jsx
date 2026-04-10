import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import MiniMap from '../components/MiniMap.jsx'
import ElevationProfile from '../components/ElevationProfile.jsx'
import styles from './StagePage.module.css'

const TERRAIN_LABEL = {
  mountain: 'Mountain',
  hilly: 'Hilly',
  flat: 'Flat',
}

export default function StagePage() {
  const { id } = useParams()
  const [stage, setStage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/stages/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Stage not found')
        return r.json()
      })
      .then((data) => {
        setStage(data)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.status}>Loading…</p>
      </div>
    )
  }

  if (error || !stage) {
    return (
      <div className={styles.page}>
        <p className={styles.statusError}>{error || 'Stage not found'}</p>
        <Link to="/" className={styles.backBtn}>← Back</Link>
      </div>
    )
  }

  const maxEle = Math.max(...stage.track.map((p) => p.ele))
  const minEle = Math.min(...stage.track.map((p) => p.ele))

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
            <MiniMap track={stage.track} terrain={stage.terrain} height={340} />
          </div>
        </div>

        <div className={styles.chartSection}>
          <ElevationProfile
            track={stage.track}
            distanceKm={stage.distance_km}
            terrain={stage.terrain}
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
