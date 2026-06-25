import { useState, useEffect, useCallback, useRef } from 'react'

type Algorithm = 'FIFO' | 'LRU'

interface SimulationStep {
  page: number
  frames: (number | null)[]
  isFault: boolean
  changedIndex: number | null
  replacedPage: number | null
}

function buildTrace(pages: number[], frameSize: number) {
  const trace: (number | null)[][] = []

  for (let row = 0; row < frameSize; row++) {
    const line: (number | null)[] = []

    // left padding (shift)
    for (let i = 0; i < row; i++) {
      line.push(null)
    }

    // remaining values
    for (let i = 0; i < pages.length - row; i++) {
      line.push(pages[i])
    }

    trace.push(line)
  }

  return trace
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

const inputBase = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
const labelBase = 'block text-xs font-medium text-gray-500 mb-1'
const cardBase = 'rounded-xl border border-gray-200 bg-white p-4 shadow-sm'

export default function Visualizer() {
  const [frameSize, setFrameSize] = useState(4)
  const [algorithm, setAlgorithm] = useState<Algorithm>('FIFO')
  const [inputString, setInputString] = useState('7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1')
  const [steps, setSteps] = useState<SimulationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [hasRun, setHasRun] = useState(false)
  const [highlightedFault, setHighlightedFault] = useState<number | null>(null)
  const [error, setError] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const runSimulation = useCallback(() => {
    const raw = inputString.split(',').map(s => s.trim()).filter(Boolean)
    if (raw.length === 0) { setError('Please enter a page reference string.'); return }
    if (frameSize < 1) { setError('Frame size must be at least 1.'); return }

    const invalid = raw.filter(s => !/^\d+$/.test(s))
    if (invalid.length > 0) { setError(`Invalid values: ${invalid.join(', ')}. Use comma-separated numbers.`); return }

    setError('')
    const pages = raw.map(Number)
    const result = algorithm === 'FIFO' ? simulateFIFO(pages, frameSize) : simulateLRU(pages, frameSize)
    setSteps(result)
    setCurrentStep(0)
    setHasRun(true)
    setIsPlaying(false)
    setHighlightedFault(null)
  }, [inputString, frameSize, algorithm])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setHasRun(false)
    setHighlightedFault(null)
    setError('')
  }, [])

  const stepForward = useCallback(() => {
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, steps.length)
      if (next > 0 && steps[next - 1]?.isFault) {
        setHighlightedFault(next - 1)
        setTimeout(() => setHighlightedFault(null), 600)
      }
      return next
    })
  }, [steps])

  const stepBackward = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length) {
            setIsPlaying(false)
            return prev
          }
          if (steps[prev]?.isFault) {
            setHighlightedFault(prev)
            setTimeout(() => setHighlightedFault(null), 600)
          }
          return prev + 1
        })
      }, speed)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speed, steps.length])

  const totalFaults = steps.filter(s => s.isFault).length
  const totalHits = steps.length - totalFaults
  const hitRatio = steps.length > 0 ? (totalHits / steps.length).toFixed(2) : '0.00'
  const faultRatio = steps.length > 0 ? (totalFaults / steps.length).toFixed(2) : '0.00'

  function exportCSV() {
    const headers = ['Step', 'Page', ...Array.from({ length: frameSize }, (_, i) => `F${i + 1}`), 'Fault', 'Replaced']
    const rows = steps.map((s, i) => [
      i + 1,
      s.page,
      ...s.frames.map(v => v !== null ? v : ''),
      s.isFault ? 'Fault' : 'Hit',
      s.replacedPage !== null ? s.replacedPage : '',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flowcache-${algorithm.toLowerCase()}-${frameSize}f.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const visibleSteps = steps.slice(0, currentStep)

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Back link */}
      <a href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition-colors">
        <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </a>

      {/* Input Panel */}
      <div className={cardBase}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelBase}>Frame Size</label>
            <input
              type="number"
              min={1}
              max={10}
              value={frameSize}
              onChange={e => setFrameSize(Math.min(10, Math.max(1, Number(e.target.value))))}
              className={inputBase}
              disabled={hasRun}
            />
          </div>

          <div>
            <label className={labelBase}>Algorithm</label>
            <div className="flex gap-2">
              {(['FIFO', 'LRU'] as const).map(algo => (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  disabled={hasRun}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    algorithm === algo
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className={labelBase}>Page Reference String</label>
            <input
              type="text"
              value={inputString}
              onChange={e => setInputString(e.target.value)}
              placeholder="e.g. 1,2,3,4,1,2,5"
              className={inputBase}
              disabled={hasRun}
            />
          </div>

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => { runSimulation(); setTimeout(() => setIsPlaying(true), 50) }}
              disabled={hasRun}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
            >
              Start Simulation
            </button>
            <button
              onClick={reset}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Controls & Speed */}
      {hasRun && steps.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 sm:justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={stepBackward}
              disabled={currentStep === 0}
              className="rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30"
            >
              ◀ Back
            </button>
            <button
              onClick={() => setIsPlaying(p => !p)}
              className={`rounded-lg px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={stepForward}
              disabled={currentStep >= steps.length}
              className="rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30"
            >
              Next ▶
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs text-gray-500">Speed:</span>
            <input
              type="range"
              min={100}
              max={1500}
              step={50}
              value={1500 - speed + 100}
              onChange={e => setSpeed(1500 - Number(e.target.value) + 100)}
              className="h-1.5 w-16 sm:w-24 cursor-pointer appearance-none rounded-full bg-gray-200 accent-indigo-600"
            />
            <span className="w-8 sm:w-10 text-[11px] sm:text-xs text-gray-500 tabular-nums">{speed}ms</span>
          </div>

          <span className="text-[11px] sm:text-xs text-gray-500 tabular-nums">
            Step {currentStep} / {steps.length}
          </span>
        </div>
      )}

      {/* Live pointer / reference string indicator */}
      {hasRun && steps.length > 0 && (
        <div className={cardBase}>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Reference String</h2>
          <div className="flex flex-wrap gap-1.5">
            {steps.map((step, idx) => (
              <span
                key={idx}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-mono font-bold transition-all duration-200 ${
                  idx === currentStep - 1
                    ? step.isFault
                      ? 'scale-110 bg-red-500 text-white shadow-md'
                      : 'scale-110 bg-green-500 text-white shadow-md'
                    : idx < currentStep
                    ? step.isFault
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.page}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Visualization Grid */}
      {hasRun && steps.length > 0 && (
        <div className={cardBase + ' overflow-x-auto'}>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Frame Timeline</h2>
          <div className="flex">
            {/* Frame labels column */}
            <div className="sticky left-0 z-10 shrink-0 pr-2 pt-6 bg-white">
              {Array.from({ length: frameSize }, (_, i) => (
                <div key={i} className="flex h-9 items-center justify-end pr-2 text-xs font-medium text-gray-400">
                  Frame {i + 1}
                </div>
              ))}
              <div className="flex h-7 items-center justify-end pr-2 text-[11px] font-semibold text-gray-400">
                Status
              </div>
            </div>
            {/* Timeline columns */}
            <div className="flex">
              {visibleSteps.map((step, colIdx) => {
                  const isLastCol = colIdx === currentStep - 1
                  const isFaultCol = isLastCol && step.isFault
                  const isHitCol = isLastCol && !step.isFault
                  return (
                    <div key={colIdx} className="flex flex-col">
                      {/* Page reference header */}
                      <div className={`flex h-6 items-center justify-center rounded-t-md px-2 text-[11px] font-bold ${
                        isFaultCol ? 'bg-red-100 text-red-700' : isHitCol ? 'bg-green-100 text-green-700' : 'text-gray-400'
                      }`}>
                        {step.page}
                      </div>
                      {/* Frame cells */}
                      {step.frames.map((val, frameIdx) => {
                        const isChanged = step.changedIndex === frameIdx && isLastCol
                        const isHighlighted = highlightedFault !== null && highlightedFault === colIdx && step.changedIndex === frameIdx
                        return (
                          <div
                            key={frameIdx}
                            className={`flex h-9 w-12 items-center justify-center border-b border-r text-sm font-mono transition-all duration-300 ${
                              isHighlighted
                                ? 'border-red-400 bg-red-200 text-red-900 scale-110 shadow-md z-10'
                                : isChanged && isFaultCol
                                ? 'border-red-300 bg-red-50 text-red-800'
                                : isChanged && isHitCol
                                ? 'border-green-300 bg-green-50 text-green-800'
                                : colIdx === currentStep - 1
                                ? 'border-indigo-200 bg-indigo-50/50'
                                : 'border-gray-100'
                            }`}
                          >
                            {val !== null ? val : ''}
                          </div>
                        )
                      })}
                      {/* Status row */}
                      <div className={`flex h-7 w-12 items-center justify-center border-b border-r text-[10px] font-bold ${
                        step.isFault ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      } ${colIdx === currentStep - 1 ? 'border-indigo-300' : 'border-gray-200'}`}>
                        {step.isFault ? '❌' : '✅'}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* Solution Trace */}
{hasRun && steps.length > 0 && (
  <div className={cardBase + ' overflow-x-auto'}>
    <h2 className="mb-3 text-sm font-semibold text-gray-700">
      Solution Trace
    </h2>

    {(() => {
      const pages = steps.map(s => s.page) // ✅ correct source
      const trace = buildTrace(pages, frameSize)

      return (
        <div className="flex">
          {/* Labels */}
          <div className="sticky left-0 z-10 shrink-0 pr-2 bg-white">
            <div className="h-6" /> {/* spacer for header */}
            {trace.map((_, i) => (
              <div
                key={i}
                className="flex h-9 items-center justify-end pr-2 text-xs font-medium text-gray-400"
              >
                Shift {i + 1}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-col">
            {/* Header row (reference string) */}
            <div className="flex">
              {pages.map((p, i) => (
                <div
                  key={i}
                  className="flex h-6 w-12 items-center justify-center text-[11px] font-bold text-gray-500"
                >
                  {p}
                </div>
              ))}
            </div>

            {/* Trace rows */}
            {trace.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((val, colIdx) => (
                  <div
                    key={colIdx}
                    className={`flex h-9 w-12 items-center justify-center border-b border-r text-sm font-mono
                      ${colIdx === currentStep - 1 ? 'bg-indigo-50 border-indigo-200' : 'border-gray-100'}
                    `}
                  >
                    {val ?? ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )
    })()}
  </div>
)}

      {/* Summary Stats */}
      {hasRun && steps.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{totalFaults}</div>
              <div className="mt-0.5 text-xs text-gray-500">Total Page Faults</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{totalHits}</div>
              <div className="mt-0.5 text-xs text-gray-500">Total Page Hits</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600">{hitRatio}</div>
              <div className="mt-0.5 text-xs text-gray-500">Hit Ratio</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-red-600">{faultRatio}</div>
              <div className="mt-0.5 text-xs text-gray-500">Fault Ratio</div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={exportCSV}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Export CSV
            </button>
          </div>
        </>
      )}

      {/* Empty state */}
      {!hasRun && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm text-gray-400">
            Configure the inputs above and click <span className="font-medium text-gray-600">Start Simulation</span>
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
        FlowCache — FIFO &amp; LRU Page Replacement Visualizer
      </div>
    </div>
  )
}
