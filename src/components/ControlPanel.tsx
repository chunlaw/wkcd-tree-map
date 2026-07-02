import { useStore } from '../store'
import { useT } from '../useT'
import type { TabName } from '../types'
import FiltersTab from './tabs/FiltersTab'
import SearchTab from './tabs/SearchTab'
import PhotosTab from './tabs/PhotosTab'
import StatsTab from './tabs/StatsTab'
import ToolsTab from './tabs/ToolsTab'

export default function ControlPanel() {
  const t = useT()
  const activeTab = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const panelOpen = useStore((s) => s.panelOpen)
  const togglePanel = useStore((s) => s.togglePanel)

  const tabs: { name: TabName; icon: string; label: string }[] = [
    { name: 'filters', icon: 'fa-filter', label: t.tabFilters },
    { name: 'search', icon: 'fa-search', label: t.tabSearch },
    { name: 'photos', icon: 'fa-images', label: t.tabPhotos },
    { name: 'stats', icon: 'fa-chart-bar', label: t.tabStats },
    { name: 'tools', icon: 'fa-tools', label: t.tabTools },
  ]

  // Container stays mounted (so it can slide); inner content renders only when
  // open so heavy tabs (e.g. Photos gallery) don't load while hidden.
  return (
    <>
      {panelOpen && <div className="drawer-backdrop" onClick={togglePanel} />}
      <div
        className={`main-panel${panelOpen ? ' open' : ''}`}
        aria-hidden={!panelOpen}
      >
        {panelOpen && (
          <div className="panel-content">
            <div className="tabs">
              <button
                className="tab-back"
                onClick={togglePanel}
                aria-label={t.closeLabel}
                title={t.closeLabel}
              >
                <i className="fas fa-arrow-left" />
              </button>
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`tab ${activeTab === tab.name ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.name)}
                  aria-label={tab.label}
                >
                  <i className={`fas ${tab.icon}`} /> {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'filters' && <FiltersTab />}
            {activeTab === 'search' && <SearchTab />}
            {activeTab === 'photos' && <PhotosTab />}
            {activeTab === 'stats' && <StatsTab />}
            {activeTab === 'tools' && <ToolsTab />}
          </div>
        )}
      </div>
    </>
  )
}
