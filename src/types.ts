// GeoJSON typings for the WKCD datasets.

export type MarkerShape = 'circle' | 'square' | 'triangle'

export interface TreeProperties {
  fid: number
  botanical_name: string
  chinese_name: string
  species_id: number | null
  remarks: string | null
}

export interface TreeFeature {
  type: 'Feature'
  properties: TreeProperties
  geometry: {
    type: 'Point'
    /** [lng, lat] */
    coordinates: [number, number]
  }
}

export interface ViewpointProperties {
  fid: number
  filename: string
  rotation: number
  image_id: string | null
}

export interface ViewpointFeature {
  type: 'Feature'
  properties: ViewpointProperties
  geometry: {
    type: 'Point'
    /** [lng, lat, elevation?] */
    coordinates: [number, number] | [number, number, number]
  }
}

export interface FeatureCollection<F> {
  type: 'FeatureCollection'
  features: F[]
}

export type GroupBy = 'none' | 'family' | 'genus'
export type TabName = 'filters' | 'search' | 'photos' | 'stats' | 'tools'
export type BaseMapKey = 'osm' | 'satellite' | 'topo'
export type LabelType = 'short' | 'chinese'
export type LegendNameType = 'short' | 'full' | 'chinese'
export type CoordSystem = 'WGS84' | 'HK1980'
