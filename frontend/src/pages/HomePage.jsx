import { Link } from 'react-router-dom'
import StageCard from '../components/StageCard.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { STAGES } from '../data/stages.js'
import stravaRoutes from '../data/strava-routes.json'
import { useThemeContext } from '../App.jsx'
import styles from './HomePage.module.css'

// Derive totals from the Strava metadata (already fetched, no GPX loading needed)
const stravaValues = Object.values(stravaRoutes)
const totalDistance = Math.round(
  stravaValues.reduce((acc, r) => acc + r.distance, 0) / 1000,
)
const totalElevation = Math.round(
  stravaValues.reduce((acc, r) => acc + r.elevation_gain, 0),
)

export default function HomePage() {
  const stages = STAGES
  const { theme, toggle } = useThemeContext()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerTop}>
            <span className={styles.eyebrow}>Mallorca · {stages.length} Stages</span>
            <div className={styles.headerActions}>
              <Link to="/teammates" className={styles.teammatesLink}>Teammates →</Link>
              <ThemeToggle theme={theme} onToggle={toggle} />
            </div>
          </div>
          <h1 className={styles.title}>Crown of Calobra</h1>
          <p className={styles.tagline}>
            A cycling challenge through the Serra de Tramuntana
          </p>
          <div className={styles.totals}>
            <div className={styles.totalStat}>
              <span className={styles.totalValue}>{totalDistance}</span>
              <span className={styles.totalLabel}>km total</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.totalStat}>
              <span className={styles.totalValue}>{totalElevation.toLocaleString()}</span>
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
