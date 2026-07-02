import { useMemo } from 'react'
import { useStore } from '../../store'
import { useT } from '../../useT'
import { mapController } from '../../lib/mapController'
import { shareTree } from '../../lib/exporters'
import SpeciesSwatch from '../SpeciesSwatch'
import Button from '../ui/Button'

export default function SearchTab() {
  const t = useT()
  const species = useStore((s) => s.species)
  const query = useStore((s) => s.searchQuery)
  const setQuery = useStore((s) => s.setSearchQuery)
  const selectedTree = useStore((s) => s.selectedTree)

  // Species (not individual trees) whose name matches the query.
  const matched = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return species.order
      .filter(
        (sp) =>
          sp.toLowerCase().includes(q) ||
          (species.chineseNames[sp] ?? '').includes(query.trim()),
      )
      .sort((a, b) => (species.counts[b] ?? 0) - (species.counts[a] ?? 0))
  }, [species, query])

  const treeTotal = matched.reduce((sum, sp) => sum + (species.counts[sp] ?? 0), 0)

  return (
    <div className="tab-content">
      <div className="search-box">
        <input
          type="text"
          value={query}
          placeholder={t.searchPlaceholder}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t.tabSearch}
        />
      </div>

      {query.trim() && (
        <>
          {matched.length === 0 ? (
            <p style={{ color: '#666', fontSize: 13 }}>{t.noTreesFound}</p>
          ) : (
            <>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                {treeTotal} {t.treesUnit} · {matched.length} {t.speciesUnit}
              </p>
              <p style={{ fontSize: 11, color: '#999', marginBottom: 10 }}>
                {t.searchHint}
              </p>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {matched.map((sp) => (
                  <div
                    key={sp}
                    className="search-result"
                    onClick={() => mapController.zoomToSpecies(sp)}
                    title={sp}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SpeciesSwatch
                        shape={species.shapes[sp]}
                        color={species.colors[sp]}
                      />
                      <span style={{ flex: 1 }}>
                        <strong className="scientific-name">{sp}</strong>
                        {species.chineseNames[sp] && (
                          <span style={{ color: '#666' }}>
                            {' '}
                            {species.chineseNames[sp]}
                          </span>
                        )}
                      </span>
                      <span className="legend-count">{species.counts[sp] ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {selectedTree && (
        <div className="tree-detail">
          <h4 className="scientific-name">
            {selectedTree.properties.botanical_name}
          </h4>
          <div className="detail-row">
            <span className="detail-label">{t.chineseName}: </span>
            <span className="detail-value">
              {selectedTree.properties.chinese_name}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t.treeId}: </span>
            <span className="detail-value">#{selectedTree.properties.fid}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t.coordinates}: </span>
            <span className="detail-value">
              {selectedTree.geometry.coordinates[1].toFixed(6)},{' '}
              {selectedTree.geometry.coordinates[0].toFixed(6)}
            </span>
          </div>
          {selectedTree.properties.remarks && (
            <div className="detail-row">
              <span className="detail-label">{t.remarks}: </span>
              <span className="detail-value">
                {selectedTree.properties.remarks}
              </span>
            </div>
          )}
          <div className="action-buttons">
            <Button
              icon="fa-location-arrow"
              onClick={() => mapController.locateTree(selectedTree)}
            >
              {t.locate}
            </Button>
            <Button
              variant="secondary"
              icon="fa-share-alt"
              onClick={() => shareTree(selectedTree.properties.fid)}
            >
              {t.share}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
