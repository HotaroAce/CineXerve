import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { api } from '../api'

export default function AdminDashboard() {
  const [items, setItems] = useState<
    { id: number; userName: string; seatNumber: string; createdAt: string; showtimeId: number; movieTitle: string; cinema: string; datetime: string }[]
  >([])
  useEffect(() => {
    api.get('/reservations').then((r) => setItems(r.data)).catch(() => setItems([]))
  }, [])
  const total = items.length
  const today = useMemo(() => {
    const t = new Date()
    return items.filter((b) => {
      const d = new Date(b.createdAt)
      return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
    }).length
  }, [items])
  const distinctMovies = useMemo(() => {
    const s = new Set(items.map((b) => b.movieTitle))
    return s.size
  }, [items])
  const recent = items.slice(0, 6)
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-xs text-neutral-400">Total Reservations</div>
          <div className="text-xl font-semibold">{total}</div>
        </Card>
        <Card>
          <div className="text-xs text-neutral-400">Reservations Today</div>
          <div className="text-xl font-semibold">{today}</div>
        </Card>
        <Card>
          <div className="text-xs text-neutral-400">Distinct Movies</div>
          <div className="text-xl font-semibold">{distinctMovies}</div>
        </Card>
      </div>
      <Card className="space-y-3">
        <div className="text-lg font-semibold">Recent Reservations</div>
        <div className="space-y-2">
          {recent.map((b) => (
            <div key={b.id} className="flex items-center justify-between">
              <div className="text-sm">{b.movieTitle} • {new Date(b.datetime).toLocaleString()} • {b.cinema}</div>
              <div className="text-sm">User {b.userName} • Seat {b.seatNumber}</div>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-neutral-400">No reservations</div>}
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/admin/manage/movies">
          <Card>
            <div className="text-lg font-semibold">Movie</div>
            <div className="text-sm text-neutral-400">Manage movies and showtimes</div>
          </Card>
        </a>
        <a href="/admin/manage/theater">
          <Card>
            <div className="text-lg font-semibold">Theater</div>
            <div className="text-sm text-neutral-400">Manage theater showtimes</div>
          </Card>
        </a>
        <a href="/admin/profile">
          <Card>
            <div className="text-lg font-semibold">Profile</div>
            <div className="text-sm text-neutral-400">Update admin account details</div>
          </Card>
        </a>
      </div>
    </div>
  )
}
