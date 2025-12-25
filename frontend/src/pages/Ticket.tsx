import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Button from '../components/Button'
import Card from '../components/Card'
import Steps from '../components/Steps'

type ShowtimeInfo = { id: number; datetime: string; cinema: string; movie: { id: number; title: string } }

export default function Ticket() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: { bookingId: number; showtimeId: number; seatNumber: string } }
  const showtimeId = state?.showtimeId
  const seatNumber = state?.seatNumber
  const [info, setInfo] = useState<ShowtimeInfo | null>(null)
  function addToCalendar() {
    if (!info) return
    const start = new Date(info.datetime)
    const dtstamp = new Date()
    function fmt(d: Date) {
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
    }
    const uid = `cinexerve-${showtimeId}-${seatNumber}`
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CineXerve//EN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${fmt(dtstamp)}`,
      `DTSTART:${fmt(start)}`,
      `SUMMARY:${info.movie.title} at ${info.cinema}`,
      `DESCRIPTION:Seat ${seatNumber}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
    const ics = lines.join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ticket.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!showtimeId) return
    api.get(`/showtimes/by-id/${showtimeId}`).then((r) => setInfo(r.data))
  }, [showtimeId])

  return (
    <div className="mx-auto max-w-md">
      <Card className="mb-4">
        <Steps items={['Seats', 'Details', 'Checkout', 'Verify', 'Ticket']} current={4} />
      </Card>
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Your Ticket</h2>
        <div className="space-y-2">
          {info && (
            <>
              <div className="text-sm">{info.movie.title}</div>
              <div className="text-sm">{new Date(info.datetime).toLocaleString()}</div>
              <div className="text-sm">{info.cinema}</div>
            </>
          )}
          <div className="text-sm">Seat {seatNumber}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/')}>Back to Home</Button>
          <Button
            variant="secondary"
            onClick={() => {
              localStorage.removeItem('auth_token')
              localStorage.removeItem('auth_email')
              navigate('/')
            }}
          >
            Log Out
          </Button>
          <Button onClick={addToCalendar}>Add to Calendar</Button>
        </div>
      </Card>
    </div>
  )
}
