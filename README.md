# WKCD Tree Map

An interactive map of the trees in Hong Kong's **West Kowloon Cultural District** —
a coastal park with ~2,100 trees across ~120 species, plus 116 photo viewpoints.

It's a modern **React 19 + TypeScript + Vite** rewrite of the original single-file
`wkcd-trees.html` (vanilla HTML/JS/CSS), rebuilt as a componentised app with
bilingual UI, taxonomic grouping, a photo gallery, and measurement tools.

## Features

**Map**

- Leaflet map defaulting to **Satellite** imagery (Street / Topographic also available)
- ~2,100 tree markers, colour- and shape-coded per species, with clustering
- 116 photo **viewpoints** with heading arrows and field-of-view "viewshed" cones
- Geolocation, "fit all trees", and shareable deep links (`?lat&lng&zoom&tree`)

**Filters panel** (top-right, unified legend + controls)

- Legend key + per-species colour list with **live tree counts**
- **Group by** None / Family / Genus (families sourced from a botanical database)
- Show/hide markers, viewpoints, clustering, and species labels
- Species search, per-species / per-group toggles, and Select all / Unselect all
- Click a species (or a group) to show/hide it directly on the map

**Bottom-left box** (tabbed)

- **Search** — type a name; matching trees are highlighted while the rest (and
  clusters with no match) are **dimmed**. Results are summarised per species;
  click one to zoom to it. Clicking a marker shows its detail card.
- **Photos** — a lazy-loaded thumbnail gallery (throttled to protect the CDN);
  click to open the full-screen viewer, or the corner button to locate it on the map
- **Stats** — totals plus a per-species table (short scientific + Chinese name, count)
- **Tools** — distance/area **measurement** (recolour each shape via a picker,
  with Undo/Clear), WGS84/HK1980 coordinate readout, and CSV/GeoJSON export

**Everything is bilingual** — an **English / 繁體中文** toggle covers the whole
interface (including map popups and alerts). The initial language follows the
browser and is remembered in `localStorage`.

## Tech stack

- React 19 · TypeScript · Vite
- [Zustand](https://github.com/pmndrs/zustand) for app state
- [Leaflet](https://leafletjs.com/) + `leaflet.markercluster` + `leaflet-draw`
- [react-colorful](https://github.com/omgovich/react-colorful) for the measurement colour picker
- Font Awesome (bundled); hand-written CSS with design tokens

## Architecture

UI state lives in a Zustand store (`src/store.ts`). All imperative Leaflet work —
base layers, markers, clustering, draw tools, viewsheds, popups — is isolated in a
controller singleton (`src/lib/mapController.ts`). A thin `MapView` component
initialises the controller and drives it from store changes via effects, so React
owns declarative UI while Leaflet keeps its imperative API where it shines.

```
src/
  config.ts            map / image config + URL helpers
  types.ts             GeoJSON + UI types
  store.ts             Zustand store (data + UI state)
  i18n.ts / useT.ts    English + Traditional Chinese strings
  data/families.ts     species -> botanical family (+ Chinese names)
  lib/
    mapController.ts    imperative Leaflet controller (map, layers, draw)
    species.ts          colour palette, shapes, counts, name helpers
    geo.ts              distance, viewshed, coordinate formatting
    exporters.ts        CSV / GeoJSON export, share, print
    imageQueue.ts       concurrency-limited image loader (CDN throttling)
  components/
    MapView.tsx          map lifecycle + reactive layer updates
    TopLeftControls.tsx  zoom, base map, language, geolocate
    ControlPanel.tsx     bottom-left box (Search / Photos / Stats / Tools)
    LegendPanel.tsx      top-right panel: weather strip + Filters
      DisplayOptions.tsx   marker/viewpoint/cluster/label toggles
      SpeciesLegend.tsx    species search, group-by, legend + filtering
      SpeciesSwatch.tsx    coloured marker-shape swatch
    MeasurementEditor.tsx  colour picker for drawn shapes
    PhotoModal.tsx       full-screen viewpoint gallery
    tabs/                Search / Photos / Stats / Tools
    ui/Button.tsx        shared button primitive
public/
  wkcd_tree.geojson, viewphoto.geojson   datasets (served statically)
```

## Data

`public/wkcd_tree.geojson` (trees) and `public/viewphoto.geojson` (photo
viewpoints) are the datasets from the original project, fetched at runtime.
Family classifications in `src/data/families.ts` were compiled from a botanical
attribute database and use its traditional (Cronquist-style) circumscription.

## Configuration

Image hosting defaults match the published site. Override via a `.env` file with
`VITE_`-prefixed variables:

```
VITE_GITHUB_RAW_BASE=...
VITE_CLOUDFLARE_IMAGE_DELIVERY_URL=...
VITE_CLOUDFLARE_IMAGE_VARIANT_THUMBNAIL=H300
VITE_CLOUDFLARE_IMAGE_VARIANT_FULL=public
```

Photos load from Cloudflare Images with a GitHub raw fallback; the gallery
throttles concurrent requests (`src/lib/imageQueue.ts`) to avoid CDN rate limits.

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck (tsc -b) + production build
npm run lint     # eslint
npm run preview  # preview the production build
```
