import { useEffect, useRef } from 'react'
import type { LatLng } from 'leaflet'
import { useStore } from '../store'
import { mapController } from '../lib/mapController'

/** Debounced URL sync preserving the `tree` param. */
function writeUrl(center: LatLng, zoom: number): void {
  const current = new URLSearchParams(window.location.search)
  const treeId = current.get('tree')
  const params = new URLSearchParams()
  params.set('lat', center.lat.toFixed(6))
  params.set('lng', center.lng.toFixed(6))
  params.set('zoom', zoom.toString())
  if (treeId) params.set('tree', treeId)
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const builtRef = useRef(false)

  const dataLoaded = useStore((s) => s.dataLoaded)
  const trees = useStore((s) => s.trees)
  const viewpoints = useStore((s) => s.viewpoints)
  const species = useStore((s) => s.species)

  const showTrees = useStore((s) => s.showTrees)
  const clustering = useStore((s) => s.clustering)
  const checkedSpecies = useStore((s) => s.checkedSpecies)
  const showViewpoints = useStore((s) => s.showViewpoints)
  const labelsEnabled = useStore((s) => s.labelsEnabled)
  const labelType = useStore((s) => s.labelType)
  const baseMap = useStore((s) => s.baseMap)
  const coordSystem = useStore((s) => s.coordSystem)
  const searchQuery = useStore((s) => s.searchQuery)

  // ---- init map once ----
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    mapController.init(el)

    mapController.onSelectTree = (feature) => {
      const store = useStore.getState()
      store.setSelectedTree(feature)
      store.setActiveTab('search')
    }
    mapController.onOpenPhoto = (index) => useStore.getState().openPhoto(index)
    mapController.onViewChange = (center, zoom) => writeUrl(center, zoom)

    // Initial view from URL (?lat&lng&zoom), only when no tree deep-link.
    const params = new URLSearchParams(window.location.search)
    if (!params.get('tree')) {
      const lat = parseFloat(params.get('lat') ?? '')
      const lng = parseFloat(params.get('lng') ?? '')
      const zoom = parseInt(params.get('zoom') ?? '', 10)
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
        mapController.setView(lat, lng, zoom)
      }
    }

    return () => {
      mapController.destroy()
      builtRef.current = false
    }
  }, [])

  // ---- build markers once data is available ----
  useEffect(() => {
    if (!dataLoaded || builtRef.current) return
    builtRef.current = true

    mapController.setChineseNames(species.chineseNames)
    mapController.buildTreeMarkers(trees, species.colors, species.shapes)
    mapController.buildViewpointMarkers(viewpoints)

    const s = useStore.getState()
    mapController.applyTreeDisplay(s.showTrees, s.clustering, s.checkedSpecies)
    mapController.toggleViewpoints(s.showViewpoints)
    mapController.updateLabels(s.labelsEnabled, s.labelType)

    // Deep-link to a specific tree (?tree=<fid>).
    const params = new URLSearchParams(window.location.search)
    const treeId = params.get('tree')
    if (treeId) {
      const tree = trees.find((f) => String(f.properties.fid) === treeId)
      if (tree) {
        const urlZoom = parseInt(params.get('zoom') ?? '', 10)
        mapController.locateTree(tree, isNaN(urlZoom) ? 20 : urlZoom)
        s.setSelectedTree(tree)
      }
    }
  }, [dataLoaded, trees, viewpoints, species])

  // ---- reactive updates ----
  useEffect(() => {
    if (!builtRef.current) return
    mapController.applyTreeDisplay(showTrees, clustering, checkedSpecies)
  }, [showTrees, clustering, checkedSpecies])

  useEffect(() => {
    if (!builtRef.current) return
    mapController.toggleViewpoints(showViewpoints)
  }, [showViewpoints])

  useEffect(() => {
    if (!builtRef.current) return
    mapController.updateLabels(labelsEnabled, labelType)
  }, [labelsEnabled, labelType])

  useEffect(() => {
    mapController.setBaseMap(baseMap)
  }, [baseMap])

  useEffect(() => {
    mapController.setCoordSystem(coordSystem)
  }, [coordSystem])

  // Highlight trees matching the search; dim the rest.
  useEffect(() => {
    if (!builtRef.current) return
    const q = searchQuery.trim().toLowerCase()
    if (!q) {
      mapController.highlightSpecies(null)
      return
    }
    const matched = new Set(
      species.order.filter(
        (sp) =>
          sp.toLowerCase().includes(q) ||
          (species.chineseNames[sp] ?? '').includes(searchQuery.trim()),
      ),
    )
    mapController.highlightSpecies(matched)
  }, [searchQuery, species])

  return <div id="map" ref={containerRef} role="application" aria-label="Interactive tree map" />
}
