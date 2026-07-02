import { useEffect } from 'react'
import { useStore } from './store'
import { useT } from './useT'
import { translations } from './i18n'
import { mapController } from './lib/mapController'
import MapView from './components/MapView'
import TopLeftControls from './components/TopLeftControls'
import MapControls from './components/MapControls'
import BrandBadge from './components/BrandBadge'
import ControlPanel from './components/ControlPanel'
import WeatherWidget from './components/WeatherWidget'
import MeasurementEditor from './components/MeasurementEditor'
import PhotoModal from './components/PhotoModal'

export default function App() {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const loadData = useStore((s) => s.loadData)
  const dataLoaded = useStore((s) => s.dataLoaded)
  const loadError = useStore((s) => s.loadError)

  useEffect(() => {
    void loadData()
  }, [loadData])

  // Keep the map controller, document title, and <html lang> in sync.
  useEffect(() => {
    mapController.setTranslation(translations[lang])
    document.title = translations[lang].appTitle
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en'
  }, [lang])

  return (
    <>
      <MapView />
      <TopLeftControls />
      <MapControls />
      <BrandBadge />
      <ControlPanel />
      <WeatherWidget />
      <MeasurementEditor />
      <div className="coordinate-display" id="coordinateDisplay" />
      <PhotoModal />

      {!dataLoaded && !loadError && (
        <div className="overlay">
          <div className="spinner" />
          <span>{t.loadingMapData}</span>
        </div>
      )}
      {loadError && (
        <div className="overlay">
          <i
            className="fas fa-triangle-exclamation"
            style={{ fontSize: 28, color: '#dc3545' }}
          />
          <span>{t.failedToLoad}</span>
          <span style={{ fontSize: 12, color: '#666' }}>{loadError}</span>
        </div>
      )}
    </>
  )
}
