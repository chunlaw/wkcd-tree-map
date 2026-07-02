import { useState } from 'react'
import { useStore } from '../store'
import { useT } from '../useT'
import { mapController } from '../lib/mapController'
import type { BaseMapKey } from '../types'

export default function TopLeftControls() {
  const t = useT()
  const [layerOpen, setLayerOpen] = useState(false)
  const baseMap = useStore((s) => s.baseMap)
  const setBaseMap = useStore((s) => s.setBaseMap)
  const trees = useStore((s) => s.trees)
  const lang = useStore((s) => s.lang)
  const toggleLang = useStore((s) => s.toggleLang)
  const panelOpen = useStore((s) => s.panelOpen)
  const togglePanel = useStore((s) => s.togglePanel)

  const baseMaps: { value: BaseMapKey; label: string }[] = [
    { value: 'osm', label: t.streetMap },
    { value: 'satellite', label: t.satellite },
    { value: 'topo', label: t.topographic },
  ]

  return (
    <div className={`top-left-controls${panelOpen ? ' shifted' : ''}`}>
      <button
        className={`toggle-btn${panelOpen ? ' toggle-btn-active' : ''}`}
        onClick={togglePanel}
        aria-label={t.menu}
        title={t.menu}
        aria-expanded={panelOpen}
      >
        <i className="fas fa-bars" />
      </button>

      <button
        className="toggle-btn"
        onClick={toggleLang}
        aria-label={t.switchLanguage}
        title={t.switchLanguage}
        style={{ fontSize: 13, fontWeight: 600 }}
      >
        {lang === 'en' ? '繁' : 'EN'}
      </button>

      <a
        href="https://benjaminficusmicrocarpa.github.io/"
        className="toggle-btn"
        style={{ textDecoration: 'none' }}
        aria-label={t.backToHome}
        title={t.backToHome}
      >
        <i className="fas fa-home" />
      </a>

      <div className="control-group zoom-controls">
        <button onClick={() => mapController.map?.zoomIn()} aria-label={t.zoomIn} title={t.zoomIn}>
          +
        </button>
        <button onClick={() => mapController.map?.zoomOut()} aria-label={t.zoomOut} title={t.zoomOut}>
          −
        </button>
      </div>

      <button
        className="toggle-btn"
        onClick={() => setLayerOpen((v) => !v)}
        aria-label={t.mapLayers}
        title={t.mapLayers}
      >
        <i className="fas fa-layer-group" />
      </button>

      {layerOpen && (
        <div className="control-group layer-selector">
          <h4>{t.baseMap}</h4>
          {baseMaps.map(({ value, label }) => (
            <label key={value}>
              <input
                type="radio"
                name="basemap"
                value={value}
                checked={baseMap === value}
                onChange={() => setBaseMap(value)}
              />
              {label}
            </label>
          ))}
        </div>
      )}

      <button
        className="toggle-btn"
        onClick={() => mapController.zoomToExtent(trees)}
        aria-label={t.fitAllTrees}
        title={t.fitAllTrees}
      >
        <i className="fas fa-expand" />
      </button>
      <button
        className="toggle-btn"
        onClick={() => mapController.geolocate()}
        aria-label={t.myLocation}
        title={t.myLocation}
      >
        <i className="fas fa-location-crosshairs" />
      </button>
    </div>
  )
}
