import type { SimulationStep } from '../types'
import { cardBase } from '../utils/helpers'

interface ReferenceStringProps {
  steps: SimulationStep[]
  currentStep: number
}

export default function ReferenceString({ steps, currentStep }: ReferenceStringProps) {
  return (
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
  )
}
