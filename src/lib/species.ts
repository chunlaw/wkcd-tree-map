import type { MarkerShape, TreeFeature } from '../types'
import { getFamily } from '../data/families'

/** Curated qualitative palette for the most common families (colour-by-family).
 *  Chosen to be distinct and to contrast with the green satellite basemap. */
const FAMILY_PALETTE = [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#9467bd', // purple
  '#d62728', // red
  '#17becf', // cyan
  '#e377c2', // pink
  '#bcbd22', // olive
  '#8c564b', // brown
  '#f4c20d', // gold
  '#2ca02c', // green
]
/** Fallback colour for families outside the top-N ("Other"). */
export const OTHER_FAMILY_COLOR = '#9e9e9e'

/** Generate a diverse, evenly-spread HSL color palette (ported from original). */
export function generateColorPalette(count: number): string[] {
  const colors: string[] = []
  const hueStep = count > 0 ? 360 / count : 0

  for (let i = 0; i < count; i++) {
    const hue = (i * hueStep) % 360
    const saturation = 60 + (i % 3) * 10 // 60, 70, 80
    const lightness = 40 + (Math.floor(i / 3) % 3) * 8 // 40, 48, 56

    const h = hue / 360
    const s = saturation / 100
    const l = lightness / 100

    let r: number
    let g: number
    let b: number
    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255)
      g = Math.round(hue2rgb(p, q, h) * 255)
      b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    }

    const hex = (n: number) => n.toString(16).padStart(2, '0')
    colors.push(`#${hex(r)}${hex(g)}${hex(b)}`)
  }

  return colors
}

export interface SpeciesMaps {
  /** Botanical name -> hex color */
  colors: Record<string, string>
  /** Botanical name -> marker shape */
  shapes: Record<string, MarkerShape>
  /** Botanical name -> chinese name */
  chineseNames: Record<string, string>
  /** Botanical name -> number of trees of that species */
  counts: Record<string, number>
  /** Botanical family -> colour (top families coloured, rest grey) */
  familyColors: Record<string, string>
  /** Distinct botanical names in insertion order */
  order: string[]
}

/** Build color/shape/chinese-name maps for all species in the dataset. */
export function processSpecies(trees: TreeFeature[]): SpeciesMaps {
  const order: string[] = []
  const seen = new Set<string>()
  const chineseNames: Record<string, string> = {}
  const counts: Record<string, number> = {}

  for (const f of trees) {
    const name = f.properties.botanical_name
    if (!seen.has(name)) {
      seen.add(name)
      order.push(name)
    }
    counts[name] = (counts[name] ?? 0) + 1
    if (!chineseNames[name] && f.properties.chinese_name) {
      chineseNames[name] = f.properties.chinese_name
    }
  }

  // Colour by botanical family: rank families by tree count, give the top ones
  // the curated palette and everything else a neutral grey.
  const familyTreeCount: Record<string, number> = {}
  for (const name of order) {
    const fam = getFamily(name)
    familyTreeCount[fam] = (familyTreeCount[fam] ?? 0) + counts[name]
  }
  const familyColors: Record<string, string> = {}
  Object.keys(familyTreeCount)
    .sort((a, b) => familyTreeCount[b] - familyTreeCount[a])
    .forEach((fam, i) => {
      familyColors[fam] =
        i < FAMILY_PALETTE.length ? FAMILY_PALETTE[i] : OTHER_FAMILY_COLOR
    })

  const colors: Record<string, string> = {}
  const shapes: Record<string, MarkerShape> = {}
  for (const name of order) {
    colors[name] = familyColors[getFamily(name)] ?? OTHER_FAMILY_COLOR
    shapes[name] = 'circle'
  }

  return { colors, shapes, chineseNames, counts, familyColors, order }
}

/** Abbreviated scientific name, e.g. "Ficus microcarpa" -> "Fic. mic." */
export function getShortScientificName(fullName: string): string {
  const parts = fullName.split(' ')
  if (parts.length >= 2) {
    return `${parts[0].substring(0, 3)}. ${parts[1].substring(0, 3)}.`
  }
  return fullName
}

/** Inline HTML for a colored legend/filter swatch of the given shape. */
export function shapeSwatchHtml(shape: MarkerShape, color: string): string {
  if (shape === 'square') {
    return `<span class="species-color square" style="background:${color};"></span>`
  }
  if (shape === 'triangle') {
    return `<span class="species-color triangle" style="border-bottom:14px solid ${color};"></span>`
  }
  return `<span class="species-color circle" style="background:${color};"></span>`
}

/** Leaflet divIcon HTML for a tree marker of the given shape/color. */
export function markerShapeHtml(shape: MarkerShape, color: string): string {
  if (shape === 'square') {
    return `<div style="background-color:${color};width:10px;height:10px;border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.4);transform:rotate(45deg);"></div>`
  }
  if (shape === 'triangle') {
    return `<div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:14px solid ${color};filter:drop-shadow(0 0 2px white) drop-shadow(0 2px 4px rgba(0,0,0,0.4));"></div>`
  }
  return `<div style="background-color:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.4);"></div>`
}
