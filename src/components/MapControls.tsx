import { useState } from 'react'
import { useStore } from '../store'
import { useT } from '../useT'
import { mapController } from '../lib/mapController'
import type { BaseMapKey } from '../types'

/** Bottom-right map navigation controls: zoom, base map, fit, locate. */
export default function MapControls() {
  const t = useT()
  const [layerOpen, setLayerOpen] = useState(false)
  const baseMap = useStore((s) => s.baseMap)
  const setBaseMap = useStore((s) => s.setBaseMap)
  const trees = useStore((s) => s.trees)

  const baseMaps: { value: BaseMapKey; label: string }[] = [
    { value: 'osm', label: t.streetMap },
    { value: 'satellite', label: t.satellite },
    { value: 'topo', label: t.topographic },
  ]

  return (
    <div className="map-controls">
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
        onClick={() => setLayerOpen((v) => !v)}
        aria-label={t.mapLayers}
        title={t.mapLayers}
      >
        <i className="fas fa-layer-group" />
      </button>

      <button
        className="toggle-btn"
        onClick={() => mapController.zoomToExtent(trees)}
        aria-label={t.resetView}
        title={t.resetView}
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

      <div className="control-group zoom-controls">
        <button onClick={() => mapController.map?.zoomIn()} aria-label={t.zoomIn} title={t.zoomIn}>
          +
        </button>
        <button onClick={() => mapController.map?.zoomOut()} aria-label={t.zoomOut} title={t.zoomOut}>
          −
        </button>
      </div>
    </div>
  )
}
