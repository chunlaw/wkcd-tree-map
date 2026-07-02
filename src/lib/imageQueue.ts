// Concurrency-limited image loading queue.
//
// Loading a large gallery can fire 100+ image requests at once and trip the
// CDN's rate limit. This queue caps how many are in flight; callers acquire a
// slot before starting a request and release it when the image settles.

const MAX_CONCURRENT = 4

let active = 0
const queue: (() => void)[] = []

function pump(): void {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const job = queue.shift()!
    active++
    job()
  }
}

/** Run `job` once a slot is free. `job` MUST eventually call `releaseSlot()`. */
export function runWhenFree(job: () => void): void {
  queue.push(job)
  pump()
}

/** Release a slot previously acquired via runWhenFree. */
export function releaseSlot(): void {
  active = Math.max(0, active - 1)
  pump()
}
