import L from 'leaflet'
import type { CoordSystem } from '../types'

/** Sum of segment distances along a polyline, in metres. */
export function polylineDistance(map: L.Map, latlngs: L.LatLng[]): number {
  let distance = 0
  for (let i = 0; i < latlngs.length - 1; i++) {
    distance += map.distance(latlngs[i], latlngs[i + 1])
  }
  return distance
}

/** Build a field-of-view "viewshed" cone polygon around a viewpoint. */
export function viewshedPolygonPoints(
  lng: number,
  lat: number,
  rotation: number,
  radius = 50,
  fov = 60,
): [number, number][] {
  const center: [number, number] = [lat, lng]
  const points: [number, number][] = [center]
  const startAngle = rotation - fov / 2
  const endAngle = rotation + fov / 2
  for (let angle = startAngle; angle <= endAngle; angle += 5) {
    const rad = (angle * Math.PI) / 180
    const pLat = center[0] + (radius / 111320) * Math.cos(rad)
    const pLng =
      center[1] +
      (radius / (111320 * Math.cos((center[0] * Math.PI) / 180))) *
        Math.sin(rad)
    points.push([pLat, pLng])
  }
  points.push(center)
  return points
}

/** Format a cursor coordinate readout for the chosen system. */
export function formatCoord(latlng: L.LatLng, system: CoordSystem): string {
  if (system === 'WGS84') {
    return `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`
  }
  // Simplified (approximate) HK1980 grid conversion — matches original.
  const hkN = 800000 + (latlng.lat - 22.2) * 110000
  const hkE = 830000 + (latlng.lng - 114.1) * 110000
  return `N: ${hkN.toFixed(0)}, E: ${hkE.toFixed(0)} (HK1980)`
}
