import type { Algorithm, SimulationStep } from '../types'

export function simulate(pages: number[], frameSize: number, algorithm: Algorithm): SimulationStep[] {
  return algorithm === 'FIFO' ? simulateFIFO(pages, frameSize) : simulateLRU(pages, frameSize)
}

function simulateFIFO(pages: number[], frameSize: number): SimulationStep[] {
  const frames: (number | null)[] = Array(frameSize).fill(null)
  const queue: number[] = []
  const steps: SimulationStep[] = []

  for (const page of pages) {
    const idx = frames.indexOf(page)
    if (idx !== -1) {
      steps.push({ page, frames: [...frames], isFault: false, changedIndex: null, replacedPage: null })
      continue
    }

    let changedIndex: number | null = null
    let replacedPage: number | null = null

    const emptyIdx = frames.indexOf(null)
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page
      changedIndex = emptyIdx
      queue.push(page)
    } else {
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

function simulateLRU(pages: number[], frameSize: number): SimulationStep[] {
  const frames: (number | null)[] = Array(frameSize).fill(null)
  const recency: number[] = []
  let tick = 0
  const steps: SimulationStep[] = []

  for (const page of pages) {
    const idx = frames.indexOf(page)
    if (idx !== -1) {
      recency[idx] = tick++
      steps.push({ page, frames: [...frames], isFault: false, changedIndex: null, replacedPage: null })
      continue
    }

    let changedIndex: number | null = null
    let replacedPage: number | null = null

    const emptyIdx = frames.indexOf(null)
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page
      changedIndex = emptyIdx
      recency[emptyIdx] = tick++
    } else {
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
        trace[row][col] = trace[row][col - 1]
      } else {
        trace[row][col] = row === 0 ? pages[col] : trace[row - 1][col - 1]
      }
    }
  }

  return trace
}

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

    if (pageIdx !== -1) {
      frameRecency[pageIdx] = tick++
    }

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
