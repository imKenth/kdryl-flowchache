import type { Algorithm, SimulationStep } from '../types'

/** Dispatch simulation to the appropriate algorithm implementation */
export function simulate<T>(pages: T[], frameSize: number, algorithm: Algorithm): SimulationStep<T>[] {
  return algorithm === 'FIFO' ? simulateFIFO<T>(pages, frameSize) : simulateLRU<T>(pages, frameSize)
}

/** First-In-First-Out page replacement simulation */
function simulateFIFO<T>(pages: T[], frameSize: number): SimulationStep<T>[] {
  const frames: (T | null)[] = Array(frameSize).fill(null)
  const queue: T[] = []
  const steps: SimulationStep<T>[] = []

  for (const page of pages) {
    const idx = frames.indexOf(page)
    if (idx !== -1) {
      steps.push({ page, frames: [...frames], isFault: false, changedIndex: null, replacedPage: null })
      continue
    }

    const emptyIdx = frames.indexOf(null)
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page
      queue.push(page)
      steps.push({ page, frames: [...frames], isFault: true, changedIndex: emptyIdx, replacedPage: null })
    } else {
      const removed = queue.shift()!
      const replaceIdx = frames.indexOf(removed)
      frames[replaceIdx] = page
      queue.push(page)
      steps.push({ page, frames: [...frames], isFault: true, changedIndex: replaceIdx, replacedPage: removed })
    }
  }

  return steps
}

/** Least-Recently-Used page replacement simulation */
function simulateLRU<T>(pages: T[], frameSize: number): SimulationStep<T>[] {
  const frames: (T | null)[] = Array(frameSize).fill(null)
  const lastUsed = new Map<T, number>()
  let tick = 0
  const steps: SimulationStep<T>[] = []

  for (const page of pages) {
    if (frames.includes(page)) {
      lastUsed.set(page, tick++)
      steps.push({ page, frames: [...frames], isFault: false, changedIndex: null, replacedPage: null })
      continue
    }

    const emptyIdx = frames.indexOf(null)
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page
      lastUsed.set(page, tick++)
      steps.push({ page, frames: [...frames], isFault: true, changedIndex: emptyIdx, replacedPage: null })
    } else {
      let lruIdx = 0
      let oldest = Infinity
      for (let i = 0; i < frameSize; i++) {
        const t = lastUsed.get(frames[i]!) ?? -1
        if (t < oldest) {
          oldest = t
          lruIdx = i
        }
      }
      const evicted = frames[lruIdx]
      frames[lruIdx] = page
      lastUsed.set(page, tick++)
      steps.push({ page, frames: [...frames], isFault: true, changedIndex: lruIdx, replacedPage: evicted })
    }
  }

  return steps
}

/** Build the classic FIFO solution trace grid (pages shift down on fault) */
export function buildTrace<T>(pages: T[], frameSize: number, isFault: boolean[]): (T | null)[][] {
  const trace: (T | null)[][] = Array.from(
    { length: frameSize },
    () => new Array<T | null>(pages.length).fill(null)
  )

  for (let col = 0; col < pages.length; col++) {
    for (let row = 0; row < frameSize; row++) {
      if (col === 0) {
        trace[row][col] = row === 0 ? pages[0] : null
      } else if (!isFault[col]) {
        trace[row][col] = trace[row][col - 1]
      } else {
        trace[row][col] = row === 0 ? pages[col] : trace[row - 1][col - 1]
      }
    }
  }

  return trace
}

/** Build an LRU solution trace grid sorted by recency (most recent at top) */
export function buildTraceLRU<T>(pages: T[], frameSize: number, steps: SimulationStep<T>[]): (T | null)[][] {
  const trace: (T | null)[][] = Array.from(
    { length: frameSize },
    () => new Array<T | null>(pages.length).fill(null)
  )

  const lastUsed = new Map<T, number>()
  let tick = 0

  for (let col = 0; col < pages.length; col++) {
    const step = steps[col]
    lastUsed.set(step.page, tick++)

    const frameIndices = Array.from({ length: frameSize }, (_, i) => i)
    frameIndices.sort((a, b) => {
      const aHas = step.frames[a] !== null
      const bHas = step.frames[b] !== null
      if (aHas !== bHas) return aHas ? -1 : 1
      const aTick = aHas ? (lastUsed.get(step.frames[a]!) ?? -1) : -1
      const bTick = bHas ? (lastUsed.get(step.frames[b]!) ?? -1) : -1
      return bTick - aTick
    })

    for (let row = 0; row < frameSize; row++) {
      trace[row][col] = step.frames[frameIndices[row]]
    }
  }

  return trace
}
