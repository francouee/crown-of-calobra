import { Link } from 'react-router-dom'
import StageCard from '../components/StageCard.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { STAGES, PROPOSALS } from '../data/stages.js'
import stravaRoutes from '../data/strava-routes.json'
import { useThemeContext } from '../App.jsx'
import styles from './HomePage.module.css'

// Totals are based on selected stages only (first STAGES.length entries by numeric key)
const selectedRouteValues = Object.entries(stravaRoutes)
  .sort(([a], [b]) => Number(a) - Number(b))
  .slice(0, STAGES.length)
  .map(([, r]) => r)
const totalDistance = Math.round(
  selectedRouteValues.reduce((acc, r) => acc + r.distance, 0) / 1000,
)
const totalElevation = Math.round(
  selectedRouteValues.reduce((acc, r) => acc + r.elevation_gain, 0),
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

        {PROPOSALS.length > 0 && (
          <section className={styles.proposals}>
            <h2 className={styles.proposalsTitle}>Route Proposals</h2>
            <p className={styles.proposalsSubtitle}>Candidates under consideration — not yet scheduled.</p>
            <div className={styles.grid}>
              {PROPOSALS.map((stage) => (
                <Link key={stage.id} to={`/stage/${stage.id}`} className={`${styles.cardLink} ${styles.proposalCard}`}>
                  <StageCard stage={stage} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
