/** Supported page replacement algorithms */
export type Algorithm = 'FIFO' | 'LRU'

/** Represents a single step in the simulation timeline */
export interface SimulationStep {
  /** The page number being referenced at this step */
  page: number
  /** Snapshot of frame contents after processing this step */
  frames: (number | null)[]
  /** Whether this step caused a page fault */
  isFault: boolean
  /** Index of the frame that was modified (null if no change) */
  changedIndex: number | null
  /** The page number that was evicted (null if no eviction) */
  replacedPage: number | null
}

/** Reactive state of the simulator */
export interface SimulatorState {
  frameSize: number
  algorithm: Algorithm
  inputString: string
  steps: SimulationStep[]
  currentStep: number
  isPlaying: boolean
  speed: number
  hasRun: boolean
  highlightedFault: number | null
  error: string
}

/** Actions that can be performed on the simulator */
export interface SimulatorActions {
  setFrameSize: (size: number) => void
  setAlgorithm: (algo: Algorithm) => void
  setInputString: (str: string) => void
  runSimulation: () => void
  reset: () => void
  stepForward: () => void
  stepBackward: () => void
  togglePlay: () => void
  setSpeed: (speed: number) => void
  exportCSV: () => void
}
