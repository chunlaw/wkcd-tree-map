import { useStore } from '../store'
import { useT } from '../useT'

/** Top-left app controls: menu, language, home. */
export default function TopLeftControls() {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const toggleLang = useStore((s) => s.toggleLang)
  const panelOpen = useStore((s) => s.panelOpen)
  const togglePanel = useStore((s) => s.togglePanel)

  return (
    <div className={`top-left-controls${panelOpen ? ' shifted' : ''}`}>
      <button
        className={`toggle-btn${panelOpen ? ' toggle-btn-active' : ''}`}
        onClick={togglePanel}
        aria-label={t.menu}
        title={t.menu}
        aria-expanded={panelOpen}
      >
        <i className="fas fa-bars" />
      </button>

      <button
        className="toggle-btn"
        onClick={toggleLang}
        aria-label={t.switchLanguage}
        title={t.switchLanguage}
        style={{ fontSize: 13, fontWeight: 600 }}
      >
        {lang === 'en' ? '繁' : 'EN'}
      </button>

      <a
        href="https://chunlaw.github.io/"
        className="toggle-btn"
        style={{ textDecoration: 'none' }}
        aria-label={t.backToHome}
        title={t.backToHome}
      >
        <i className="fas fa-home" />
      </a>
    </div>
  )
}
