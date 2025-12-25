import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import Button from '../components/Button'
import Card from '../components/Card'
import Alert from '../components/Alert'

type Booking = {
  id: number
  userName: string
  seatNumber: string
  createdAt: string
  showtimeId: number
  movieTitle?: string
  cinema?: string
  datetime?: string
}

export default function History() {
  const { user } = useParams()
  const [items, setItems] = useState<Booking[]>([])
  const [status, setStatus] = useState<string | null>(null)
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const email = localStorage.getItem('auth_email')
    if (token) {
      api.get(`/history/me`).then((r) => setItems(r.data))
    } else if (user) {
      api.get(`/history/${user}`).then((r) => setItems(r.data))
    }
  }, [user])
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Booking history</h2>
      {status && <Alert message={status} variant="success" />}
      <div className="space-y-2">
        {items.map((b) => (
          <Card key={b.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm">
                {b.movieTitle ? `${b.movieTitle} • ` : ''}{b.cinema ? `${b.cinema} • ` : ''}{b.datetime ? new Date(b.datetime).toLocaleString() : ''}
              </div>
              <div className="text-sm">Seat {b.seatNumber}</div>
              <div className="text-sm text-neutral-400">{new Date(b.createdAt).toLocaleString()}</div>
            </div>
            <Button
              variant="danger"
              onClick={async () => {
                const ok = window.confirm('Cancel this booking?')
                if (!ok) return
                const r = await api.delete(`/cancel/${b.id}`).catch((e) => e.response)
                if (r?.status === 200) {
                  setItems((prev) => prev.filter((x) => x.id !== b.id))
                  setStatus('Booking canceled')
                }
              }}
            >
              Cancel
            </Button>
          </Card>
        ))}
        {items.length === 0 && <div className="text-sm text-neutral-400">No bookings</div>}
      </div>
    </div>
  )
}
