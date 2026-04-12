import stravaRoutes from '../data/strava-routes.json'
import styles from './StravaRouteSection.module.css'

export default function StravaRouteSection({ stage }) {
  if (!stage.strava_route_id) return null

  const data = stravaRoutes[String(stage.id)]
  if (!data) return null

  const distanceKm = (data.distance / 1000).toFixed(1)
  const syncDate = data.updated_at
    ? new Date(data.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <p className={styles.sectionLabel}>Route Profile</p>
        <span className={styles.stravaBadge}>Strava</span>
      </div>

      <h3 className={styles.routeName}>{data.name}</h3>

      {data.description && (
        <p className={styles.routeDesc}>{data.description}</p>
      )}

      <p className={styles.routeMeta}>
        {distanceKm} km
        <span className={styles.metaSep}>·</span>
        +{data.elevation_gain.toLocaleString()} m
        {syncDate && (
          <>
            <span className={styles.metaSep}>·</span>
            sync {syncDate}
          </>
        )}
      </p>

      <a
        href={stage.strava_url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.stravaBtn}
      >
        Voir sur Strava →
      </a>
    </div>
  )
}
