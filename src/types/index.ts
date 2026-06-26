export type Algorithm = 'FIFO' | 'LRU'

export interface SimulationStep {
  page: number
  frames: (number | null)[]
  isFault: boolean
  changedIndex: number | null
  replacedPage: number | null
}

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
