import type { Algorithm, SimulationStep } from '../types'

/** Dispatch simulation to the appropriate algorithm implementation */
export function simulate(pages: number[], frameSize: number, algorithm: Algorithm): SimulationStep[] {
  return algorithm === 'FIFO' ? simulateFIFO(pages, frameSize) : simulateLRU(pages, frameSize)
}

/** First-In-First-Out page replacement simulation */
function simulateFIFO(pages: number[], frameSize: number): SimulationStep[] {
  /** Current contents of each frame (null = empty) */
  const frames: (number | null)[] = Array(frameSize).fill(null)
  /** Queue tracking the order pages entered frames (FIFO order) */
  const queue: number[] = []
  const steps: SimulationStep[] = []

  for (const page of pages) {
    /** Page hit — already present in a frame */
    const idx = frames.indexOf(page)
    if (idx !== -1) {
      steps.push({ page, frames: [...frames], isFault: false, changedIndex: null, replacedPage: null })
      continue
    }

    let changedIndex: number | null = null
    let replacedPage: number | null = null

    /** Page fault — place in first empty frame if available */
    const emptyIdx = frames.indexOf(null)
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page
      changedIndex = emptyIdx
      queue.push(page)
    } else {
      /** All frames full — evict the oldest page (front of queue) */
      const removed = queue.shift()!
      replacedPage = removed
      const replaceIdx = frames.indexOf(removed)
      frames[replaceIdx] = page
      changedIndex = replaceIdx
      queue.push(page)
    }

    steps.push({ page, frames: [...frames], isFault: true, changedIndex, replacedPage })
  }

  return steps
}

/** Least-Recently-Used page replacement simulation */
function simulateLRU(pages: number[], frameSize: number): SimulationStep[] {
  /** Current contents of each frame */
  const frames: (number | null)[] = Array(frameSize).fill(null)
  /** Timestamp of last access for each frame index */
  const recency: number[] = []
  let tick = 0
  const steps: SimulationStep[] = []

  for (const page of pages) {
    /** Page hit — update its recency timestamp */
    const idx = frames.indexOf(page)
    if (idx !== -1) {
      recency[idx] = tick++
      steps.push({ page, frames: [...frames], isFault: false, changedIndex: null, replacedPage: null })
      continue
    }

    let changedIndex: number | null = null
    let replacedPage: number | null = null

    /** Page fault — fill an empty frame if one exists */
    const emptyIdx = frames.indexOf(null)
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page
      changedIndex = emptyIdx
      recency[emptyIdx] = tick++
    } else {
      /** Evict the frame with the oldest timestamp */
      const lruIdx = recency.indexOf(Math.min(...recency))
      replacedPage = frames[lruIdx]
      frames[lruIdx] = page
      changedIndex = lruIdx
      recency[lruIdx] = tick++
    }

    steps.push({ page, frames: [...frames], isFault: true, changedIndex, replacedPage })
  }

  return steps
}

/** Build the classic FIFO solution trace grid (pages shift down on fault) */
export function buildTrace(pages: number[], frameSize: number, isFault: boolean[]) {
  const trace: (number | null)[][] = Array.from(
    { length: frameSize },
    () => new Array<number | null>(pages.length).fill(null)
  )

  for (let col = 0; col < pages.length; col++) {
    for (let row = 0; row < frameSize; row++) {
      if (col === 0) {
        trace[row][col] = row === 0 ? pages[0] : null
      } else if (!isFault[col]) {
        /** On a hit, frames remain unchanged from previous column */
        trace[row][col] = trace[row][col - 1]
      } else {
        /** On a fault, the new page enters row 0 and old contents shift down */
        trace[row][col] = row === 0 ? pages[col] : trace[row - 1][col - 1]
      }
    }
  }

  return trace
}

/** Build an LRU solution trace grid sorted by recency (most recent at top) */
export function buildTraceLRU(pages: number[], frameSize: number, steps: SimulationStep[]) {
  const trace: (number | null)[][] = Array.from(
    { length: frameSize },
    () => new Array<number | null>(pages.length).fill(null)
  )

  const frameRecency: number[] = Array(frameSize).fill(-1)
  let tick = 0

  for (let col = 0; col < pages.length; col++) {
    const step = steps[col]
    const pageIdx = step.frames.indexOf(step.page)

    /** Update recency if the page is found in a frame */
    if (pageIdx !== -1) {
      frameRecency[pageIdx] = tick++
    }

    /** Sort frame indices: non-null frames first, then by recency descending */
    const frameIndices = Array.from({ length: frameSize }, (_, i) => i)
    frameIndices.sort((a, b) => {
      const aHas = step.frames[a] !== null
      const bHas = step.frames[b] !== null
      if (aHas !== bHas) return aHas ? -1 : 1
      return frameRecency[b] - frameRecency[a]
    })

    for (let row = 0; row < frameSize; row++) {
      trace[row][col] = step.frames[frameIndices[row]]
    }
  }

  return trace
}
