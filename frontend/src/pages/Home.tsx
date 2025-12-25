import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import MovieCard from '../components/MovieCard'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import GenreFilter from '../components/GenreFilter'
import Card from '../components/Card'
import Button from '../components/Button'

type Movie = {
  id: number
  title: string
  genre?: string | null
  description?: string | null
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [genre, setGenre] = useState<string | null>(null)
  const [cinema, setCinema] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null) // yyyy-mm-dd
  const [query, setQuery] = useState<string>('')
  const [showtimesByMovie, setShowtimesByMovie] = useState<Record<number, { id: number; datetime: string; cinema: string }[]>>({})
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('favorites')
      return raw ? (JSON.parse(raw) as number[]) : []
    } catch {
      return []
    }
  })
  const [onlyFav, setOnlyFav] = useState(false)
  const cinemas = useMemo(() => {
    const set = new Set<string>()
    for (const sts of Object.values(showtimesByMovie)) {
      for (const s of sts) set.add(s.cinema)
    }
    return Array.from(set).sort()
  }, [showtimesByMovie])
  useEffect(() => {
    setLoading(true)
    setError(null)
    const url = genre ? `/movies?genre=${encodeURIComponent(genre)}` : '/movies'
    api
      .get(url)
      .then((r) => setMovies(r.data))
      .catch(() => setError('Failed to load movies'))
      .finally(() => setLoading(false))
  }, [genre])
  useEffect(() => {
    if (movies.length === 0) {
      setShowtimesByMovie({})
      return
    }
    Promise.all(movies.map((m) => api.get(`/showtimes/${m.id}`).then((r) => [m.id, r.data] as const)))
      .then((pairs) => {
        const map: Record<number, { id: number; datetime: string; cinema: string }[]> = {}
        for (const [id, sts] of pairs) map[id] = sts
        setShowtimesByMovie(map)
      })
      .catch(() => {
        setShowtimesByMovie({})
      })
  }, [movies])
  useEffect(() => {
    function refresh() {
      try {
        const raw = localStorage.getItem('favorites')
        setFavorites(raw ? (JSON.parse(raw) as number[]) : [])
      } catch {
        setFavorites([])
      }
    }
    window.addEventListener('favorites-updated', refresh)
    return () => window.removeEventListener('favorites-updated', refresh)
  }, [])
  const filtered = useMemo(() => {
    if (!cinema && !date) return movies
    const d = date ? new Date(date) : null
    return movies.filter((m) => {
      const sts = showtimesByMovie[m.id] ?? []
      return sts.some((s) => {
        const okCinema = cinema ? s.cinema === cinema : true
        const okDate = d
          ? (() => {
              const sd = new Date(s.datetime)
              return (
                sd.getFullYear() === d.getFullYear() &&
                sd.getMonth() === d.getMonth() &&
                sd.getDate() === d.getDate()
              )
            })()
          : true
        return okCinema && okDate
      })
    })
  }, [movies, showtimesByMovie, cinema, date])
  const finalList = useMemo(() => {
    if (!query.trim()) return filtered
    const q = query.trim().toLowerCase()
    return filtered.filter((m) => m.title.toLowerCase().includes(q))
  }, [filtered, query])
  const featured = useMemo(() => movies.slice(0, 4), [movies])
  const favoritesList = useMemo(() => movies.filter((m) => favorites.includes(m.id)), [movies, favorites])
  const displayed = useMemo(() => {
    return onlyFav ? finalList.filter((m) => favorites.includes(m.id)) : finalList
  }, [finalList, favorites, onlyFav])
  return (
    <>
      {loading && (
        <div className="space-y-4">
          <Card className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3">
                <div className="h-8 w-2/3 bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-neutral-800 rounded animate-pulse" />
              </div>
              <div className="md:col-span-1">
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-neutral-800 rounded animate-pulse" />
                  <div className="h-10 w-24 bg-neutral-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </Card>
          <h2 className="text-xl font-semibold">Now Showing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-neutral-800 rounded bg-neutral-900/40 overflow-hidden">
                <div className="h-48 w-full bg-neutral-800 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-2/3 bg-neutral-800 rounded animate-pulse" />
                  <div className="h-4 w-1/3 bg-neutral-800 rounded animate-pulse" />
                  <div className="h-4 w-full bg-neutral-800 rounded animate-pulse" />
                </div>
                <div className="p-4 pt-0">
                  <div className="h-9 w-24 bg-neutral-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!loading && error && <Alert message={error} variant="error" />}
      {!loading && !error && (
        <div className="space-y-4">
          <Card className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <div className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
                  Book Your Movie Night
                </div>
                <div className="text-sm text-neutral-400">
                  Explore showtimes, pick seats, and get instant e-tickets.
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="flex gap-2">
                  <input
                    className="w-full p-2 rounded bg-neutral-800"
                    placeholder="Search titles"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button onClick={() => setQuery('')}>Clear</Button>
                </div>
              </div>
            </div>
          </Card>
          {featured.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Featured Movies</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {featured.map((m: Movie) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </div>
          )}
          {favoritesList.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Your Favorites</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {favoritesList.slice(0, 8).map((m: Movie) => (
                  <MovieCard key={`fav-${m.id}`} movie={m} />
                ))}
              </div>
            </div>
          )}
          <h2 className="text-xl font-semibold">Now Showing</h2>
          <Card className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm text-neutral-400">Filter by genre</div>
              <GenreFilter movies={movies} value={genre} onChange={setGenre} />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-neutral-400">Filter by cinema</div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded ${cinema === null ? 'bg-purple-700' : 'bg-neutral-700'} hover:bg-purple-600`}
                  onClick={() => setCinema(null)}
                >
                  All
                </button>
                {cinemas.map((c: string) => (
                  <button
                    key={c}
                    className={`px-3 py-1 rounded ${cinema === c ? 'bg-purple-700' : 'bg-neutral-700'} hover:bg-purple-600`}
                    onClick={() => setCinema(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-neutral-400">Filter by date</div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={date ?? ''}
                  onChange={(e) => setDate(e.target.value || null)}
                  className="px-3 py-1 rounded bg-neutral-800 text-sm"
                />
                {date && (
                  <button
                    className="text-xs px-2 py-0.5 rounded bg-neutral-700 hover:bg-neutral-600"
                    onClick={() => setDate(null)}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-neutral-400">Favorites</div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={onlyFav} onChange={() => setOnlyFav((v) => !v)} />
                <span>Show only favorites</span>
              </label>
            </div>
          </Card>
          {displayed.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <div className="text-lg font-semibold">No movies match your filters</div>
              <div className="text-sm text-neutral-400">Try selecting a different cinema or date.</div>
              <div className="flex items-center justify-center gap-2">
                <button
                  className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
                  onClick={() => {
                    setCinema(null)
                    setDate(null)
                    setQuery('')
                  }}
                >
                  Clear filters
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayed.map((m: Movie) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
