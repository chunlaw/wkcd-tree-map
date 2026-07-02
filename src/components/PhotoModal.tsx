import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { useT } from '../useT'
import {
  CLOUDFLARE_IMAGE_VARIANT_FULL,
  getCloudflareImageUrl,
  getGithubImageUrl,
} from '../config'
import type { ViewpointFeature } from '../types'

type Stage = 'cloudflare' | 'github' | 'failed'

/**
 * Full-size photo with Cloudflare -> GitHub -> "unavailable" fallback.
 * Keyed by index in the parent so its state resets on photo change (no effect).
 */
function ModalPhoto({
  feature,
  index,
  total,
}: {
  feature: ViewpointFeature
  index: number
  total: number
}) {
  const t = useT()
  const cloudflare = getCloudflareImageUrl(
    feature.properties.image_id,
    CLOUDFLARE_IMAGE_VARIANT_FULL,
  )
  const github = getGithubImageUrl(feature.properties.filename)

  const [stage, setStage] = useState<Stage>(
    cloudflare ? 'cloudflare' : github ? 'github' : 'failed',
  )
  const src =
    stage === 'cloudflare' ? cloudflare : stage === 'github' ? github : null

  const handleError = () => {
    if (stage === 'cloudflare' && github) setStage('github')
    else setStage('failed')
  }

  return (
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {src && <img src={src} alt="Tree photo" onError={handleError} />}
      <div className="modal-info">
        {t.photo}: {feature.properties.filename}
        <br />
        {t.rotation}: {feature.properties.rotation}°<br />
        {index + 1} / {total}
        {stage === 'failed' && (
          <>
            <br />
            <span style={{ color: '#ff6b6b' }}>{t.imageNotAvailable}</span>
          </>
        )}
      </div>
    </div>
  )
}

export default function PhotoModal() {
  const open = useStore((s) => s.photoOpen)
  const index = useStore((s) => s.photoIndex)
  const viewpoints = useStore((s) => s.viewpoints)
  const close = useStore((s) => s.closePhoto)
  const next = useStore((s) => s.nextPhoto)
  const prev = useStore((s) => s.prevPhoto)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, next, prev])

  const feature = viewpoints[index]
  if (!open || !feature) return null

  return (
    <div className="modal" onClick={close}>
      <button className="modal-close" onClick={close} aria-label="Close photo viewer">
        ×
      </button>
      <button
        className="modal-nav modal-prev"
        onClick={(e) => {
          e.stopPropagation()
          prev()
        }}
        aria-label="Previous photo"
      >
        <i className="fas fa-chevron-left" />
      </button>

      <ModalPhoto
        key={index}
        feature={feature}
        index={index}
        total={viewpoints.length}
      />

      <button
        className="modal-nav modal-next"
        onClick={(e) => {
          e.stopPropagation()
          next()
        }}
        aria-label="Next photo"
      >
        <i className="fas fa-chevron-right" />
      </button>
    </div>
  )
}
