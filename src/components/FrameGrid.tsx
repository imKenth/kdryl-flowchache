import type { SimulationStep } from '../types'
import { cardBase } from '../utils/helpers'

interface FrameGridProps {
  steps: SimulationStep<string>[]
  currentStep: number
  frameSize: number
  highlightedFault: number | null
}

/** Displays a timeline grid of frame contents, status, and evicted pages */
export default function FrameGrid({ steps, currentStep, frameSize, highlightedFault }: FrameGridProps) {
  /** Only show steps up to the current position */
  const visibleSteps = steps.slice(0, currentStep)

  if (visibleSteps.length === 0) return null

  return (
    <div className={cardBase}>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Frame Timeline</h2>
      <div className="overflow-x-auto">
        <div className="flex">
          {/* Sticky left column with frame labels */}
          <div className="sticky left-0 z-10 shrink-0 pr-2 pt-6 bg-white">
            {Array.from({ length: frameSize }, (_, i) => (
              <div key={i} className="flex h-9 items-center justify-end pr-2 text-xs font-medium text-gray-400">
                Frame {i + 1}
              </div>
            ))}
            <div className="flex h-7 items-center justify-end pr-2 text-[11px] font-semibold text-gray-400">
              Status
            </div>
            <div className="flex h-7 items-center justify-end pr-2 text-[11px] font-semibold text-gray-400">
              Evict
            </div>
          </div>

          {/* Scrollable timeline columns */}
          <div className="flex">
            {visibleSteps.map((step, colIdx) => {
              const isLastCol = colIdx === currentStep - 1
              const isFaultCol = isLastCol && step.isFault
              const isHitCol = isLastCol && !step.isFault
              return (
                <div key={colIdx} className="flex flex-col">
                  {/* Page number header — highlighted for fault (red) or hit (green) */}
                  <div className={`flex h-6 items-center justify-center rounded-t-md px-2 text-[11px] font-bold ${
                    isFaultCol ? 'bg-red-100 text-red-700' : isHitCol ? 'bg-green-100 text-green-700' : 'text-gray-400'
                  }`}>
                    {step.page}
                  </div>

                  {/* Frame value cells */}
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

                  {/* Fault (❌) / Hit (✅) indicator */}
                  <div className={`flex h-7 w-12 items-center justify-center border-b border-r text-[10px] font-bold ${
                    step.isFault ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  } ${colIdx === currentStep - 1 ? 'border-indigo-300' : 'border-gray-200'}`}>
                    {step.isFault ? '❌' : '✅'}
                  </div>

                  {/* Evicted page number or dash */}
                  <div className={`flex h-7 w-12 items-center justify-center border-b border-r text-[10px] font-mono font-bold ${
                    step.replacedPage !== null ? 'bg-amber-50 text-amber-700' : 'text-gray-300'
                  } ${colIdx === currentStep - 1 ? 'border-indigo-300' : 'border-gray-200'}`}>
                    {step.replacedPage !== null ? step.replacedPage : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
