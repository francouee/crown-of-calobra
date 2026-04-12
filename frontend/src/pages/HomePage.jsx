import { Link } from 'react-router-dom'
import StageCard from '../components/StageCard.jsx'
import { STAGES } from '../data/stages.js'
import { useGpxTrack } from '../hooks/useGpxTrack.js'
import styles from './HomePage.module.css'

export default function HomePage() {
  const stages = STAGES

  // Load stats from each GPX (browser caches the fetches; StageCard reuses them)
  const { stats: s1 } = useGpxTrack(stages[0]?.gpx)
  const { stats: s2 } = useGpxTrack(stages[1]?.gpx)
  const { stats: s3 } = useGpxTrack(stages[2]?.gpx)
  const { stats: s4 } = useGpxTrack(stages[3]?.gpx)
  const { stats: s5 } = useGpxTrack(stages[4]?.gpx)

  const allStats = [s1, s2, s3, s4, s5]
  const allLoaded = allStats.every(Boolean)
  const totalDistance = allLoaded
    ? allStats.reduce((acc, s) => acc + s.distanceKm, 0).toFixed(0)
    : null
  const totalElevation = allLoaded
    ? allStats.reduce((acc, s) => acc + s.elevationGainM, 0)
    : null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerTop}>
            <span className={styles.eyebrow}>Mallorca · {stages.length} Stages</span>
          </div>
          <h1 className={styles.title}>Crown of Calobra</h1>
          <p className={styles.tagline}>
            A cycling challenge through the Serra de Tramuntana
          </p>
          <div className={styles.totals}>
            <div className={styles.totalStat}>
              <span className={styles.totalValue}>{totalDistance ?? '—'}</span>
              <span className={styles.totalLabel}>km total</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.totalStat}>
              <span className={styles.totalValue}>
                {totalElevation != null ? totalElevation.toLocaleString() : '—'}
              </span>
              <span className={styles.totalLabel}>m elevation</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          {stages.map((stage) => (
            <Link key={stage.id} to={`/stage/${stage.id}`} className={styles.cardLink}>
              <StageCard stage={stage} />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
