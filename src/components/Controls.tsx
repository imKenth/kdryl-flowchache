interface ControlsProps {
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  speed: number
  hasRun: boolean
  onBack: () => void
  onForward: () => void
  onTogglePlay: () => void
  onSpeedChange: (speed: number) => void
}

export default function Controls({
  currentStep, totalSteps, isPlaying, speed, hasRun,
  onBack, onForward, onTogglePlay, onSpeedChange,
}: ControlsProps) {
  if (!hasRun || totalSteps === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 sm:justify-between">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className="rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30"
        >
          ◀ Back
        </button>
        <button
          onClick={onTogglePlay}
          className={`rounded-lg px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={onForward}
          disabled={currentStep >= totalSteps}
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
          onChange={e => onSpeedChange(1500 - Number(e.target.value) + 100)}
          className="h-1.5 w-16 sm:w-24 cursor-pointer appearance-none rounded-full bg-gray-200 accent-indigo-600"
        />
        <span className="w-8 sm:w-10 text-[11px] sm:text-xs text-gray-500 tabular-nums">{speed}ms</span>
      </div>

      <span className="text-[11px] sm:text-xs text-gray-500 tabular-nums">
        Step {currentStep} / {totalSteps}
      </span>
    </div>
  )
}
