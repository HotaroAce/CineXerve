import { useMemo, useState } from 'react'
import { api } from '../api'
import Button from '../components/Button'
import Card from '../components/Card'
import Alert from '../components/Alert'

export default function AdminAddMovie() {
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [duration, setDuration] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const isValid = useMemo(() => {
    return title.trim().length > 0 && (duration === '' || (typeof duration === 'number' && duration > 0))
  }, [title, duration])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus(null)
    if (!isValid) {
      setError('Please enter a title and a positive duration (optional).')
      return
    }
    setProcessing(true)
    const payload = {
      title: title.trim(),
      genre: genre.trim() || undefined,
      duration: duration === '' ? undefined : Number(duration),
      description: description.trim() || undefined,
    }
    const r = await api.post('/movies', payload).catch((e) => e.response)
    if (r?.status === 201) {
      setStatus(`Movie "${r.data.title}" added`)
      setTitle('')
      setGenre('')
      setDuration('')
      setDescription('')
    } else {
      setError(r?.data?.error ?? 'Failed to add movie')
    }
    setProcessing(false)
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Add Movie</h2>
        <form className="space-y-3" onSubmit={submit}>
          <input className="w-full p-2 rounded bg-neutral-800" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="w-full p-2 rounded bg-neutral-800" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
          <input className="w-full p-2 rounded bg-neutral-800" placeholder="Duration (min)" value={duration} onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))} />
          <textarea className="w-full p-2 rounded bg-neutral-800" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button type="submit" disabled={!isValid || processing}>{processing ? 'Adding…' : 'Add'}</Button>
        </form>
        {error && <Alert message={error} variant="error" />}
        {status && <Alert message={status} variant="success" />}
      </Card>
    </div>
  )
}
