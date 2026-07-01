import type { Algorithm, SimulationStep } from '../types'
import { buildTrace, buildTraceLRU } from '../logic/fifo-lru'
import { cardBase } from '../utils/helpers'

interface SolutionTraceProps {
  steps: SimulationStep<string>[]
  currentStep: number
  frameSize: number
  algorithm: Algorithm
}

/** Algorithm-specific solution trace table showing how pages propagate through frames */
export default function SolutionTrace({ steps, currentStep, frameSize, algorithm }: SolutionTraceProps) {
  if (steps.length === 0) return null

  const visibleSteps = steps.slice(0, currentStep)
  if (visibleSteps.length === 0) return null

  const pages = steps.map(s => s.page)

  if (algorithm === 'FIFO') {
    const isFault = steps.map(s => s.isFault)
    const trace = buildTrace<string>(pages, frameSize, isFault)
    const colCount = Math.min(currentStep, pages.length)

    return (
      <div className={cardBase + ' overflow-x-auto'}>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Solution Trace — FIFO</h2>
        <div className="flex">
          <div className="sticky left-0 z-10 shrink-0 pr-2 bg-white">
            <div className="h-6" />
            {Array.from({ length: frameSize }, (_, i) => (
              <div key={i} className="flex h-9 items-center justify-end pr-2 text-xs font-medium text-gray-400">
                Frame {i + 1}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            <div className="flex">
              {Array.from({ length: colCount }, (_, i) => (
                <div
                  key={i}
                  className={`flex h-6 w-12 items-center justify-center text-[11px] font-bold transition-all duration-200 ${
                    i === currentStep - 1 ? 'text-indigo-700 scale-110' : 'text-gray-500'
                  }`}
                >
                  {pages[i]}
                </div>
              ))}
            </div>

            {Array.from({ length: frameSize }, (_, rowIdx) => (
              <div key={rowIdx} className="flex">
                {Array.from({ length: colCount }, (_, colIdx) => {
                  const val = trace[rowIdx][colIdx]
                  const hasValue = val !== null
                  const isLast = colIdx === currentStep - 1
                  const step = steps[colIdx]
                  const isChanged = step.changedIndex === rowIdx && isLast && step.isFault
                  return (
                    <div
                      key={colIdx}
                      className={`flex h-9 w-12 items-center justify-center border-b border-r text-sm font-mono transition-all duration-300 ${
                        isChanged
                          ? 'border-red-300 bg-red-50 text-red-800 scale-110 z-10'
                          : hasValue && isLast
                          ? 'border-indigo-200 bg-indigo-50/50'
                          : hasValue
                          ? 'border-gray-200 bg-gray-50 text-gray-600'
                          : 'border-gray-100'
                      }`}
                    >
                      {val ?? ''}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /** LRU trace — rows sorted by most-recently-used (top) to least-recently-used (bottom) */
  const trace = buildTraceLRU<string>(pages, frameSize, steps)
  const colCount = Math.min(currentStep, pages.length)

  return (
    <div className={cardBase + ' overflow-x-auto'}>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Solution Trace — LRU</h2>
      <div className="flex">
        <div className="sticky left-0 z-10 shrink-0 pr-2 bg-white">
          <div className="h-6" />
          {Array.from({ length: frameSize }, (_, i) => (
            <div key={i} className="flex h-9 items-center justify-end pr-2 text-xs font-medium text-gray-400">
              Frame {i + 1}
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          <div className="flex">
            {Array.from({ length: colCount }, (_, i) => (
              <div
                key={i}
                className={`flex h-6 w-12 items-center justify-center text-[11px] font-bold transition-all duration-200 ${
                  i === currentStep - 1 ? 'text-indigo-700 scale-110' : 'text-gray-500'
                }`}
              >
                {pages[i]}
              </div>
            ))}
          </div>

          {Array.from({ length: frameSize }, (_, rowIdx) => (
            <div key={rowIdx} className="flex">
              {Array.from({ length: colCount }, (_, colIdx) => {
                const val = trace[rowIdx][colIdx]
                const hasValue = val !== null
                const isLast = colIdx === currentStep - 1
                const step = steps[colIdx]
                const isLruRow = rowIdx === frameSize - 1
                const isAccessed = isLast && hasValue && val === step.page
                const isFaulted = isAccessed && step.isFault
                const isHit = isAccessed && !step.isFault
                return (
                  <div
                    key={colIdx}
                    className={`flex h-9 w-12 items-center justify-center border-b border-r text-sm font-mono transition-all duration-300 ${
                      isFaulted
                        ? 'border-red-300 bg-red-50 text-red-800 scale-110 z-10'
                        : isHit
                        ? 'border-green-300 bg-green-50 text-green-700 scale-110 z-10'
                        : isLast && isLruRow
                        ? 'border-orange-200 bg-orange-50/60 text-orange-700 font-semibold'
                        : hasValue && isLast
                        ? 'border-indigo-200 bg-indigo-50/50'
                        : hasValue
                        ? 'border-gray-200 bg-gray-50 text-gray-600'
                        : 'border-gray-100'
                    }`}
                  >
                    {val ?? ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
