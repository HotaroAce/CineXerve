import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'
import Steps from '../components/Steps'

type ShowtimeInfo = { id: number; datetime: string; cinema: string; movie: { id: number; title: string } }

export default function BookingDetails() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: { showtimeId: number; seatNumber: string } }
  const [info, setInfo] = useState<ShowtimeInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const showtimeId = state?.showtimeId
  const seatNumber = state?.seatNumber

  useEffect(() => {
    if (!showtimeId || !seatNumber) {
      setError('Missing selection')
      return
    }
    api.get(`/showtimes/by-id/${showtimeId}`).then((r) => setInfo(r.data))
  }, [showtimeId, seatNumber])

  function next() {
    if (!showtimeId || !seatNumber) return
    navigate('/checkout', { state: { showtimeId, seatNumber } })
  }

  if (error) return <Alert message={error} variant="error" />
  if (!info) return <div className="text-sm text-neutral-400">Loading…</div>
  return (
    <div className="mx-auto max-w-md">
      <Card className="mb-4">
        <Steps items={['Seats', 'Details', 'Checkout', 'Verify', 'Ticket']} current={1} />
      </Card>
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Booking Details</h2>
        <div className="space-y-2">
          <div className="text-sm">{info.movie.title}</div>
          <div className="text-sm">{new Date(info.datetime).toLocaleString()}</div>
          <div className="text-sm">{info.cinema}</div>
          <div className="text-sm">Seat {seatNumber}</div>
        </div>
        <Button onClick={next}>Proceed to Checkout</Button>
      </Card>
    </div>
  )
}
