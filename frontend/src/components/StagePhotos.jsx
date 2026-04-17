import { useState, useEffect, useCallback } from 'react'
import { CLOUDINARY_CLOUD } from '../config.js'
import styles from './StagePhotos.module.css'

function cloudUrl(publicId, transforms = 'w_800,c_limit,q_auto,f_auto') {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${transforms}/${publicId}`
}

export default function StagePhotos({ stageId }) {
  const [photos, setPhotos] = useState(null) // null = loading, [] = none
  const [lightbox, setLightbox] = useState(null) // index of open photo

  useEffect(() => {
    setPhotos(null)
    fetch(
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/list/stage-${stageId}.json`,
    )
      .then((r) => {
        if (r.status === 404) { setPhotos([]); return null }
        if (!r.ok) throw new Error('failed')
        return r.json()
      })
      .then((data) => { if (data) setPhotos(data.resources ?? []) })
      .catch(() => setPhotos([]))
  }, [stageId])

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() =>
    setLightbox((i) => (i > 0 ? i - 1 : photos.length - 1)), [photos])
  const next = useCallback(() =>
    setLightbox((i) => (i < photos.length - 1 ? i + 1 : 0)), [photos])

  // Keyboard nav
  useEffect(() => {
    if (lightbox == null) return
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prev, next, close])

  if (photos === null) return null // still loading — show nothing
  if (photos.length === 0) return null // no photos yet

  return (
    <div className={styles.wrap}>
      <p className={styles.sectionLabel}>Photos</p>
      <div className={styles.grid}>
        {photos.map((p, i) => (
          <button
            key={p.public_id}
            className={styles.thumb}
            onClick={() => setLightbox(i)}
            aria-label={`Open photo ${i + 1}`}
          >
            <img
              src={cloudUrl(p.public_id, 'w_400,h_300,c_fill,q_auto,f_auto')}
              alt=""
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightbox != null && (
        <div className={styles.overlay} onClick={close}>
          <div className={styles.lightbox} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={close} aria-label="Close">✕</button>
            <button className={`${styles.navBtn} ${styles.navLeft}`} onClick={prev} aria-label="Previous">‹</button>
            <img
              className={styles.fullImg}
              src={cloudUrl(photos[lightbox].public_id)}
              alt=""
            />
            <button className={`${styles.navBtn} ${styles.navRight}`} onClick={next} aria-label="Next">›</button>
            <div className={styles.counter}>{lightbox + 1} / {photos.length}</div>
          </div>
        </div>
      )}
    </div>
  )
}
