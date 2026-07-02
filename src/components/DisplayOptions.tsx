import { useStore } from '../store'
import { useT } from '../useT'
import type { LabelType } from '../types'

/** Map display toggles: markers, viewpoints, clustering, labels. */
export default function DisplayOptions() {
  const t = useT()
  const showTrees = useStore((s) => s.showTrees)
  const showViewpoints = useStore((s) => s.showViewpoints)
  const clustering = useStore((s) => s.clustering)
  const labelsEnabled = useStore((s) => s.labelsEnabled)
  const labelType = useStore((s) => s.labelType)

  const setShowTrees = useStore((s) => s.setShowTrees)
  const setShowViewpoints = useStore((s) => s.setShowViewpoints)
  const setClustering = useStore((s) => s.setClustering)
  const setLabelsEnabled = useStore((s) => s.setLabelsEnabled)
  const setLabelType = useStore((s) => s.setLabelType)

  return (
    <div className="filter-section">
      <h4>{t.displayOptions}</h4>
      <div className="filter-option">
        <input
          type="checkbox"
          id="showTrees"
          checked={showTrees}
          onChange={(e) => setShowTrees(e.target.checked)}
        />
        <label htmlFor="showTrees">{t.treeMarkers}</label>
      </div>
      <div className="filter-option">
        <input
          type="checkbox"
          id="showViewpoints"
          checked={showViewpoints}
          onChange={(e) => setShowViewpoints(e.target.checked)}
        />
        <label htmlFor="showViewpoints">{t.photoViewpoints}</label>
      </div>
      <div className="filter-option">
        <input
          type="checkbox"
          id="enableClustering"
          checked={clustering}
          onChange={(e) => setClustering(e.target.checked)}
        />
        <label htmlFor="enableClustering">{t.clusterTrees}</label>
      </div>
      <div className="filter-option">
        <input
          type="checkbox"
          id="showLabels"
          checked={labelsEnabled}
          onChange={(e) => setLabelsEnabled(e.target.checked)}
        />
        <label htmlFor="showLabels">{t.showTreeLabels}</label>
      </div>
      <div className="filter-option">
        <label>
          {t.labelType}
          <select
            value={labelType}
            onChange={(e) => setLabelType(e.target.value as LabelType)}
            aria-label={t.labelType}
          >
            <option value="short">{t.labelShort}</option>
            <option value="chinese">{t.labelChinese}</option>
          </select>
        </label>
      </div>
    </div>
  )
}
