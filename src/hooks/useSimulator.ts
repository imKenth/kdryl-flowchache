import { useState, useEffect, useCallback, useRef } from 'react'
import type { Algorithm, SimulationStep, SimulatorState, SimulatorActions } from '../types'
import { simulate } from '../logic/lru'
import { exportCSV as doExportCSV } from '../utils/helpers'

export function useSimulator(): SimulatorState & SimulatorActions {
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
    const result = simulate(pages, frameSize, algorithm)
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

  const togglePlay = useCallback(() => {
    setIsPlaying(p => !p)
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

  const exportCSV = useCallback(() => {
    doExportCSV(steps, frameSize, algorithm)
  }, [steps, frameSize, algorithm])

  return {
    frameSize, setFrameSize,
    algorithm, setAlgorithm,
    inputString, setInputString,
    steps,
    currentStep,
    isPlaying,
    speed, setSpeed,
    hasRun,
    highlightedFault,
    error,
    runSimulation,
    reset,
    stepForward,
    stepBackward,
    togglePlay,
    exportCSV,
  }
}
