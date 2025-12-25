import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import SeatButton from '../components/SeatButton'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import SeatLegend from '../components/SeatLegend'
import Button from '../components/Button'
import Card from '../components/Card'
import Steps from '../components/Steps'

type Seat = {
  id: number
  showtimeId: number
  seatNumber: string
  status: string
}

type ShowtimeInfo = {
  id: number
  datetime: string
  cinema: string
  movie: { id: number; title: string }
}

export default function Seats() {
  const { showtimeId } = useParams()
  const navigate = useNavigate()
  const [seats, setSeats] = useState<Seat[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [info, setInfo] = useState<ShowtimeInfo | null>(null)
  const [showHint, setShowHint] = useState<boolean>(() => {
    return localStorage.getItem('seen_seat_hint') !== '1'
  })
  useEffect(() => {
    if (!showtimeId) return
    api
      .get(`/seats/${showtimeId}`)
      .then((r) => setSeats(r.data))
      .catch(() => setError('Failed to load seats'))
      .finally(() => setLoading(false))
    api.get(`/showtimes/by-id/${showtimeId}`).then((r) => setInfo(r.data))
  }, [showtimeId])

  const rows = useMemo(() => {
    const groups = new Map<string, Seat[]>()
    for (const s of seats) {
      const row = s.seatNumber[0]
      if (!groups.has(row)) groups.set(row, [])
      groups.get(row)!.push(s)
    }
    for (const g of groups.values()) {
      g.sort((a, b) => {
        const na = Number(a.seatNumber.slice(1))
        const nb = Number(b.seatNumber.slice(1))
        return na - nb
      })
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [seats])

  function proceed() {
    if (!selected || !showtimeId) return
    const email = localStorage.getItem('auth_email')
    if (!email) {
      navigate('/login')
      return
    }
    navigate('/booking-details', { state: { showtimeId: Number(showtimeId), seatNumber: selected } })
  }

  return (
    <div className="space-y-4">
      <Card>
        <Steps items={['Seats', 'Details', 'Checkout', 'Verify', 'Ticket']} current={0} />
      </Card>
      <Card className="space-y-1">
        <h2 className="text-xl font-semibold">Select a seat</h2>
        {info && (
          <div className="text-sm text-neutral-300">
            {info.movie.title} • {new Date(info.datetime).toLocaleString()} • {info.cinema}
          </div>
        )}
      </Card>
      {showHint && (
        <Card className="flex items-center justify-between gap-3 text-xs">
          <div className="text-neutral-300">
            Tips: Click an available seat to select it. Reserved seats are disabled.
          </div>
          <button
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
            onClick={() => {
              localStorage.setItem('seen_seat_hint', '1')
              setShowHint(false)
            }}
          >
            Got it
          </button>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <div className="mb-3">
              <SeatLegend />
            </div>
            {loading && <Spinner />}
            {!loading && error && <Alert message={error} variant="error" />}
            {status && <Alert message={status} variant={status.includes('failed') ? 'error' : 'success'} />}
            <div className="mb-4 text-center text-xs text-neutral-400">SCREEN</div>
            <div className="space-y-3">
              {rows.map(([row, ss]) => (
                <div key={row} className="flex items-center gap-2">
                  <div className="w-8">{row}</div>
                  <div className="flex flex-wrap gap-2">
                    {ss.map((s) => (
                      <SeatButton
                        key={s.id}
                        label={s.seatNumber}
                        status={s.status === 'reserved' ? 'reserved' : 'available'}
                        selected={selected === s.seatNumber}
                        onSelect={() => setSelected(s.seatNumber)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card className="space-y-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Summary</div>
              {info && (
                <div className="text-xs text-neutral-400">
                  {info.movie.title} • {new Date(info.datetime).toLocaleString()} • {info.cinema}
                </div>
              )}
            </div>
            <div className="text-sm">Selected seat: {selected ?? '-'}</div>
            <div className="text-sm">Price: ₱250</div>
            <Button onClick={proceed} disabled={!selected}>Continue</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
