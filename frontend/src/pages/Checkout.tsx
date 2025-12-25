import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Steps from '../components/Steps'

export default function Checkout() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: { showtimeId: number; seatNumber: string } }
  const showtimeId = state?.showtimeId
  const seatNumber = state?.seatNumber
  const price = 250
  const [method, setMethod] = useState<'card' | 'gcash' | 'maya'>('card')

  function next() {
    if (!showtimeId || !seatNumber) return
    navigate('/verify', { state: { showtimeId, seatNumber, price, method } })
  }

  return (
    <div className="space-y-4">
      <Card>
        <Steps items={['Seats', 'Details', 'Checkout', 'Verify', 'Ticket']} current={2} />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Payment Method</h2>
            <div className="flex flex-col gap-2">
              <label className={`flex items-center gap-2 p-2 rounded ${method === 'card' ? 'bg-neutral-800' : ''}`}>
                <input type="radio" name="method" checked={method === 'card'} onChange={() => setMethod('card')} />
                <span className="text-sm">Credit/Debit Card</span>
              </label>
              <label className={`flex items-center gap-2 p-2 rounded ${method === 'gcash' ? 'bg-neutral-800' : ''}`}>
                <input type="radio" name="method" checked={method === 'gcash'} onChange={() => setMethod('gcash')} />
                <span className="text-sm">GCash</span>
              </label>
              <label className={`flex items-center gap-2 p-2 rounded ${method === 'maya' ? 'bg-neutral-800' : ''}`}>
                <input type="radio" name="method" checked={method === 'maya'} onChange={() => setMethod('maya')} />
                <span className="text-sm">Maya</span>
              </label>
            </div>
            <Button onClick={next} disabled={!showtimeId || !seatNumber}>Verify Payment</Button>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card className="space-y-3">
            <div className="text-sm font-medium">Order Summary</div>
            <div className="text-sm">Seat {seatNumber}</div>
            <div className="flex items-center justify-between text-sm">
              <span>Ticket Price</span>
              <span>₱{price}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-neutral-400">
              <span>Convenience Fee</span>
              <span>₱0</span>
            </div>
            <div className="border-t border-neutral-800 pt-2 flex items-center justify-between font-medium">
              <span>Total</span>
              <span>₱{price}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
