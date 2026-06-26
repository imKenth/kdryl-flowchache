interface StatsPanelProps {
  totalFaults: number
  totalHits: number
  hitRatio: string
  faultRatio: string
  hasRun: boolean
  onExportCSV: () => void
}

export default function StatsPanel({ totalFaults, totalHits, hitRatio, faultRatio, hasRun, onExportCSV }: StatsPanelProps) {
  if (!hasRun) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{totalFaults}</div>
          <div className="mt-0.5 text-xs text-gray-500">Total Page Faults</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{totalHits}</div>
          <div className="mt-0.5 text-xs text-gray-500">Total Page Hits</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{hitRatio}</div>
          <div className="mt-0.5 text-xs text-gray-500">Hit Ratio</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-red-600">{faultRatio}</div>
          <div className="mt-0.5 text-xs text-gray-500">Fault Ratio</div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onExportCSV}
          className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>
    </>
  )
}
