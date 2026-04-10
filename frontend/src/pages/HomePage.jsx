import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StageCard from '../components/StageCard.jsx'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/stages')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load stages')
        return r.json()
      })
      .then((data) => {
        setStages(data)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  const totalDistance = stages.reduce((s, st) => s + st.distance_km, 0).toFixed(0)
  const totalElevation = stages.reduce((s, st) => s + st.elevation_gain_m, 0)

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
          {stages.length > 0 && (
            <div className={styles.totals}>
              <div className={styles.totalStat}>
                <span className={styles.totalValue}>{totalDistance}</span>
                <span className={styles.totalLabel}>km total</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.totalStat}>
                <span className={styles.totalValue}>
                  {totalElevation.toLocaleString()}
                </span>
                <span className={styles.totalLabel}>m elevation</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {loading && <p className={styles.status}>Loading stages…</p>}
        {error && <p className={styles.statusError}>{error}</p>}
        {!loading && !error && (
          <div className={styles.grid}>
            {stages.map((stage) => (
              <Link key={stage.id} to={`/stage/${stage.id}`} className={styles.cardLink}>
                <StageCard stage={stage} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
