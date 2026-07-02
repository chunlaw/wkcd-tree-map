import { useStore } from '../store'
import { useT } from '../useT'
import DisplayOptions from './DisplayOptions'
import SpeciesLegend from './SpeciesLegend'

/**
 * Unified top-right panel: a small weather strip on top and a collapsible,
 * scrollable legend below. Same layout on desktop and mobile.
 */
export default function LegendPanel() {
  const t = useT()
  const legendOpen = useStore((s) => s.legendOpen)
  const toggleLegend = useStore((s) => s.toggleLegend)

  return (
    <div className="side-panel">
      <div className="weather-content">
        <h4>
          <i className="fas fa-cloud-sun" /> {t.weather}
        </h4>
        <div className="weather-info">
          <div className="weather-temp">24°C</div>
          <div className="weather-desc">
            {t.partlyCloudy}
            <br />
            {t.humidity}: 65%
          </div>
        </div>
      </div>

      <div
        className="legend-header"
        onClick={toggleLegend}
        role="button"
        tabIndex={0}
        aria-expanded={legendOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleLegend()
          }
        }}
      >
        <h4>{t.tabFilters}</h4>
        <i className={`fas ${legendOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
      </div>

      {legendOpen && (
        <div className="legend-body">
          <DisplayOptions />
          <SpeciesLegend idPrefix="legend" />
        </div>
      )}
    </div>
  )
}
