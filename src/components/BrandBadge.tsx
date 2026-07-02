import { translations } from '../i18n'

/** Bilingual brand wordmark — translucent pill, bottom-left. */
export default function BrandBadge() {
  return (
    <div className="brand-badge">
      <i className="fas fa-tree" />
      <div className="brand-names">
        <span className="brand-zh">{translations.zh.appTitle}</span>
        <span className="brand-en">{translations.en.appTitle}</span>
      </div>
    </div>
  )
}
