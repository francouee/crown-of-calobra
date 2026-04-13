import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import MiniMap from '../components/MiniMap.jsx'
import ElevationProfile from '../components/ElevationProfile.jsx'
import StravaRouteSection from '../components/StravaRouteSection.jsx'
import { STAGES, PROPOSALS } from '../data/stages.js'
import { useGpxTrack } from '../hooks/useGpxTrack.js'
import { processTrack } from '../utils/gradients.js'
import { detectClimbs } from '../utils/detectClimbs.js'
import ClimbProfile from '../components/ClimbProfile.jsx'
import { useThemeContext } from '../App.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import styles from './StagePage.module.css'

const TERRAIN_LABEL = {
  mountain: 'Mountain',
  hilly: 'Hilly',
  flat: 'Flat',
  rest: 'Rest',
  big_boss: 'Big Boss',
}

export default function StagePage() {
  const { id } = useParams()
  const stage = [...STAGES, ...PROPOSALS].find((s) => s.id === Number(id))
  const { track, stats, loading: gpxLoading } = useGpxTrack(stage?.gpx)
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [zoomRange, setZoomRange] = useState(null)
  const { theme, toggle } = useThemeContext()

  const climbs = useMemo(() => {
    if (!track) return []
    return detectClimbs(processTrack(track))
  }, [track])

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
        <div className={styles.navRight}>
          <span className={styles.navStage}>Stage {stage.id} / {STAGES.length}</span>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
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
          <span className={styles.statValue}>{stats ? stats.distanceKm : '—'}</span>
          <span className={styles.statLabel}>km distance</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats ? `+${stats.elevationGainM.toLocaleString()}` : '—'}</span>
          <span className={styles.statLabel}>m gain</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mapSection}>
          <p className={styles.sectionLabel}>GPS Track</p>
          <div className={styles.mapWrap}>
            {gpxLoading
              ? <div className={styles.status}>Loading map…</div>
              : <MiniMap track={track} height={340} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} zoomRange={zoomRange} />}
          </div>
        </div>

        <div className={styles.chartSection}>
          <ElevationProfile
            track={track}
            terrain={stage.terrain}
            hoveredIdx={hoveredIdx}
            onHover={setHoveredIdx}
            zoomRange={zoomRange}
            onZoom={setZoomRange}
          />
        </div>

        <div className={styles.descSection}>
          <p className={styles.sectionLabel}>Stage Notes</p>
          <p className={styles.description}>{stage.description}</p>
        </div>

        <StravaRouteSection stage={stage} />

        {climbs.length > 0 && (
          <div className={styles.climbsSection}>
            <p className={styles.sectionLabel}>Climbs</p>
            <div className={styles.climbsGrid}>
              {climbs.map((climb, i) => (
                <div key={i} className={styles.climbCard}>
                  <div className={styles.climbIndex}>Cat. {climb.avgGrad >= 10 ? 'HC' : climb.avgGrad >= 8 ? '1' : climb.avgGrad >= 6 ? '2' : '3'}</div>
                  <ClimbProfile points={climb.points} height={72} />
                  <div className={styles.climbStats}>
                    <div className={styles.climbStat}>
                      <span className={styles.climbValue}>{climb.lengthKm}</span>
                      <span className={styles.climbUnit}>km</span>
                    </div>
                    <div className={styles.climbStat}>
                      <span className={styles.climbValue}>+{climb.gainM}</span>
                      <span className={styles.climbUnit}>m</span>
                    </div>
                    <div className={styles.climbStat}>
                      <span className={styles.climbValue}>{climb.avgGrad}%</span>
                      <span className={styles.climbUnit}>avg</span>
                    </div>
                    <div className={styles.climbStat}>
                      <span className={styles.climbValue}>{climb.maxGrad}%</span>
                      <span className={styles.climbUnit}>max</span>
                    </div>
                  </div>
                  <div className={styles.climbDist}>
                    @ {climb.startDist.toFixed(1)}–{climb.endDist.toFixed(1)} km
                    &nbsp;&middot;&nbsp;{climb.startEle}–{climb.endEle} m
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <nav className={styles.stageNav}>
        {stage.id > 1 && (
          <Link to={`/stage/${stage.id - 1}`} className={styles.stageNavBtn}>
            ← Stage {stage.id - 1}
          </Link>
        )}
        {stage.id < STAGES.length + PROPOSALS.length && (
          <Link to={`/stage/${stage.id + 1}`} className={`${styles.stageNavBtn} ${styles.stageNavNext}`}>
            Stage {stage.id + 1} →
          </Link>
        )}
      </nav>
    </div>
  )
}
