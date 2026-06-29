import { useCallback } from 'react'
import { useSimulator } from '../hooks/useSimulator'
import InputPanel from '../components/InputPanel'
import Controls from '../components/Controls'
import ReferenceString from '../components/ReferenceString'
import FrameGrid from '../components/FrameGrid'
import SolutionTrace from '../components/SolutionTrace'
import StatsPanel from '../components/StatsPanel'
import { computeStats } from '../utils/helpers'

/** Main visualizer page that orchestrates all simulation UI components */
export default function Visualizer() {
  const sim = useSimulator()
  const stats = computeStats(sim.steps)

  /** Start simulation and immediately begin auto-play */
  const handleStart = useCallback(() => {
    sim.runSimulation()
    setTimeout(() => sim.togglePlay(), 50)
  }, [sim.runSimulation, sim.togglePlay])

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <a href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition-colors">
        <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </a>

      <InputPanel
        frameSize={sim.frameSize}
        algorithm={sim.algorithm}
        inputString={sim.inputString}
        hasRun={sim.hasRun}
        error={sim.error}
        onFrameSizeChange={sim.setFrameSize}
        onAlgorithmChange={sim.setAlgorithm}
        onInputStringChange={sim.setInputString}
        onStart={handleStart}
        onReset={sim.reset}
      />

      <Controls
        currentStep={sim.currentStep}
        totalSteps={sim.steps.length}
        isPlaying={sim.isPlaying}
        speed={sim.speed}
        hasRun={sim.hasRun}
        onBack={sim.stepBackward}
        onForward={sim.stepForward}
        onTogglePlay={sim.togglePlay}
        onSpeedChange={sim.setSpeed}
      />

      {sim.hasRun && sim.steps.length > 0 && (
        <ReferenceString steps={sim.steps} currentStep={sim.currentStep} />
      )}

      <FrameGrid
        steps={sim.steps}
        currentStep={sim.currentStep}
        frameSize={sim.frameSize}
        highlightedFault={sim.highlightedFault}
      />

      <SolutionTrace
        steps={sim.steps}
        currentStep={sim.currentStep}
        frameSize={sim.frameSize}
        algorithm={sim.algorithm}
      />

      <StatsPanel
        totalFaults={stats.totalFaults}
        totalHits={stats.totalHits}
        hitRatio={stats.hitRatio}
        faultRatio={stats.faultRatio}
        hasRun={sim.hasRun}
        onExportCSV={sim.exportCSV}
      />

      {!sim.hasRun && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm text-gray-400">
            Configure the inputs above and click <span className="font-medium text-gray-600">Start Simulation</span>
          </p>
        </div>
      )}

      <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
        FlowCache — FIFO &amp; LRU Page Replacement Visualizer
      </div>
    </div>
  )
}
