import { mapController } from './mapController'
import { useStore } from '../store'
import { translations } from '../i18n'
import type { TreeFeature } from '../types'

const tr = () => translations[useStore.getState().lang]

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportTrees(
  format: 'csv' | 'geojson',
  trees: TreeFeature[],
): void {
  if (format === 'csv') {
    let csv = 'ID,Botanical Name,Chinese Name,Latitude,Longitude,Remarks\n'
    for (const f of trees) {
      const [lng, lat] = f.geometry.coordinates
      const p = f.properties
      csv += `${p.fid},"${p.botanical_name}","${p.chinese_name}",${lat},${lng},"${p.remarks ?? ''}"\n`
    }
    downloadFile(csv, 'trees.csv', 'text/csv')
  } else {
    const geojson = { type: 'FeatureCollection', features: trees }
    downloadFile(
      JSON.stringify(geojson, null, 2),
      'trees.geojson',
      'application/json',
    )
  }
}

function copyLink(params: URLSearchParams, message: string): void {
  const url = `${window.location.origin}${window.location.pathname}?${params}`
  void navigator.clipboard.writeText(url).then(() => alert(message))
}

export function shareMap(): void {
  const map = mapController.map
  if (!map) return
  const c = map.getCenter()
  const params = new URLSearchParams()
  params.set('lat', c.lat.toFixed(6))
  params.set('lng', c.lng.toFixed(6))
  params.set('zoom', map.getZoom().toString())
  copyLink(params, tr().mapLinkCopied)
}

export function shareTree(fid: number): void {
  const map = mapController.map
  if (!map) return
  const c = map.getCenter()
  const params = new URLSearchParams()
  params.set('tree', fid.toString())
  params.set('lat', c.lat.toFixed(6))
  params.set('lng', c.lng.toFixed(6))
  params.set('zoom', map.getZoom().toString())
  copyLink(params, tr().treeLinkCopied)
}

export function printMap(): void {
  window.print()
}
