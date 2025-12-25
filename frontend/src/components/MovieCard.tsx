import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from './Button'

type Movie = {
  id: number
  title: string
  genre?: string | null
  description?: string | null
}

export default function MovieCard({ movie }: { movie: Movie }) {
  const [fav, setFav] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('favorites')
      const ids = raw ? (JSON.parse(raw) as number[]) : []
      return ids.includes(movie.id)
    } catch {
      return false
    }
  })
  function toggleFav() {
    try {
      const raw = localStorage.getItem('favorites')
      const ids = raw ? (JSON.parse(raw) as number[]) : []
      const has = ids.includes(movie.id)
      const next = has ? ids.filter((id) => id !== movie.id) : [...ids, movie.id]
      localStorage.setItem('favorites', JSON.stringify(next))
      setFav(!has)
      window.dispatchEvent(new Event('favorites-updated'))
    } catch {}
  }
  const images = import.meta.glob('../images/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
  function findImageUrl(title: string): string | null {
    const entries = Object.entries(images)
    const match = entries.find(([path]) => {
      const base = path.split('/').pop() || ''
      const name = base.replace(/\.[^/.]+$/, '')
      return name.toLowerCase() === title.toLowerCase()
    })
    return match ? match[1] : null
  }
  const poster = findImageUrl(movie.title)
  return (
    <div className="relative border border-neutral-800 rounded shadow-sm bg-neutral-900/40 overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
      {poster ? (
        <img src={poster} alt={movie.title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-neutral-800 flex items-center justify-center text-sm text-neutral-400">
          No poster available
        </div>
      )}
      <button
        aria-label="Toggle favorite"
        title={fav ? 'Remove from favorites' : 'Add to favorites'}
        onClick={toggleFav}
        className={`absolute top-2 right-2 px-2 py-1 rounded text-sm ${fav ? 'bg-purple-700 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}
      >
        {fav ? '♥' : '♡'}
      </button>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{movie.title}</h3>
        <p className="text-sm text-neutral-400">{movie.genre}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {'rating' in movie && (movie as any).rating && (
            <span className="text-xs px-2 py-0.5 rounded bg-neutral-800">{(movie as any).rating}</span>
          )}
          {'formats' in movie && Array.isArray((movie as any).formats) &&
            ((movie as any).formats as string[]).map((f: string) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded bg-purple-700">{f}</span>
            ))}
        </div>
        <p className="text-sm mt-2 line-clamp-3">{movie.description}</p>
      </div>
      <div className="p-4 pt-0">
        <Link to={`/movie/${movie.id}`}>
          <Button>Details</Button>
        </Link>
      </div>
    </div>
  )
}
