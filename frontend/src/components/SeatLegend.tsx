export default function SeatLegend() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded bg-purple-500" />
        <span>Available</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded bg-neutral-700" />
        <span>Reserved</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded bg-purple-600" />
        <span>Selected</span>
      </div>
    </div>
  )
}
