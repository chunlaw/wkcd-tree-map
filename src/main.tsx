import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

import './index.css'
import App from './App.tsx'

// Load the brand font from public/brand.ttf, resolved against the app base so
// it works whether served from the domain root or a GitHub Pages subpath.
if ('FontFace' in window) {
  const brandFont = new FontFace(
    'BrandFont',
    `url(${import.meta.env.BASE_URL}brand.ttf)`,
    { display: 'swap' },
  )
  brandFont
    .load()
    .then((f) => document.fonts.add(f))
    .catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
