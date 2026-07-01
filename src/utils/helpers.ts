import type { SimulationStep } from '../types'

/** Shared Tailwind CSS class strings for consistent styling */
export const inputBase = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
export const labelBase = 'block text-xs font-medium text-gray-500 mb-1'
export const cardBase = 'rounded-xl border border-gray-200 bg-white p-4 shadow-sm'

/** Compute aggregate statistics from simulation steps */
export function computeStats<T>(steps: SimulationStep<T>[]) {
  const totalFaults = steps.filter(s => s.isFault).length
  const totalHits = steps.length - totalFaults
  const hitRatio = steps.length > 0 ? (totalHits / steps.length).toFixed(2) : '0.00'
  const faultRatio = steps.length > 0 ? (totalFaults / steps.length).toFixed(2) : '0.00'
  return { totalFaults, totalHits, hitRatio, faultRatio }
}

/** Generate and download a CSV file of the simulation results */
export function exportCSV<T>(steps: SimulationStep<T>[], frameSize: number, algorithm: string) {
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
