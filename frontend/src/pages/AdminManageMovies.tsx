import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import Card from '../components/Card'
import Button from '../components/Button'
import GenreFilter from '../components/GenreFilter'
import Table from '../components/Table'
import Alert from '../components/Alert'

type Movie = { id: number; title: string; genre?: string | null; duration?: number | null; description?: string | null }
type Showtime = { id: number; movieId: number; datetime: string; cinema: string }

export default function AdminManageMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [showtimeCounts, setShowtimeCounts] = useState<Record<number, number>>({})
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editGenre, setEditGenre] = useState<string | null>(null)
  const [editDuration, setEditDuration] = useState<string>('')
  useEffect(() => {
    api.get('/movies').then((r) => setMovies(r.data)).finally(() => setLoading(false))
  }, [])
  useEffect(() => {
    if (movies.length === 0) return
    Promise.all(movies.map((m) => api.get(`/showtimes/${m.id}`).then((res) => [m.id, (res.data as Showtime[]).length] as const))).then(
      (pairs) => {
        const map: Record<number, number> = {}
        for (const [id, count] of pairs) map[id] = count
        setShowtimeCounts(map)
      },
    )
  }, [movies])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return movies.filter((m) => {
      const matchQ = !q || m.title.toLowerCase().includes(q) || (m.genre ?? '').toLowerCase().includes(q)
      const matchG = genre === null || (m.genre ?? null) === genre
      return matchQ && matchG
    })
  }, [movies, query, genre])
  function startEdit(m: Movie) {
    setEditId(m.id)
    setEditTitle(m.title)
    setEditGenre(m.genre ?? null)
    setEditDuration(m.duration != null ? String(m.duration) : '')
    setStatus(null)
    setError(null)
  }
  async function saveEdit() {
    if (editId == null) return
    setProcessing(true)
    setError(null)
    setStatus(null)
    const payload: any = {
      title: editTitle.trim(),
      genre: (editGenre ?? '').trim() || null,
      duration: editDuration === '' ? null : Number(editDuration),
    }
    const r = await api.patch(`/movies/${editId}`, payload).catch((e) => e.response)
    if (r?.status === 200) {
      setMovies((prev) => prev.map((x) => (x.id === editId ? { ...x, ...r.data } : x)))
      setStatus('Movie updated')
      setEditId(null)
    } else {
      setError(r?.data?.error ?? 'Failed to update movie')
    }
    setProcessing(false)
  }
  async function deleteMovie(id: number) {
    const ok = window.confirm('Delete this movie and its showtimes?')
    if (!ok) return
    setProcessing(true)
    setError(null)
    setStatus(null)
    const r = await api.delete(`/movies/${id}`).catch((e) => e.response)
    if (r?.status === 200) {
      setMovies((prev) => prev.filter((x) => x.id !== id))
      setShowtimeCounts((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setStatus('Movie deleted')
    } else {
      setError(r?.data?.error ?? 'Failed to delete movie')
    }
    setProcessing(false)
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Manage Movies</h2>
      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <a className="underline" href="/admin/add-movie">Add Movie</a>
          <a className="underline" href="/admin/add-showtime">Add Showtime</a>
          <a className="underline" href="/admin/reservations">Reservations</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            className="p-2 rounded bg-neutral-800 text-sm"
            placeholder="Search title or genre"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="md:col-span-2">
            <GenreFilter movies={movies} value={genre} onChange={setGenre} />
          </div>
        </div>
        <Table
          columns={[
            { key: 'title', label: 'Title', sortable: true },
            { key: 'genre', label: 'Genre', sortable: true, render: (m) => m.genre ?? '—' },
            { key: 'duration', label: 'Duration', sortable: true, render: (m) => (m.duration ? `${m.duration} min` : '—') },
            { key: 'id', label: 'Showtimes', render: (m) => showtimeCounts[m.id] ?? 0 },
            {
              key: 'id',
              label: 'Actions',
              render: (m) => (
                <div className="flex flex-wrap gap-2">
                  <a href={`/admin/add-showtime?movieId=${m.id}`}>
                    <Button variant="secondary">Add Showtime</Button>
                  </a>
                  <Button variant="secondary" onClick={() => startEdit(m)}>Edit</Button>
                  <Button variant="danger" onClick={() => deleteMovie(m.id)} disabled={processing}>Delete</Button>
                  {editId === m.id && (
                    <div className="w-full space-y-2 mt-2">
                      <input className="w-full p-2 rounded bg-neutral-800 text-sm" placeholder="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      <div className="flex gap-2">
                        <input className="flex-1 p-2 rounded bg-neutral-800 text-sm" placeholder="Genre" value={editGenre ?? ''} onChange={(e) => setEditGenre(e.target.value)} />
                        <input className="w-40 p-2 rounded bg-neutral-800 text-sm" placeholder="Duration" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={saveEdit} disabled={processing}>Save</Button>
                        <Button variant="secondary" onClick={() => setEditId(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
          data={filtered}
          sortKey={'title'}
          sortDir={'asc'}
        />
        {error && <Alert message={error} variant="error" />}
        {status && <Alert message={status} variant="success" />}
        {loading && <div className="text-sm text-neutral-400">Loading…</div>}
        {filtered.length === 0 && !loading && <div className="text-sm text-neutral-400">No movies found</div>}
      </Card>
    </div>
  )
}
