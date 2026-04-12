import styles from './AthleteCard.module.css'

function countryFlag(code) {
  if (!code || code.length !== 2) return ''
  return [...code.toUpperCase()].map(c => {
    const cp = c.charCodeAt(0) - 65
    if (cp < 0 || cp > 25) return ''
    return String.fromCodePoint(0x1F1E6 + cp)
  }).join('')
}

export default function AthleteCard({ athlete, score }) {
  const { name, role, nationality, photo, stats } = athlete
  const { km, elevation, best_day_elevation } = stats ?? {}

  const kmText = km != null ? km.toLocaleString() : '—'
  const elevText = elevation != null ? elevation.toLocaleString() : '—'
  const bestDayText = best_day_elevation != null ? best_day_elevation.toLocaleString() : '—'

  return (
    <div className={styles.card}>
      <div className={styles.topBar}>
        <div className={styles.scoreBlock}>
          <span className={styles.score}>{score != null ? score : '—'}</span>
          <span className={styles.role}>{role}</span>
        </div>
        <div className={styles.crownIcon}>⭑</div>
      </div>

      <div className={styles.flag}>
        {nationality ? countryFlag(nationality) : null}
      </div>

      <div className={styles.photoArea}>
        {photo ? (
          <img
            src={photo}
            alt={name ?? ''}
            className={styles.photo}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        ) : null}
      </div>

      <div className={styles.name}>{name}</div>

      <hr className={styles.divider} />

      <div className={styles.statsBlock}>
        <div>{kmText} KM · {elevText} ELV</div>
        <div>{bestDayText} D+</div>
      </div>
    </div>
  )
}
