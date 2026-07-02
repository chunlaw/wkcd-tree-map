import DisplayOptions from '../DisplayOptions'
import SpeciesLegend from '../SpeciesLegend'

/** Drawer tab: display toggles, legend + species filtering. */
export default function FiltersTab() {
  return (
    <div className="tab-content">
      <DisplayOptions />
      <SpeciesLegend idPrefix="legend" />
    </div>
  )
}
