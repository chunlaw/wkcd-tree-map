import { useStore } from '../../store'
import { useT } from '../../useT'
import { mapController } from '../../lib/mapController'
import { exportTrees, printMap, shareMap } from '../../lib/exporters'
import Button from '../ui/Button'
import type { CoordSystem } from '../../types'

export default function ToolsTab() {
  const t = useT()
  const trees = useStore((s) => s.trees)
  const checked = useStore((s) => s.checkedSpecies)
  const coordSystem = useStore((s) => s.coordSystem)
  const setCoordSystem = useStore((s) => s.setCoordSystem)

  const filteredTrees = () =>
    trees.filter((f) => checked.has(f.properties.botanical_name))

  return (
    <div className="tab-content">
      <div className="filter-section">
        <h4>{t.measurementTools}</h4>
        <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px' }}>
          {t.measureHint}
        </p>
        <div className="action-buttons">
          <Button
            icon="fa-ruler"
            onClick={() => mapController.startMeasurement('distance')}
          >
            {t.distance}
          </Button>
          <Button
            icon="fa-draw-polygon"
            onClick={() => mapController.startMeasurement('area')}
          >
            {t.area}
          </Button>
        </div>
        <div className="action-buttons" style={{ marginTop: 10 }}>
          <Button
            variant="secondary"
            icon="fa-rotate-left"
            onClick={() => mapController.undoMeasurement()}
          >
            {t.undo}
          </Button>
          <Button
            variant="danger"
            icon="fa-trash"
            onClick={() => mapController.clearMeasurements()}
          >
            {t.clear}
          </Button>
        </div>
      </div>

      <div className="filter-section">
        <h4>{t.coordinateSystem}</h4>
        {(['WGS84', 'HK1980'] as CoordSystem[]).map((sys) => (
          <div className="filter-option" key={sys}>
            <label>
              <input
                type="radio"
                name="coordSystem"
                value={sys}
                checked={coordSystem === sys}
                onChange={() => setCoordSystem(sys)}
              />
              {sys === 'WGS84' ? t.wgs84 : t.hk1980}
            </label>
          </div>
        ))}
      </div>

      <div className="filter-section">
        <h4>{t.exportData}</h4>
        <div className="action-buttons">
          <Button icon="fa-file-csv" onClick={() => exportTrees('csv', filteredTrees())}>
            CSV
          </Button>
          <Button
            icon="fa-file-code"
            onClick={() => exportTrees('geojson', filteredTrees())}
          >
            GeoJSON
          </Button>
        </div>
        <div className="action-buttons" style={{ marginTop: 10 }}>
          <Button variant="secondary" icon="fa-share-alt" onClick={shareMap}>
            {t.share}
          </Button>
          <Button variant="secondary" icon="fa-print" onClick={printMap}>
            {t.print}
          </Button>
        </div>
      </div>
    </div>
  )
}
