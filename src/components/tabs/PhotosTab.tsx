import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { useT } from '../../useT'
import { mapController } from '../../lib/mapController'
import { releaseSlot, runWhenFree } from '../../lib/imageQueue'
import {
  CLOUDFLARE_IMAGE_VARIANT_THUMBNAIL,
  getCloudflareImageUrl,
  getGithubImageUrl,
} from '../../config'
import type { ViewpointFeature } from '../../types'

function Thumb({
  vp,
  index,
  onOpen,
  locateLabel,
}: {
  vp: ViewpointFeature
  index: number
  onOpen: (i: number) => void
  locateLabel: string
}) {
  const cloudflare = getCloudflareImageUrl(
    vp.properties.image_id,
    CLOUDFLARE_IMAGE_VARIANT_THUMBNAIL,
  )
  const github = getGithubImageUrl(vp.properties.filename)
  const noSource = !cloudflare && !github

  const wrapRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  // Only start loading when the thumbnail is near the viewport.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Load through the shared concurrency queue; preload then swap in (cached).
  useEffect(() => {
    if (!visible || noSource) return
    let cancelled = false

    const load = (url: string, isCloud: boolean) => {
      const im = new Image()
      im.onload = () => {
        releaseSlot()
        if (!cancelled) setSrc(url)
      }
      im.onerror = () => {
        releaseSlot()
        if (cancelled) return
        if (isCloud && github) {
          runWhenFree(() => {
            if (cancelled) {
              releaseSlot()
              return
            }
            load(github, false)
          })
        } else {
          setFailed(true)
        }
      }
      im.src = url
    }

    const first = cloudflare ?? github
    if (!first) return
    runWhenFree(() => {
      if (cancelled) {
        releaseSlot()
        return
      }
      load(first, Boolean(cloudflare))
    })

    return () => {
      cancelled = true
    }
  }, [visible, noSource, cloudflare, github])

  return (
    <div className="photo-thumb-wrap" ref={wrapRef}>
      {src ? (
        <img
          className="photo-thumb"
          src={src}
          alt={vp.properties.filename}
          title={vp.properties.filename}
          onClick={() => onOpen(index)}
        />
      ) : failed || noSource ? (
        <div
          className="photo-thumb photo-thumb-missing"
          title={vp.properties.filename}
        >
          <i className="fas fa-image" />
        </div>
      ) : (
        <div className="photo-thumb photo-thumb-loading">
          <div className="spinner" />
        </div>
      )}
      <button
        className="photo-locate"
        onClick={(e) => {
          e.stopPropagation()
          mapController.locateViewpoint(index)
        }}
        aria-label={locateLabel}
        title={locateLabel}
      >
        <i className="fas fa-location-crosshairs" />
      </button>
    </div>
  )
}

export default function PhotosTab() {
  const t = useT()
  const viewpoints = useStore((s) => s.viewpoints)
  const openPhoto = useStore((s) => s.openPhoto)

  return (
    <div className="tab-content">
      <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        {viewpoints.length} {t.photoPoints}
      </p>
      <div className="photo-grid">
        {viewpoints.map((vp, i) => (
          <Thumb
            key={vp.properties.fid}
            vp={vp}
            index={i}
            onOpen={openPhoto}
            locateLabel={t.showOnMap}
          />
        ))}
      </div>
    </div>
  )
}
