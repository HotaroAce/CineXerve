type Props = {
  label: string
  status: 'available' | 'reserved'
  onSelect: () => void
  selected?: boolean
}

export default function SeatButton({ label, status, onSelect, selected = false }: Props) {
  const disabled = status !== 'available'
  return (
    <button
      disabled={disabled}
      onClick={onSelect}
      className={`w-10 h-10 text-sm rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
        disabled
          ? 'bg-neutral-700 cursor-not-allowed'
          : selected
          ? 'bg-purple-600 hover:bg-purple-500 ring-2 ring-purple-400'
          : 'bg-purple-500 hover:bg-purple-400'
      }`}
      aria-label={label}
      title={label}
    >
      {label}
    </button>
  )
}
