import { create } from 'zustand'
import type {
  BaseMapKey,
  CoordSystem,
  FeatureCollection,
  GroupBy,
  LabelType,
  LegendNameType,
  TabName,
  TreeFeature,
  ViewpointFeature,
} from './types'
import { processSpecies, type SpeciesMaps } from './lib/species'
import { detectLang, persistLang, type Lang } from './i18n'

interface AppState {
  // ---- data ----
  trees: TreeFeature[]
  viewpoints: ViewpointFeature[]
  species: SpeciesMaps
  dataLoaded: boolean
  loadError: string | null

  // ---- panel / tabs ----
  activeTab: TabName
  panelOpen: boolean

  // ---- display options ----
  showTrees: boolean
  showViewpoints: boolean
  clustering: boolean
  labelsEnabled: boolean
  labelType: LabelType

  // ---- species filter ----
  checkedSpecies: Set<string>
  speciesSearch: string

  // ---- search ----
  searchQuery: string
  selectedTree: TreeFeature | null

  // ---- legend ----
  legendNameType: LegendNameType
  legendOpen: boolean
  groupBy: GroupBy
  collapsedGroups: Set<string>

  // ---- map/tools ----
  baseMap: BaseMapKey
  coordSystem: CoordSystem

  // ---- photo modal ----
  photoOpen: boolean
  photoIndex: number

  // ---- language ----
  lang: Lang

  // ---- actions ----
  loadData: () => Promise<void>
  setLang: (lang: Lang) => void
  toggleLang: () => void
  setActiveTab: (t: TabName) => void
  togglePanel: () => void
  setShowTrees: (v: boolean) => void
  setShowViewpoints: (v: boolean) => void
  setClustering: (v: boolean) => void
  setLabelsEnabled: (v: boolean) => void
  setLabelType: (t: LabelType) => void
  setSpeciesChecked: (name: string, checked: boolean) => void
  setAllSpecies: (names: string[], checked: boolean) => void
  setSpeciesSearch: (q: string) => void
  setSearchQuery: (q: string) => void
  setSelectedTree: (t: TreeFeature | null) => void
  setLegendNameType: (t: LegendNameType) => void
  toggleLegend: () => void
  setGroupBy: (g: GroupBy) => void
  toggleGroupCollapsed: (name: string) => void
  setBaseMap: (b: BaseMapKey) => void
  setCoordSystem: (c: CoordSystem) => void
  openPhoto: (index: number) => void
  closePhoto: () => void
  nextPhoto: () => void
  prevPhoto: () => void
}

export const useStore = create<AppState>((set, get) => ({
  trees: [],
  viewpoints: [],
  species: { colors: {}, shapes: {}, chineseNames: {}, counts: {}, order: [] },
  dataLoaded: false,
  loadError: null,

  activeTab: 'filters',
  // Panel open by default on desktop, hidden on mobile (opened via the menu button).
  panelOpen:
    typeof window === 'undefined' ||
    !window.matchMedia('(max-width: 768px)').matches,

  showTrees: true,
  showViewpoints: true,
  clustering: true,
  labelsEnabled: false,
  labelType: 'short',

  checkedSpecies: new Set(),
  speciesSearch: '',

  searchQuery: '',
  selectedTree: null,

  legendNameType: 'short',
  // Legend expanded by default on desktop, collapsed on mobile to save space.
  legendOpen:
    typeof window === 'undefined' ||
    !window.matchMedia('(max-width: 768px)').matches,
  groupBy: 'family',
  collapsedGroups: new Set(),

  baseMap: 'satellite',
  coordSystem: 'WGS84',

  photoOpen: false,
  photoIndex: 0,

  lang: detectLang(),

  async loadData() {
    try {
      const [treeRes, vpRes] = await Promise.all([
        fetch('wkcd_tree.geojson'),
        fetch('viewphoto.geojson'),
      ])
      if (!treeRes.ok) throw new Error(`tree data: ${treeRes.statusText}`)
      if (!vpRes.ok) throw new Error(`viewpoint data: ${vpRes.statusText}`)

      const treeJson = (await treeRes.json()) as FeatureCollection<TreeFeature>
      const vpJson = (await vpRes.json()) as FeatureCollection<ViewpointFeature>

      const species = processSpecies(treeJson.features)
      set({
        trees: treeJson.features,
        viewpoints: vpJson.features,
        species,
        checkedSpecies: new Set(species.order),
        dataLoaded: true,
        loadError: null,
      })
    } catch (err) {
      set({ loadError: err instanceof Error ? err.message : String(err) })
    }
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  setShowTrees: (showTrees) => set({ showTrees }),
  setShowViewpoints: (showViewpoints) => set({ showViewpoints }),
  setClustering: (clustering) => set({ clustering }),
  setLabelsEnabled: (labelsEnabled) => set({ labelsEnabled }),
  setLabelType: (labelType) => set({ labelType }),

  setSpeciesChecked: (name, checked) =>
    set((s) => {
      const next = new Set(s.checkedSpecies)
      if (checked) next.add(name)
      else next.delete(name)
      return { checkedSpecies: next }
    }),
  setAllSpecies: (names, checked) =>
    set((s) => {
      const next = new Set(s.checkedSpecies)
      for (const n of names) {
        if (checked) next.add(n)
        else next.delete(n)
      }
      return { checkedSpecies: next }
    }),
  setSpeciesSearch: (speciesSearch) => set({ speciesSearch }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedTree: (selectedTree) => set({ selectedTree }),

  setLegendNameType: (legendNameType) => set({ legendNameType }),
  toggleLegend: () => set((s) => ({ legendOpen: !s.legendOpen })),
  setGroupBy: (groupBy) => set({ groupBy }),
  toggleGroupCollapsed: (name) =>
    set((s) => {
      const next = new Set(s.collapsedGroups)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return { collapsedGroups: next }
    }),

  setBaseMap: (baseMap) => set({ baseMap }),
  setCoordSystem: (coordSystem) => set({ coordSystem }),

  setLang: (lang) => {
    persistLang(lang)
    set({ lang })
  },
  toggleLang: () => {
    const lang = get().lang === 'en' ? 'zh' : 'en'
    persistLang(lang)
    set({ lang })
  },

  openPhoto: (photoIndex) => set({ photoOpen: true, photoIndex }),
  closePhoto: () => set({ photoOpen: false }),
  nextPhoto: () => {
    const { viewpoints, photoIndex } = get()
    if (viewpoints.length === 0) return
    set({ photoIndex: (photoIndex + 1) % viewpoints.length })
  },
  prevPhoto: () => {
    const { viewpoints, photoIndex } = get()
    if (viewpoints.length === 0) return
    set({
      photoIndex: (photoIndex - 1 + viewpoints.length) % viewpoints.length,
    })
  },
}))
