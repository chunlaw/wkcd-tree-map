import { useMemo } from 'react'
import { useStore } from '../../store'
import { useT } from '../../useT'
import { getShortScientificName } from '../../lib/species'

export default function StatsTab() {
  const t = useT()
  const trees = useStore((s) => s.trees)
  const viewpoints = useStore((s) => s.viewpoints)
  const species = useStore((s) => s.species)

  // Species sorted by tree count (most common first).
  const rows = useMemo(
    () =>
      [...species.order].sort(
        (a, b) =>
          (species.counts[b] ?? 0) - (species.counts[a] ?? 0) ||
          a.localeCompare(b),
      ),
    [species],
  )

  return (
    <div className="tab-content">
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{trees.length}</div>
          <div className="stat-label">{t.totalTrees}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{species.order.length}</div>
          <div className="stat-label">{t.speciesCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{viewpoints.length}</div>
          <div className="stat-label">{t.photoPoints}</div>
        </div>
      </div>

      <table className="stats-table">
        <thead>
          <tr>
            <th>{t.colSpecies}</th>
            <th className="stats-table-count">{t.colTreeCount}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((sp) => (
            <tr key={sp}>
              <td>
                <span className="sci scientific-name">
                  {getShortScientificName(sp)}
                </span>
                {species.chineseNames[sp] && (
                  <span className="zh">{species.chineseNames[sp]}</span>
                )}
              </td>
              <td className="stats-table-count">{species.counts[sp] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
