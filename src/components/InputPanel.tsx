import type { Algorithm } from '../types'
import { inputBase, labelBase, cardBase } from '../utils/helpers'

interface InputPanelProps {
  frameSize: number
  algorithm: Algorithm
  inputString: string
  hasRun: boolean
  error: string
  onFrameSizeChange: (size: number) => void
  onAlgorithmChange: (algo: Algorithm) => void
  onInputStringChange: (str: string) => void
  onStart: () => void
  onReset: () => void
}

export default function InputPanel({
  frameSize, algorithm, inputString, hasRun, error,
  onFrameSizeChange, onAlgorithmChange, onInputStringChange, onStart, onReset,
}: InputPanelProps) {
  return (
    <>
      <div className={cardBase}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelBase}>Frame Size</label>
            <input
              type="number"
              min={1}
              max={10}
              value={frameSize}
              onChange={e => onFrameSizeChange(Math.min(10, Math.max(1, Number(e.target.value))))}
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
                  onClick={() => onAlgorithmChange(algo)}
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
              onChange={e => onInputStringChange(e.target.value)}
              placeholder="e.g. 1,2,3,4,1,2,5"
              className={inputBase}
              disabled={hasRun}
            />
          </div>

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button
              onClick={onStart}
              disabled={hasRun}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
            >
              Start Simulation
            </button>
            <button
              onClick={onReset}
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
    </>
  )
}
