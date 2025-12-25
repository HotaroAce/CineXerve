import { useMemo } from 'react'

type Props = {
  movies: { genre?: string | null }[]
  value: string | null
  onChange: (g: string | null) => void
}

export default function GenreFilter({ movies, value, onChange }: Props) {
  const genres = useMemo(() => {
    const set = new Set<string>()
    for (const m of movies) {
      if (m.genre) set.add(m.genre)
    }
    return Array.from(set).sort()
  }, [movies])
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className={`px-3 py-1 rounded ${value === null ? 'bg-purple-700' : 'bg-neutral-700'} hover:bg-purple-600`}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {genres.map((g) => (
        <button
          key={g}
          className={`px-3 py-1 rounded ${value === g ? 'bg-purple-700' : 'bg-neutral-700'} hover:bg-purple-600`}
          onClick={() => onChange(g)}
        >
          {g}
        </button>
      ))}
    </div>
  )
}
