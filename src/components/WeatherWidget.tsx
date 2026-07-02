import { useT } from '../useT'

/** Compact, always-visible weather badge (bottom-right, translucent). */
export default function WeatherWidget() {
  const t = useT()

  return (
    <div className="weather-badge">
      <i className="fas fa-cloud-sun" />
      <span>24°C</span>
      <span className="weather-sep">·</span>
      <span>{t.partlyCloudy}</span>
      <span className="weather-sep">·</span>
      <i className="fas fa-droplet" />
      <span>65%</span>
    </div>
  )
}
