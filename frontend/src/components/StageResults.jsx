import teammates from '../data/teammates.json'
import stageResults from '../data/stage-results.json'
import styles from './StageResults.module.css'

const AWARDS = [
  { key: 'winner',       icon: '🏆', label: 'Stage Winner' },
  { key: 'best_climber', icon: '⛰️',  label: 'Best Climber' },
  { key: 'combative',    icon: '⚔️',  label: 'Most Combative' },
  { key: 'puncher',      icon: '👊',  label: 'Puncher of the Day' },
]

function findRider(id) {
  return teammates.find((t) => t.id === id) ?? null
}

/**
 * Parses a human time string like "2h 35min", "3h", "45min" into decimal hours.
 * Returns null if unparseable.
 */
function parseTimeHours(str) {
  if (!str) return null
  const h = str.match(/(\d+)\s*h/)
  const m = str.match(/(\d+)\s*min/)
  if (!h && !m) return null
  return (h ? Number(h[1]) : 0) + (m ? Number(m[1]) / 60 : 0)
}

export default function StageResults({ stageId, distanceKm }) {
  const result = stageResults[String(stageId)]

  // Stage not done yet — nothing to show
  if (!result || AWARDS.every((a) => result[a.key] == null) && !result.time && !result.notes) {
    return null
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.sectionLabel}>Stage Report</p>

      {result.time && (
        <div className={styles.timeRow}>
          <span className={styles.timeIcon}>⏱</span>
          <span className={styles.timeLabel}>Stage time</span>
          <span className={styles.timeValue}>{result.time}</span>
          {(() => {
            const hours = parseTimeHours(result.time)
            if (hours && distanceKm) {
              const speed = (distanceKm / hours).toFixed(1)
              return <span className={styles.speedValue}>{speed} km/h</span>
            }
            return null
          })()}
        </div>
      )}

      <div className={styles.awards}>
        {AWARDS.map(({ key, icon, label }) => {
          const rider = result[key] != null ? findRider(result[key]) : null
          if (!rider) return null
          return (
            <div key={key} className={styles.award}>
              <span className={styles.awardIcon}>{icon}</span>
              <div className={styles.awardBody}>
                <span className={styles.awardLabel}>{label}</span>
                <div className={styles.riderRow}>
                  <img
                    className={styles.photo}
                    src={`${import.meta.env.BASE_URL}${rider.photo.replace(/^\//, '')}`}
                    alt={rider.firstName}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <span className={styles.riderName}>
                    {rider.firstName} <strong>{rider.name}</strong>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {result.notes && (
        <p className={styles.notes}>{result.notes}</p>
      )}
    </div>
  )
}
