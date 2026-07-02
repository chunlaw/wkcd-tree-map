// WKCD map configuration.
// In the original project these values were injected into the HTML from a repo
// `.env` via map/~python/sync_wkcd_config.py. Here they are plain Vite env vars
// (prefixed VITE_) with sensible defaults matching the published site.

const env = import.meta.env

export const GITHUB_RAW_BASE =
  env.VITE_GITHUB_RAW_BASE ??
  'https://raw.githubusercontent.com/benjaminficusmicrocarpa/benjaminficusmicrocarpa.github.io/4fddd4bf6a815068797068b4b07a88e1691ea53a/map'

export const CLOUDFLARE_IMAGE_DELIVERY_URL =
  env.VITE_CLOUDFLARE_IMAGE_DELIVERY_URL ??
  'https://imagedelivery.net/w8B9Irt4MxIF11C23YczhQ'

export const CLOUDFLARE_IMAGE_VARIANT_THUMBNAIL =
  env.VITE_CLOUDFLARE_IMAGE_VARIANT_THUMBNAIL ?? 'H300'

export const CLOUDFLARE_IMAGE_VARIANT_FULL =
  env.VITE_CLOUDFLARE_IMAGE_VARIANT_FULL ?? 'public'

/** Build a Cloudflare Images delivery URL for a given image id + variant. */
export function getCloudflareImageUrl(
  imageId: string | null | undefined,
  variant: string = CLOUDFLARE_IMAGE_VARIANT_THUMBNAIL,
): string | null {
  if (!imageId) return null
  return `${CLOUDFLARE_IMAGE_DELIVERY_URL}/${imageId}/${variant}`
}

/** Fallback: raw WebP hosted on GitHub. */
export function getGithubImageUrl(
  filename: string | null | undefined,
): string | null {
  if (!filename) return null
  const stem = filename.endsWith('.webp') ? filename.slice(0, -5) : filename
  return `${GITHUB_RAW_BASE}/~webp/${stem}.webp`
}

export const MAP_INITIAL_CENTER: [number, number] = [22.2998, 114.157]
export const MAP_INITIAL_ZOOM = 18
export const MAP_MAX_ZOOM = 25
export const MAP_MIN_ZOOM = 10
export const BRAND_GREEN = '#2c5f2d'

// Default colour for drawn measurements. Vivid magenta has strong contrast
// against satellite imagery of a coastal park (green vegetation, blue water,
// grey urban) — unlike green or cyan, it never blends into the basemap.
export const MEASURE_COLOR = '#ff2d95'
