import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { useThemeContext } from '../App.jsx'
import AthleteCard from '../components/AthleteCard.jsx'
import TEAMMATES from '../data/teammates.json'
import styles from './TeammatesPage.module.css'

function calculateScores(teammates) {
  const valid = teammates.filter(t => t.stats.km !== null)
  if (valid.length === 0) return {}
  const maxKm = Math.max(...valid.map(t => t.stats.km))
  const maxElv = Math.max(...valid.map(t => t.stats.elevation))
  const maxD = Math.max(...valid.map(t => t.stats.best_day_elevation))
  return Object.fromEntries(teammates.map(t => {
    if (t.stats.km === null) return [t.id, null]
    const norm = (
      (t.stats.km / maxKm) * 0.5 +
      (t.stats.elevation / maxElv) * 0.3 +
      (t.stats.best_day_elevation / maxD) * 0.2
    )
    return [t.id, Math.round(norm * 99)]
  }))
}

export default function TeammatesPage() {
  const { theme, toggle } = useThemeContext()
  const scores = calculateScores(TEAMMATES)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerTop}>
            <span className={styles.eyebrow}>Crown of Calobra · 9 Riders</span>
            <div className={styles.headerActions}>
              <Link to="/" className={styles.backLink}>← All Stages</Link>
              <ThemeToggle theme={theme} onToggle={toggle} />
            </div>
          </div>
          <h1 className={styles.title}>Teammates</h1>
          <p className={styles.tagline}>The crew tackling Mallorca together</p>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.grid}>
          {TEAMMATES.map(athlete => (
            <AthleteCard key={athlete.id} athlete={athlete} score={scores[athlete.id] ?? null} />
          ))}
        </div>
      </main>
    </div>
  )
}
