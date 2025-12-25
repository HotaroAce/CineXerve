import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'
import Steps from '../components/Steps'

export default function VerifyPayment() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: { showtimeId: number; seatNumber: string; price: number } }
  const showtimeId = state?.showtimeId
  const seatNumber = state?.seatNumber
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(true)
  const [bookingId, setBookingId] = useState<number | null>(null)

  useEffect(() => {
    async function run() {
      if (!showtimeId || !seatNumber) {
        setError('Missing checkout info')
        setProcessing(false)
        return
      }
      const email = localStorage.getItem('auth_email')
      if (!email) {
        navigate('/login')
        return
      }
      await new Promise((r) => setTimeout(r, 800))
      const r = await api.post('/book', { userName: email, showtimeId, seatNumber }).catch((e) => e.response)
      if (r?.status !== 200) {
        setError(r?.data?.error ?? 'Payment or booking failed')
        setProcessing(false)
        return
      }
      setBookingId(r.data.bookingId)
      setProcessing(false)
    }
    run()
  }, [showtimeId, seatNumber, navigate])

  useEffect(() => {
    if (!processing && bookingId) {
      navigate('/ticket', { state: { bookingId, showtimeId, seatNumber } })
    }
  }, [processing, bookingId, navigate, showtimeId, seatNumber])

  if (error) return <Alert message={error} variant="error" />
  return (
    <div className="mx-auto max-w-md">
      <Card className="mb-4">
        <Steps items={['Seats', 'Details', 'Checkout', 'Verify', 'Ticket']} current={3} />
      </Card>
      <Card className="space-y-4">
        <div className="text-sm text-neutral-400">{processing ? 'Verifying payment…' : 'Done'}</div>
        <div className="flex gap-2">
          {!processing && !error && <Button onClick={() => navigate('/ticket', { state })}>View Ticket</Button>}
          <Button variant="secondary" onClick={() => navigate('/checkout', { state })} disabled={processing}>
            Back to Checkout
          </Button>
        </div>
      </Card>
    </div>
  )
}
