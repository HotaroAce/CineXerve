export default function Spinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-400">
      <span className="inline-block w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <span>Loading…</span>
    </div>
  )
}
