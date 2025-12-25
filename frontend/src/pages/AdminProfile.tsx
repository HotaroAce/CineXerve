import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'
import Spinner from '../components/Spinner'

type Me = { id: number; email: string; name?: string | null }
type Reservation = { id: number; userName: string; seatNumber: string; createdAt: string; showtimeId: number; movieTitle: string; cinema: string; datetime: string }

export default function AdminProfile() {
  const [me, setMe] = useState<Me | null>(null)
  const [name, setName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loadingMe, setLoadingMe] = useState(true)
  const [loadingRes, setLoadingRes] = useState(true)
  const [resQuery, setResQuery] = useState('')
  const [resDate, setResDate] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/me').then((r) => {
      setMe(r.data)
      setName(r.data.name ?? '')
    }).catch(() => setError('Failed to load profile')).finally(() => setLoadingMe(false))
  }, [])
  useEffect(() => {
    api.get('/reservations').then((r) => setReservations(r.data)).catch(() => setReservations([])).finally(() => setLoadingRes(false))
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus(null)
    setProcessing(true)
    const r = await api.patch('/auth/me', { name, password: password || undefined }).catch((e) => e.response)
    if (r?.status !== 200) {
      setError(r?.data?.error ?? 'Update failed')
      setProcessing(false)
      return
    }
    setMe(r.data)
    setPassword('')
    setStatus('Profile updated')
    setProcessing(false)
  }

  const initials = useMemo(() => {
    const src = (me?.name ?? '') || (me?.email ?? '')
    const parts = src.split(/\s+|@/).filter(Boolean)
    const a = parts[0]?.[0] ?? ''
    const b = parts[1]?.[0] ?? ''
    return (a + b).toUpperCase()
  }, [me])
  const totalReservations = reservations.length
  const uniqueUsers = useMemo(() => {
    const s = new Set(reservations.map((r) => r.userName))
    return s.size
  }, [reservations])
  const filteredReservations = useMemo(() => {
    const q = resQuery.trim().toLowerCase()
    const d = resDate ? new Date(resDate) : null
    return reservations.filter((b) => {
      const matchQ =
        !q ||
        b.userName.toLowerCase().includes(q) ||
        b.movieTitle.toLowerCase().includes(q) ||
        b.cinema.toLowerCase().includes(q) ||
        b.seatNumber.toLowerCase().includes(q)
      const matchD = d
        ? (() => {
            const bd = new Date(b.datetime)
            return (
              bd.getFullYear() === d.getFullYear() &&
              bd.getMonth() === d.getMonth() &&
              bd.getDate() === d.getDate()
            )
          })()
        : true
      return matchQ && matchD
    })
  }, [reservations, resQuery, resDate])
  const recent = filteredReservations.slice(0, 8)
  const passwordStrength = useMemo(() => {
    const v = password
    let score = 0
    if (v.length >= 6) score++
    if (v.length >= 10) score++
    if (/[A-Z]/.test(v)) score++
    if (/[a-z]/.test(v)) score++
    if (/[0-9]/.test(v)) score++
    if (/[^A-Za-z0-9]/.test(v)) score++
    return Math.min(score, 5)
  }, [password])

  function copyEmail() {
    if (me?.email) navigator.clipboard?.writeText(me.email)
  }

  function exportCsv() {
    const header = ['ID', 'User', 'Movie', 'Cinema', 'Datetime', 'Seat']
    const rows = reservations.map((b) => [
      b.id,
      b.userName,
      b.movieTitle,
      b.cinema,
      new Date(b.datetime).toLocaleString(),
      b.seatNumber,
    ])
    const csv = [header, ...rows].map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reservations.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <Card className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-lg font-semibold">
            {initials || 'A'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="text-xl font-semibold">{me?.name || me?.email || 'Admin'}</div>
              <span className="text-xs px-2 py-0.5 rounded bg-neutral-800">Admin</span>
              {me?.email && (
                <button className="text-xs px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700" onClick={copyEmail}>
                  Copy email
                </button>
              )}
            </div>
            <div className="text-sm text-neutral-400">Manage admin account and monitor reservations</div>
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-xs text-neutral-400">Total Reservations</div>
            <div className="text-xl font-semibold">{totalReservations}</div>
          </Card>
          <Card>
            <div className="text-xs text-neutral-400">Distinct Users</div>
            <div className="text-xl font-semibold">{uniqueUsers}</div>
          </Card>
          <Card>
            <div className="text-xs text-neutral-400">Email</div>
            <div className="text-xl font-semibold">{me?.email ?? '—'}</div>
          </Card>
        </div>
        <Card className="space-y-3">
          <div className="text-lg font-semibold">Recent Reservations</div>
          <div className="flex items-center gap-2">
            <input
              className="flex-1 p-2 rounded bg-neutral-800 text-sm"
              placeholder="Search user, movie, cinema, or seat"
              value={resQuery}
              onChange={(e) => setResQuery(e.target.value)}
            />
            <input
              type="date"
              className="p-2 rounded bg-neutral-800 text-sm"
              value={resDate ?? ''}
              onChange={(e) => setResDate(e.target.value || null)}
            />
            <button
              className="text-sm px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
              onClick={() => {
                setResQuery('')
                setResDate(null)
              }}
            >
              Clear
            </button>
            <button
              className="text-sm px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
              onClick={exportCsv}
            >
              Export CSV
            </button>
          </div>
          <div className="space-y-2">
            {loadingRes && <Spinner />}
            {!loadingRes && recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="text-sm">{b.movieTitle} • {new Date(b.datetime).toLocaleString()} • {b.cinema}</div>
                <div className="text-sm">User {b.userName} • Seat {b.seatNumber}</div>
              </div>
            ))}
            {!loadingRes && recent.length === 0 && <div className="text-sm text-neutral-400">No reservations yet</div>}
          </div>
          <div className="flex gap-2">
            <Link to="/admin/reservations" className="text-sm underline">View all reservations</Link>
            <Link to="/admin/dashboard" className="text-sm underline">Go to dashboard</Link>
          </div>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Account</h2>
          {error && <Alert message={error} variant="error" />}
          {status && <Alert message={status} variant="success" />}
          {me && (
            <div className="space-y-2">
              <div className="text-sm">Email {me.email}</div>
            </div>
          )}
          <form className="space-y-3" onSubmit={save}>
            <div className="space-y-1">
              <label className="text-xs text-neutral-400" htmlFor="name">Name</label>
              <input id="name" className="w-full p-2 rounded bg-neutral-800" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-neutral-400" htmlFor="password">New Password (optional)</label>
                <input
                  id="password"
                  className="w-full p-2 rounded bg-neutral-800"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="h-1 rounded bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength >= 4 ? 'bg-emerald-600' : passwordStrength >= 2 ? 'bg-yellow-600' : 'bg-red-600'}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Quick Links</div>
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/dashboard" className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm">Dashboard</Link>
              <button
                className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
                onClick={() => {
                  localStorage.removeItem('auth_token')
                  localStorage.removeItem('auth_email')
                  navigate('/admin/login')
                }}
              >
                Logout
              </button>
            </div>
          </div>
          {loadingMe && <Spinner />}
        </Card>
      </div>
    </div>
  )
}
