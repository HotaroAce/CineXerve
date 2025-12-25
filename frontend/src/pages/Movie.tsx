import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Card from '../components/Card'

type Showtime = {
  id: number
  datetime: string
  cinema: string
}

type Movie = {
  id: number
  title: string
  genre?: string | null
  description?: string | null
  showtimes: Showtime[]
}

export default function Movie() {
  const { id } = useParams()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fav, setFav] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('favorites')
      const ids = raw ? (JSON.parse(raw) as number[]) : []
      const numId = id ? Number(id) : NaN
      return !Number.isNaN(numId) && ids.includes(numId)
    } catch {
      return false
    }
  })
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
  useEffect(() => {
    if (!id) return
    api
      .get(`/movies/${id}`)
      .then((r) => setMovie(r.data))
      .catch(() => setError('Failed to load movie'))
      .finally(() => setLoading(false))
  }, [id])
  function toggleFav() {
    try {
      const raw = localStorage.getItem('favorites')
      const ids = raw ? (JSON.parse(raw) as number[]) : []
      const numId = id ? Number(id) : NaN
      if (Number.isNaN(numId)) return
      const has = ids.includes(numId)
      const next = has ? ids.filter((x) => x !== numId) : [...ids, numId]
      localStorage.setItem('favorites', JSON.stringify(next))
      setFav(!has)
      window.dispatchEvent(new Event('favorites-updated'))
    } catch {}
  }
  function copyLink() {
    try {
      navigator.clipboard?.writeText(window.location.href)
    } catch {}
  }
  if (loading)
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Card className="space-y-2">
              <div className="w-full h-[320px] bg-neutral-800 rounded animate-pulse" />
            </Card>
          </div>
          <div className="md:col-span-2 space-y-4">
            <Card className="space-y-3">
              <div className="h-6 w-1/2 bg-neutral-800 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-neutral-800 rounded animate-pulse" />
              <div className="flex flex-wrap gap-2">
                <div className="h-5 w-16 bg-neutral-800 rounded animate-pulse" />
                <div className="h-5 w-20 bg-neutral-800 rounded animate-pulse" />
                <div className="h-5 w-12 bg-neutral-800 rounded animate-pulse" />
              </div>
            </Card>
            <div className="space-y-2">
              <div className="h-5 w-28 bg-neutral-800 rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="space-y-2">
                    <div className="h-4 w-2/3 bg-neutral-800 rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-neutral-800 rounded animate-pulse" />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  if (error) return <Alert message={error} variant="error" />
  if (!movie) return <Alert message="Not found" variant="error" />
  const poster = findImageUrl(movie.title)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Card className="space-y-2">
            {poster ? (
              <img src={poster} alt={movie.title} className="w-full max-h-[520px] object-cover rounded" />
            ) : (
              <div className="w-full h-[320px] bg-neutral-800 flex items-center justify-center text-sm text-neutral-400 rounded">
                No poster available
              </div>
            )}
          </Card>
        </div>
        <div className="md:col-span-2 space-y-4">
          <Card className="space-y-2">
            <h1 className="text-2xl font-semibold">{movie.title}</h1>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
                <span>{movie.genre}</span>
                {movie.description && <span>• {movie.description}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {'rating' in movie && (movie as any).rating && (
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-800">{(movie as any).rating}</span>
                )}
                {'formats' in movie && Array.isArray((movie as any).formats) &&
                  ((movie as any).formats as string[]).map((f: string) => (
                    <span key={f} className="text-xs px-2 py-0.5 rounded bg-purple-700">{f}</span>
                  ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded text-sm ${fav ? 'bg-purple-700 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                onClick={toggleFav}
              >
                {fav ? '♥ Favorited' : '♡ Add to Favorites'}
              </button>
              <button className="px-3 py-1 rounded text-sm bg-neutral-800 hover:bg-neutral-700" onClick={copyLink}>
                Copy Link
              </button>
            </div>
          </Card>
          <div className="space-y-2">
            <h3 className="font-semibold">Showtimes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {movie.showtimes.map((s) => (
                <Link key={s.id} to={`/seats/${s.id}`} className="block">
                  <Card className="transition-transform duration-200 hover:scale-[1.01]">
                    <div className="font-medium">{new Date(s.datetime).toLocaleString()}</div>
                    <div className="text-sm text-neutral-400">{s.cinema}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
