import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet-draw'
import type {
  BaseMapKey,
  CoordSystem,
  LabelType,
  TreeFeature,
  ViewpointFeature,
} from '../types'
import {
  BRAND_GREEN,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MEASURE_COLOR,
  VIEWPOINT_MIN_ZOOM,
} from '../config'
import { translations, type Translation } from '../i18n'
import { getShortScientificName, markerShapeHtml } from './species'
import { formatCoord, polylineDistance, viewshedPolygonPoints } from './geo'
import {
  CLOUDFLARE_IMAGE_VARIANT_THUMBNAIL,
  getCloudflareImageUrl,
  getGithubImageUrl,
} from '../config'

// leaflet-draw 1.0.4 ships a touch handler that throws with Leaflet >= 1.8.
// Neutralising it keeps distance/area drawing working on touch devices.
const drawPolyline = (L as unknown as { Draw?: { Polyline?: { prototype: Record<string, unknown> } } }).Draw?.Polyline
if (drawPolyline) {
  drawPolyline.prototype._onTouch = L.Util.falseFn
}

/** A measurement shape selected for colour editing. */
export interface MeasurementSelection {
  layer: L.Path
  color: string
  text: string
}

interface TreeEntry {
  marker: L.Marker
  species: string
}

/**
 * Imperative Leaflet controller. Owns the map instance and all layers, and
 * exposes granular methods that the React layer calls from effects / handlers.
 */
class MapController {
  map: L.Map | null = null
  private baseLayers: Record<BaseMapKey, L.TileLayer> | null = null
  private clusterGroup: L.MarkerClusterGroup | null = null
  private plainGroup: L.LayerGroup = L.layerGroup()
  private viewpointGroup: L.LayerGroup = L.layerGroup()
  private viewpointMarkers: L.Marker[] = []
  private showViewpointsPref = true
  private drawnItems: L.FeatureGroup = L.featureGroup()
  private drawnStack: L.Layer[] = []
  private measurementText = new WeakMap<L.Layer, string>()
  private treeEntries = new Map<number, TreeEntry>()
  private markerSpecies = new WeakMap<L.Marker, string>()
  private matchedSpecies: Set<string> | null = null
  private viewshed: L.Polygon | null = null
  private coordSystem: CoordSystem = 'WGS84'
  private t: Translation = translations.en

  // Callbacks wired by React
  onSelectTree: (t: TreeFeature) => void = () => {}
  onOpenPhoto: (index: number) => void = () => {}
  onViewChange: (center: L.LatLng, zoom: number) => void = () => {}
  onSelectMeasurement: (sel: MeasurementSelection | null) => void = () => {}

  init(container: HTMLElement): void {
    if (this.map) return
    const map = L.map(container, {
      center: [22.2998, 114.157],
      zoom: 18,
      maxZoom: MAP_MAX_ZOOM,
      minZoom: MAP_MIN_ZOOM,
      zoomControl: false,
    })
    this.map = map

    this.baseLayers = {
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxNativeZoom: 19,
        maxZoom: MAP_MAX_ZOOM,
      }),
      satellite: L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri, DigitalGlobe, GeoEye, Earthstar Geographics',
          maxNativeZoom: 19,
          maxZoom: MAP_MAX_ZOOM,
        },
      ),
      topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap contributors',
        maxNativeZoom: 17,
        maxZoom: MAP_MAX_ZOOM,
      }),
    }
    this.baseLayers.satellite.addTo(map)

    map.addLayer(this.drawnItems)

    // Cursor coordinate readout (imperative DOM to avoid re-render storms).
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const el = document.getElementById('coordinateDisplay')
      if (!el) return
      el.textContent = formatCoord(e.latlng, this.coordSystem)
      el.classList.add('active')
    })
    map.on('mouseout', () => {
      document.getElementById('coordinateDisplay')?.classList.remove('active')
    })

    // Measurement popups on shape creation.
    map.on(L.Draw.Event.CREATED, ((e: L.DrawEvents.Created) => {
      const layer = e.layer
      this.drawnItems.addLayer(layer)
      this.drawnStack.push(layer)
      let measurement = ''
      if (e.layerType === 'polyline') {
        const d = polylineDistance(map, (layer as L.Polyline).getLatLngs() as L.LatLng[])
        measurement = `${this.t.distance}: ${d.toFixed(2)} m`
      } else if (e.layerType === 'polygon' || e.layerType === 'rectangle') {
        const latlngs = (layer as L.Polygon).getLatLngs()[0] as L.LatLng[]
        const area = L.GeometryUtil.geodesicArea(latlngs)
        measurement = `${this.t.area}: ${area.toFixed(2)} m²`
      } else if (e.layerType === 'circle') {
        const radius = (layer as L.Circle).getRadius()
        const area = Math.PI * radius * radius
        measurement = `${this.t.radius}: ${radius.toFixed(2)} m · ${this.t.area}: ${area.toFixed(2)} m²`
      }
      this.measurementText.set(layer, measurement)
      layer.on('click', () => this.selectMeasurement(layer))
      this.selectMeasurement(layer)
    }) as L.LeafletEventHandlerFn)

    let t: ReturnType<typeof setTimeout>
    map.on('moveend zoomend', () => {
      clearTimeout(t)
      t = setTimeout(() => {
        this.onViewChange(map.getCenter(), map.getZoom())
      }, 500)
    })

    // Show/hide viewpoints as the zoom crosses the threshold.
    map.on('zoomend', () => this.updateViewpointVisibility())
  }

  destroy(): void {
    this.map?.remove()
    this.map = null
    this.clusterGroup = null
    this.baseLayers = null
    // Keep the same group instances (they are the "stack" that Clear and new
    // draws operate on); just empty them so a remount can reuse them safely.
    this.plainGroup.clearLayers()
    this.viewpointGroup.clearLayers()
    this.drawnItems.clearLayers()
    this.drawnStack = []
    this.treeEntries.clear()
  }

  // ---- build markers (called once after data load) ----

  buildTreeMarkers(
    trees: TreeFeature[],
    colors: Record<string, string>,
    shapes: Record<string, import('../types').MarkerShape>,
  ): void {
    this.treeEntries.clear()
    for (const feature of trees) {
      const [lng, lat] = feature.geometry.coordinates
      const props = feature.properties
      const color = colors[props.botanical_name] ?? BRAND_GREEN
      const shape = shapes[props.botanical_name] ?? 'circle'

      const icon = L.divIcon({
        className: 'tree-marker',
        html: markerShapeHtml(shape, color),
        iconSize: shape === 'triangle' ? [16, 14] : [12, 12],
      })
      const marker = L.marker([lat, lng], { icon })
      marker.bindPopup(
        () =>
          `<div class="tree-popup">
          <h5 class="scientific-name">${props.botanical_name}</h5>
          <p><strong>${this.t.chinese}:</strong> ${props.chinese_name}</p>
          <p><strong>${this.t.id}:</strong> ${props.fid}</p>
          ${props.remarks ? `<p><strong>${this.t.remarks}:</strong> ${props.remarks}</p>` : ''}
        </div>`,
      )
      marker.on('click', () => this.onSelectTree(feature))
      this.markerSpecies.set(marker, props.botanical_name)
      this.treeEntries.set(props.fid, { marker, species: props.botanical_name })
    }
  }

  /** Cluster icon: replicates the default look, dimmed when no child matches. */
  private clusterIcon(cluster: L.MarkerCluster): L.DivIcon {
    const count = cluster.getChildCount()
    let size = 'small'
    if (count >= 100) size = 'large'
    else if (count >= 10) size = 'medium'

    let dim = ''
    if (this.matchedSpecies) {
      const anyMatch = cluster
        .getAllChildMarkers()
        .some((m) => {
          const sp = this.markerSpecies.get(m as L.Marker)
          return sp !== undefined && this.matchedSpecies!.has(sp)
        })
      if (!anyMatch) dim = ' marker-cluster-dim'
    }

    return L.divIcon({
      html: `<div><span>${count}</span></div>`,
      className: `marker-cluster marker-cluster-${size}${dim}`,
      iconSize: L.point(40, 40),
    })
  }

  buildViewpointMarkers(viewpoints: ViewpointFeature[]): void {
    this.viewpointGroup.clearLayers()
    this.viewpointMarkers = []
    viewpoints.forEach((feature, index) => {
      const [lng, lat] = feature.geometry.coordinates
      const props = feature.properties
      const icon = L.divIcon({
        className: 'viewpoint-marker',
        // Use text-shadow (cheap) instead of filter: drop-shadow — a CSS filter
        // creates a GPU compositing layer per marker, and repainting all ~116
        // viewpoints each pan/zoom frame is a major mobile bottleneck.
        html: `<div style="transform: rotate(${props.rotation}deg);"><i class="fas fa-eye" style="color:#4a90e2;font-size:18px;text-shadow:0 0 2px #fff,0 0 3px #fff;"></i></div>`,
        iconSize: [18, 18],
      })
      const marker = L.marker([lat, lng], { icon })
      marker.bindPopup(() => this.buildViewpointPopup(feature, index))
      marker.on('mouseover', () => this.drawViewshed(lng, lat, props.rotation))
      marker.on('mouseout', () => this.clearViewshed())
      this.viewpointGroup.addLayer(marker)
      this.viewpointMarkers[index] = marker
    })
  }

  /** Pan to a viewpoint (only if off-screen) and open its popup. */
  locateViewpoint(index: number): void {
    if (!this.map) return
    const marker = this.viewpointMarkers[index]
    if (!marker) return
    const latlng = marker.getLatLng()
    // Zoom in past the threshold if needed, otherwise just pan if off-screen.
    if (this.map.getZoom() < VIEWPOINT_MIN_ZOOM) {
      this.map.setView(latlng, VIEWPOINT_MIN_ZOOM)
    } else if (!this.map.getBounds().contains(latlng)) {
      this.map.panTo(latlng)
    }
    // Ensure viewpoints are on the map so the popup can open.
    if (!this.map.hasLayer(this.viewpointGroup)) {
      this.map.addLayer(this.viewpointGroup)
    }
    marker.openPopup()
  }

  private buildViewpointPopup(
    feature: ViewpointFeature,
    index: number,
  ): HTMLElement {
    const props = feature.properties
    const el = L.DomUtil.create('div', 'tree-popup viewpoint-popup')
    const title = L.DomUtil.create('h5', '', el)
    title.textContent = `${this.t.photo}: ${props.filename}`
    const rot = L.DomUtil.create('p', '', el)
    rot.innerHTML = `<strong>${this.t.rotation}:</strong> ${props.rotation}°`

    // Loading placeholder shown until the image loads (or finally fails).
    const loader = L.DomUtil.create('div', 'popup-loader', el)
    loader.innerHTML = '<div class="spinner"></div>'

    const img = L.DomUtil.create('img', '', el) as HTMLImageElement
    img.alt = 'Viewpoint photo'
    // Hidden until loaded. Note: do NOT use loading="lazy" here — a lazy image
    // with display:none has no layout box, so the browser never fetches it and
    // onload never fires (spinner would spin forever).
    img.style.display = 'none'

    const fallback = L.DomUtil.create('p', '', el)
    fallback.style.cssText = 'display:none;color:#999;font-size:12px;'
    fallback.textContent = this.t.imageNotAvailable

    const cloudflare = getCloudflareImageUrl(
      props.image_id,
      CLOUDFLARE_IMAGE_VARIANT_THUMBNAIL,
    )
    const github = getGithubImageUrl(props.filename)
    let triedGithub = !cloudflare
    img.onload = () => {
      loader.style.display = 'none'
      img.style.display = ''
    }
    img.onerror = () => {
      if (!triedGithub && github) {
        triedGithub = true
        img.src = github
        return
      }
      loader.style.display = 'none'
      img.style.display = 'none'
      fallback.style.display = 'block'
    }
    img.src = cloudflare ?? github ?? ''
    L.DomEvent.on(img, 'click', () => this.onOpenPhoto(index))
    return el
  }

  private drawViewshed(lng: number, lat: number, rotation: number): void {
    if (!this.map) return
    this.clearViewshed()
    const points = viewshedPolygonPoints(lng, lat, rotation)
    this.viewshed = L.polygon(points, {
      color: BRAND_GREEN,
      fillColor: BRAND_GREEN,
      fillOpacity: 0.2,
      weight: 2,
      className: 'viewshed-cone',
    }).addTo(this.map)
  }

  private clearViewshed(): void {
    if (this.viewshed && this.map) {
      this.map.removeLayer(this.viewshed)
      this.viewshed = null
    }
  }

  // ---- reactive updates ----

  applyTreeDisplay(
    show: boolean,
    clustering: boolean,
    checked: Set<string>,
  ): void {
    if (!this.map) return
    if (this.clusterGroup) {
      this.map.removeLayer(this.clusterGroup)
      this.clusterGroup.clearLayers()
    }
    this.map.removeLayer(this.plainGroup)
    this.plainGroup.clearLayers()
    if (!show) return

    const visible: L.Marker[] = []
    for (const { marker, species } of this.treeEntries.values()) {
      if (checked.has(species)) visible.push(marker)
    }

    if (clustering) {
      if (!this.clusterGroup) {
        this.clusterGroup = L.markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          iconCreateFunction: (cluster) => this.clusterIcon(cluster),
        })
      }
      this.clusterGroup.addLayers(visible)
      this.map.addLayer(this.clusterGroup)
    } else {
      for (const m of visible) this.plainGroup.addLayer(m)
      this.map.addLayer(this.plainGroup)
    }
  }

  toggleViewpoints(show: boolean): void {
    this.showViewpointsPref = show
    this.updateViewpointVisibility()
  }

  /** Viewpoints show only when enabled AND zoomed in past the threshold. */
  private updateViewpointVisibility(): void {
    if (!this.map) return
    const shouldShow =
      this.showViewpointsPref && this.map.getZoom() >= VIEWPOINT_MIN_ZOOM
    const has = this.map.hasLayer(this.viewpointGroup)
    if (shouldShow && !has) this.map.addLayer(this.viewpointGroup)
    else if (!shouldShow && has) this.map.removeLayer(this.viewpointGroup)
  }

  updateLabels(enabled: boolean, type: LabelType): void {
    for (const [, entry] of this.treeEntries) {
      const marker = entry.marker
      marker.unbindTooltip()
      if (!enabled) continue
      const label =
        type === 'short'
          ? getShortScientificName(entry.species)
          : this.chineseNameFor(entry.species)
      marker.bindTooltip(label, {
        permanent: true,
        direction: 'top',
        className: 'tree-label',
        offset: [0, -10],
      })
    }
  }

  private chineseFor: Record<string, string> = {}
  setChineseNames(map: Record<string, string>): void {
    this.chineseFor = map
  }
  private chineseNameFor(species: string): string {
    return this.chineseFor[species] ?? species
  }

  setBaseMap(key: BaseMapKey): void {
    if (!this.map || !this.baseLayers) return
    for (const layer of Object.values(this.baseLayers)) {
      this.map.removeLayer(layer)
    }
    this.baseLayers[key].addTo(this.map)
  }

  setCoordSystem(system: CoordSystem): void {
    this.coordSystem = system
  }

  setTranslation(t: Translation): void {
    this.t = t
  }

  // ---- actions ----

  setView(lat: number, lng: number, zoom: number): void {
    if (!this.map) return
    const z = Math.max(
      this.map.getMinZoom(),
      Math.min(this.map.getMaxZoom(), zoom),
    )
    this.map.setView([lat, lng], z)
  }

  locateTree(feature: TreeFeature, zoom = 20): void {
    const [lng, lat] = feature.geometry.coordinates
    this.setView(lat, lng, zoom)
    const entry = this.treeEntries.get(feature.properties.fid)
    entry?.marker.openPopup()
  }

  /** Dim tree markers (and clusters) whose species is not in `matched`. */
  highlightSpecies(matched: Set<string> | null): void {
    this.matchedSpecies = matched
    for (const { marker, species } of this.treeEntries.values()) {
      marker.setOpacity(!matched || matched.has(species) ? 1 : 0.2)
    }
    // Re-render cluster icons so those without a match get dimmed.
    if (this.clusterGroup && this.map?.hasLayer(this.clusterGroup)) {
      this.clusterGroup.refreshClusters()
    }
  }

  /** Fit the map to all trees of a given species. */
  zoomToSpecies(speciesName: string): void {
    if (!this.map) return
    const pts: L.LatLng[] = []
    for (const { marker, species } of this.treeEntries.values()) {
      if (species === speciesName) pts.push(marker.getLatLng())
    }
    if (pts.length === 0) return
    this.map.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 20 })
  }

  zoomToExtent(trees: TreeFeature[]): void {
    if (!this.map || trees.length === 0) return
    const bounds = L.latLngBounds(
      trees.map((f) => [f.geometry.coordinates[1], f.geometry.coordinates[0]]),
    )
    this.map.fitBounds(bounds, { padding: [50, 50] })
  }

  geolocate(): void {
    if (!this.map) return
    if (!navigator.geolocation) {
      alert(this.t.geolocationNotSupported)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!this.map) return
        const { latitude, longitude } = pos.coords
        this.map.setView([latitude, longitude], 18)
        L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'user-location',
            html: '<i class="fas fa-circle" style="color:#4a90e2;font-size:12px;"></i>',
            iconSize: [12, 12],
          }),
        })
          .addTo(this.map)
          .bindPopup(this.t.yourLocation)
      },
      () => alert(this.t.unableToGetLocation),
    )
  }

  startMeasurement(type: 'distance' | 'area'): void {
    if (!this.map) return
    const drawMap = this.map as unknown as L.DrawMap
    if (type === 'distance') {
      new L.Draw.Polyline(drawMap, {
        shapeOptions: { color: MEASURE_COLOR, weight: 3 },
      }).enable()
    } else {
      new L.Draw.Polygon(drawMap, {
        shapeOptions: { color: MEASURE_COLOR, fillOpacity: 0.2 },
      }).enable()
    }
  }

  /** Notify React that a measurement shape was selected for colour editing. */
  private selectMeasurement(layer: L.Layer): void {
    const path = layer as L.Path
    const color = (path.options.color as string | undefined) ?? MEASURE_COLOR
    this.onSelectMeasurement({
      layer: path,
      color,
      text: this.measurementText.get(layer) ?? '',
    })
  }

  /** Remove the most recently drawn measurement. */
  undoMeasurement(): void {
    const layer = this.drawnStack.pop()
    if (layer) this.drawnItems.removeLayer(layer)
    this.onSelectMeasurement(null)
  }

  clearMeasurements(): void {
    this.drawnItems.clearLayers()
    this.drawnStack = []
    this.onSelectMeasurement(null)
  }
}

export const mapController = new MapController()
