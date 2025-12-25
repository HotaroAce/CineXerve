type Props = {
  items: string[]
  current: number
  className?: string
}

export default function Steps({ items, current, className = '' }: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
      {items.map((label, i) => (
        <span
          key={label}
          className={`px-2 py-0.5 rounded ${
            i === current ? 'bg-purple-700 text-white' : 'bg-neutral-800'
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  )
}
