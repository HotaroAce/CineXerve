import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import Button from '../components/Button'
import Card from '../components/Card'
import Alert from '../components/Alert'

type Movie = { id: number; title: string }

export default function AdminAddShowtime() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [movieId, setMovieId] = useState<number | ''>('')
  const [datetime, setDatetime] = useState('')
  const [cinema, setCinema] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [params] = useSearchParams()

  useEffect(() => {
    api.get('/movies').then((r) => {
      setMovies(r.data)
      const qs = params.get('movieId')
      const id = qs ? Number(qs) : NaN
      if (!Number.isNaN(id) && r.data.some((m: Movie) => m.id === id)) {
        setMovieId(id)
      }
    })
  }, [])

  useEffect(() => {
    if (!datetime) {
      const d = new Date(Date.now() + 60 * 60 * 1000)
      const pad = (n: number) => String(n).padStart(2, '0')
      const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      setDatetime(local)
    }
  }, [datetime])

  const isValid = useMemo(() => {
    const hasMovie = typeof movieId === 'number'
    const hasCinema = cinema.trim().length > 0
    const dt = datetime ? new Date(datetime) : null
    const notPast = dt ? dt.getTime() > Date.now() - 60 * 1000 : false
    return hasMovie && hasCinema && Boolean(dt) && notPast
  }, [movieId, cinema, datetime])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus(null)
    if (!isValid) {
      setError('Select a movie, future date/time, and enter a cinema.')
      return
    }
    setProcessing(true)
    const payload = { movieId: movieId === '' ? undefined : Number(movieId), datetime, cinema: cinema.trim() }
    const r = await api.post('/showtimes', payload).catch((e) => e.response)
    if (r?.status === 201) {
      const m = movies.find((x) => x.id === Number(movieId))
      setStatus(`Showtime added for ${m?.title ?? 'movie'}`)
      setCinema('')
    } else {
      setError(r?.data?.error ?? 'Failed to add showtime')
    }
    setProcessing(false)
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Add Showtime</h2>
        <form className="space-y-3" onSubmit={submit}>
          <select className="w-full p-2 rounded bg-neutral-800" value={movieId} onChange={(e) => setMovieId(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">Select movie</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
          <input className="w-full p-2 rounded bg-neutral-800" type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
          <input className="w-full p-2 rounded bg-neutral-800" placeholder="Cinema" value={cinema} onChange={(e) => setCinema(e.target.value)} />
          <Button type="submit" disabled={!isValid || processing}>{processing ? 'Adding…' : 'Add'}</Button>
        </form>
        {error && <Alert message={error} variant="error" />}
        {status && <Alert message={status} variant="success" />}
      </Card>
    </div>
  )
}
