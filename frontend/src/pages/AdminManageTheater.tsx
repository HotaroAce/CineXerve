import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import Card from '../components/Card'
import Button from '../components/Button'
import Alert from '../components/Alert'

type Movie = { id: number; title: string }
type Showtime = { id: number; movieId: number; datetime: string; cinema: string }

export default function AdminManageTheater() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [showtimesByMovie, setShowtimesByMovie] = useState<Record<number, Showtime[]>>({})
  const [query, setQuery] = useState('')
  const [date, setDate] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editCinema, setEditCinema] = useState('')
  const [editDatetime, setEditDatetime] = useState('')
  useEffect(() => {
    api.get('/movies').then((r) => {
      setMovies(r.data)
      Promise.all(
        r.data.map((m: Movie) => api.get(`/showtimes/${m.id}`).then((s) => [m.id, s.data] as const)),
      ).then((pairs) => {
        const map: Record<number, Showtime[]> = {}
        for (const [id, sts] of pairs) map[id] = sts
        setShowtimesByMovie(map)
      })
    })
  }, [])
  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase()
    return movies.filter((m) => !q || m.title.toLowerCase().includes(q))
  }, [movies, query])
  function matchesDate(s: Showtime): boolean {
    if (!date) return true
    const d = new Date(date)
    const sd = new Date(s.datetime)
    return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth() && sd.getDate() === d.getDate()
  }
  function startEdit(s: Showtime) {
    setEditId(s.id)
    const d = new Date(s.datetime)
    const pad = (n: number) => String(n).padStart(2, '0')
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    setEditDatetime(local)
    setEditCinema(s.cinema)
    setStatus(null)
    setError(null)
  }
  async function saveEdit(movieId: number) {
    if (editId == null) return
    setProcessing(true)
    setError(null)
    setStatus(null)
    const payload = { datetime: editDatetime, cinema: editCinema.trim() }
    const r = await api.patch(`/showtimes/${editId}`, payload).catch((e) => e.response)
    if (r?.status === 200) {
      setShowtimesByMovie((prev) => {
        const list = (prev[movieId] ?? []).map((x) => (x.id === editId ? { ...x, datetime: editDatetime, cinema: editCinema } : x))
        return { ...prev, [movieId]: list }
      })
      setStatus('Showtime updated')
      setEditId(null)
    } else {
      setError(r?.data?.error ?? 'Failed to update showtime')
    }
    setProcessing(false)
  }
  async function deleteShowtime(id: number, movieId: number) {
    const ok = window.confirm('Delete this showtime?')
    if (!ok) return
    setProcessing(true)
    setError(null)
    setStatus(null)
    const r = await api.delete(`/showtimes/${id}`).catch((e) => e.response)
    if (r?.status === 200) {
      setShowtimesByMovie((prev) => {
        const list = (prev[movieId] ?? []).filter((x) => x.id !== id)
        return { ...prev, [movieId]: list }
      })
      setStatus('Showtime deleted')
    } else {
      setError(r?.data?.error ?? 'Failed to delete showtime')
    }
    setProcessing(false)
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Manage Theater</h2>
      <Card className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            className="p-2 rounded bg-neutral-800 text-sm"
            placeholder="Search movie title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            type="date"
            className="p-2 rounded bg-neutral-800 text-sm"
            value={date ?? ''}
            onChange={(e) => setDate(e.target.value || null)}
          />
          <div>
            <button
              className="text-sm px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
              onClick={() => {
                setQuery('')
                setDate(null)
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </Card>
      <div className="space-y-3">
        {filteredMovies.map((m) => (
          <Card key={m.id}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">{m.title}</div>
              <a href={`/admin/add-showtime?movieId=${m.id}`}>
                <Button variant="secondary">Add Showtime</Button>
              </a>
            </div>
            <div className="text-sm text-neutral-400">Showtimes</div>
            <div className="space-y-1">
              {(showtimesByMovie[m.id] ?? []).filter(matchesDate).map((s) => (
                <div key={s.id} className="text-sm">
                  {editId === s.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input className="flex-1 p-2 rounded bg-neutral-800 text-sm" type="datetime-local" value={editDatetime} onChange={(e) => setEditDatetime(e.target.value)} />
                        <input className="flex-1 p-2 rounded bg-neutral-800 text-sm" placeholder="Cinema" value={editCinema} onChange={(e) => setEditCinema(e.target.value)} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={() => saveEdit(m.id)} disabled={processing}>Save</Button>
                        <Button variant="secondary" onClick={() => setEditId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{new Date(s.datetime).toLocaleString()} • {s.cinema}</span>
                      <Button variant="secondary" onClick={() => startEdit(s)}>Edit</Button>
                      <Button variant="danger" onClick={() => deleteShowtime(s.id, m.id)} disabled={processing}>Delete</Button>
                    </div>
                  )}
                </div>
              ))}
              {(showtimesByMovie[m.id] ?? []).filter(matchesDate).length === 0 && <div className="text-sm text-neutral-500">None</div>}
            </div>
          </Card>
        ))}
      </div>
      {error && <Alert message={error} variant="error" />}
      {status && <Alert message={status} variant="success" />}
    </div>
  )
}
