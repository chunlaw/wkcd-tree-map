import { useStore } from '../store'
import { useT } from '../useT'
import type { TabName } from '../types'
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
    { name: 'search', icon: 'fa-search', label: t.tabSearch },
    { name: 'photos', icon: 'fa-images', label: t.tabPhotos },
    { name: 'stats', icon: 'fa-chart-bar', label: t.tabStats },
    { name: 'tools', icon: 'fa-tools', label: t.tabTools },
  ]

  return (
    <div className="main-panel">
      <div className="panel-header" onClick={togglePanel}>
        <h3>{t.appTitle}</h3>
        <i className={`fas ${panelOpen ? 'fa-chevron-down' : 'fa-chevron-up'}`} />
      </div>

      {panelOpen && (
        <div className="panel-content">
          <div className="tabs">
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

          {activeTab === 'search' && <SearchTab />}
          {activeTab === 'photos' && <PhotosTab />}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'tools' && <ToolsTab />}
        </div>
      )}
    </div>
  )
}
