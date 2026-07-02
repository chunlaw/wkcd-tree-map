import { useMemo } from 'react'
import { useStore } from '../store'
import { useT } from '../useT'
import type { GroupBy, LegendNameType } from '../types'
import { getShortScientificName } from '../lib/species'
import { familyChinese, getFamily, getGenus } from '../data/families'
import SpeciesSwatch from './SpeciesSwatch'

function displayName(
  sp: string,
  type: LegendNameType,
  chineseNames: Record<string, string>,
): string {
  if (type === 'short') return getShortScientificName(sp)
  if (type === 'chinese') return chineseNames[sp] ?? sp
  return sp
}

interface Group {
  key: string
  /** Rendered header label (may include a Chinese family name). */
  label: string
  /** Whether the label is a Latin (italic) name. */
  scientific: boolean
  species: string[]
}

export default function SpeciesLegend({ idPrefix }: { idPrefix: string }) {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const species = useStore((s) => s.species)
  const legendNameType = useStore((s) => s.legendNameType)
  const setLegendNameType = useStore((s) => s.setLegendNameType)
  const checkedSpecies = useStore((s) => s.checkedSpecies)
  const setSpeciesChecked = useStore((s) => s.setSpeciesChecked)
  const setAllSpecies = useStore((s) => s.setAllSpecies)
  const groupBy = useStore((s) => s.groupBy)
  const setGroupBy = useStore((s) => s.setGroupBy)
  const collapsedGroups = useStore((s) => s.collapsedGroups)
  const toggleGroupCollapsed = useStore((s) => s.toggleGroupCollapsed)
  const speciesSearch = useStore((s) => s.speciesSearch)
  const setSpeciesSearch = useStore((s) => s.setSpeciesSearch)

  // Species matching the search box (scientific or Chinese name).
  const filteredOrder = useMemo(() => {
    const q = speciesSearch.trim().toLowerCase()
    if (!q) return species.order
    return species.order.filter((sp) => {
      const chinese = species.chineseNames[sp] ?? ''
      return sp.toLowerCase().includes(q) || chinese.includes(speciesSearch.trim())
    })
  }, [species.order, species.chineseNames, speciesSearch])

  const groups = useMemo<Group[]>(() => {
    if (groupBy === 'none') {
      return [{ key: '__all__', label: '', scientific: false, species: filteredOrder }]
    }
    const byKey = new Map<string, string[]>()
    for (const sp of filteredOrder) {
      const key = groupBy === 'family' ? getFamily(sp) : getGenus(sp)
      const list = byKey.get(key)
      if (list) list.push(sp)
      else byKey.set(key, [sp])
    }
    const result: Group[] = []
    for (const [key, list] of byKey) {
      let label = key
      let scientific = false
      if (groupBy === 'family') {
        const zh = familyChinese[key]
        label = lang === 'zh' && zh ? `${key} ${zh}` : key
      } else {
        scientific = true // genus is a Latin name
      }
      result.push({ key, label, scientific, species: list })
    }
    // Largest groups first, then alphabetical.
    result.sort((a, b) => b.species.length - a.species.length || a.key.localeCompare(b.key))
    return result
  }, [groupBy, filteredOrder, lang])

  const renderSpecies = (sp: string) => {
    const on = checkedSpecies.has(sp)
    return (
      <div
        className={`legend-item legend-item-clickable${on ? '' : ' legend-item-off'}`}
        key={sp}
        role="button"
        tabIndex={0}
        aria-pressed={on}
        title={sp}
        onClick={() => setSpeciesChecked(sp, !on)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setSpeciesChecked(sp, !on)
          }
        }}
      >
        <SpeciesSwatch shape={species.shapes[sp]} color={species.colors[sp]} />
        <span
          className={legendNameType === 'chinese' ? '' : 'scientific-name'}
          style={{ fontSize: 11, marginLeft: 8 }}
        >
          {displayName(sp, legendNameType, species.chineseNames)}
        </span>
        <span className="legend-count">{species.counts[sp] ?? 0}</span>
      </div>
    )
  }

  return (
    <>
      <div className="legend-item">
        <i className="fas fa-tree" style={{ color: '#2c5f2d', marginRight: 8 }} />
        <span>{t.tree}</span>
      </div>
      <div className="legend-item">
        <i className="fas fa-eye" style={{ color: '#4a90e2', marginRight: 8 }} />
        <span>{t.photoViewpoint}</span>
      </div>

      <h4 className="legend-section-title">{t.speciesFilter}</h4>

      <div className="search-box" style={{ marginBottom: 8 }}>
        <input
          type="text"
          value={speciesSearch}
          placeholder={t.searchSpecies}
          onChange={(e) => setSpeciesSearch(e.target.value)}
          aria-label={t.searchSpecies}
        />
      </div>

      <div className="legend-name-toggle">
        <label htmlFor={`${idPrefix}NameType`}>{t.nameType}</label>
        <select
          id={`${idPrefix}NameType`}
          value={legendNameType}
          onChange={(e) => setLegendNameType(e.target.value as LegendNameType)}
          aria-label={t.nameType}
        >
          <option value="short">{t.nameShort}</option>
          <option value="full">{t.nameFull}</option>
          <option value="chinese">{t.nameChinese}</option>
        </select>
      </div>

      <div className="legend-name-toggle">
        <label htmlFor={`${idPrefix}GroupBy`}>{t.groupBy}</label>
        <select
          id={`${idPrefix}GroupBy`}
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          aria-label={t.groupBy}
        >
          <option value="none">{t.groupNone}</option>
          <option value="family">{t.groupFamily}</option>
          <option value="genus">{t.groupGenus}</option>
        </select>
      </div>

      <div className="legend-select-actions">
        <button type="button" onClick={() => setAllSpecies(filteredOrder, true)}>
          {t.selectAllShort}
        </button>
        <button type="button" onClick={() => setAllSpecies(filteredOrder, false)}>
          {t.unselectAll}
        </button>
      </div>

      {filteredOrder.length === 0 ? (
        <p style={{ color: '#666', fontSize: 12, padding: '4px 0' }}>
          {t.noTreesFound}
        </p>
      ) : groupBy === 'none' ? (
        <div>{groups[0].species.map(renderSpecies)}</div>
      ) : (
        groups.map((g) => {
          const allOn = g.species.every((sp) => checkedSpecies.has(sp))
          const noneOn = g.species.every((sp) => !checkedSpecies.has(sp))
          const collapsed = collapsedGroups.has(g.key)
          const treeTotal = g.species.reduce(
            (sum, sp) => sum + (species.counts[sp] ?? 0),
            0,
          )
          return (
            <div className="legend-group" key={g.key}>
              <div className={`legend-group-header${noneOn ? ' legend-item-off' : ''}`}>
                <span
                  className="legend-group-name"
                  role="button"
                  tabIndex={0}
                  aria-pressed={allOn}
                  title={g.label}
                  onClick={() => setAllSpecies(g.species, !allOn)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setAllSpecies(g.species, !allOn)
                    }
                  }}
                >
                  <span className={g.scientific ? 'scientific-name' : undefined}>
                    {g.label}
                  </span>{' '}
                  <span className="legend-group-count" title={`${g.species.length}`}>
                    ({treeTotal})
                  </span>
                </span>
                <button
                  className="legend-group-toggle"
                  onClick={() => toggleGroupCollapsed(g.key)}
                  aria-expanded={!collapsed}
                  aria-label={g.label}
                >
                  <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-down'}`} />
                </button>
              </div>
              {!collapsed && (
                <div className="legend-group-species">
                  {g.species.map(renderSpecies)}
                </div>
              )}
            </div>
          )
        })
      )}
    </>
  )
}
