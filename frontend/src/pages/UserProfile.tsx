import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'

type Me = { id: number; email: string; name?: string | null }
type Booking = { id: number; userName: string; seatNumber: string; createdAt: string; showtimeId: number; movieTitle?: string; cinema?: string; datetime?: string }

export default function UserProfile() {
  const [me, setMe] = useState<Me | null>(null)
  const [name, setName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingMe, setLoadingMe] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [search, setSearch] = useState<string>('')
  const [avatarInitials, setAvatarInitials] = useState<string>(() => localStorage.getItem('avatar_initials_override') ?? '')
  const navigate = useNavigate()

  useEffect(() => {
    setError(null)
    setLoadingMe(true)
    api.get('/auth/me').then((r) => {
      setMe(r.data)
      setName(r.data.name ?? '')
    }).catch((e) => {
      if (e?.response?.status === 401) {
        navigate('/login')
      } else {
        setError('Failed to load profile')
      }
    }).finally(() => setLoadingMe(false))
  }, [])
  useEffect(() => {
    setLoadingBookings(true)
    api.get('/history/me').then((r) => setBookings(r.data)).catch(() => setBookings([])).finally(() => setLoadingBookings(false))
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
  const totalBookings = bookings.length
  const lastBooking = bookings[0]?.createdAt ? new Date(bookings[0].createdAt).toLocaleString() : null
  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return bookings
    return bookings.filter((b) => (b.movieTitle ?? '').toLowerCase().includes(q) || (b.cinema ?? '').toLowerCase().includes(q))
  }, [bookings, search])
  const canSave = useMemo(() => {
    const currentName = me?.name ?? ''
    return (name.trim() !== currentName) || password.length > 0
  }, [name, password, me])
  const strength = useMemo(() => {
    const s = password
    let score = 0
    if (s.length >= 8) score++
    if (/[A-Z]/.test(s)) score++
    if (/[a-z]/.test(s)) score++
    if (/[0-9]/.test(s)) score++
    if (/[^A-Za-z0-9]/.test(s)) score++
    return score
  }, [password])
  const strengthLabel = strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong'
  const avatarDisplay = (avatarInitials.trim().slice(0, 2).toUpperCase()) || initials || 'U'
  function exportCSV() {
    const rows = [['Movie', 'Datetime', 'Cinema', 'Seat']]
    for (const b of bookings) {
      rows.push([
        b.movieTitle ?? '',
        b.datetime ? new Date(b.datetime).toLocaleString() : '',
        b.cinema ?? '',
        b.seatNumber,
      ])
    }
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bookings.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <Card className="flex items-center gap-4">
          {loadingMe ? (
            <>
              <div className="w-16 h-16 rounded-full bg-neutral-800 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-1/3 bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-neutral-800 rounded animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-lg font-semibold">
                {avatarDisplay}
              </div>
              <div className="space-y-1">
                <div className="text-xl font-semibold">{me?.name || me?.email || 'Your Account'}</div>
                <div className="text-sm text-neutral-400">Manage your account details and view recent bookings</div>
              </div>
            </>
          )}
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            {loadingBookings ? (
              <>
                <div className="h-3 w-24 bg-neutral-800 rounded animate-pulse" />
                <div className="h-6 w-12 bg-neutral-800 rounded animate-pulse mt-2" />
              </>
            ) : (
              <>
                <div className="text-xs text-neutral-400">Total Bookings</div>
                <div className="text-xl font-semibold">{totalBookings}</div>
              </>
            )}
          </Card>
          <Card>
            {loadingBookings ? (
              <>
                <div className="h-3 w-24 bg-neutral-800 rounded animate-pulse" />
                <div className="h-6 w-32 bg-neutral-800 rounded animate-pulse mt-2" />
              </>
            ) : (
              <>
                <div className="text-xs text-neutral-400">Last Booking</div>
                <div className="text-xl font-semibold">{lastBooking ?? '—'}</div>
              </>
            )}
          </Card>
          <Card>
            {loadingMe ? (
              <>
                <div className="h-3 w-16 bg-neutral-800 rounded animate-pulse" />
                <div className="h-6 w-40 bg-neutral-800 rounded animate-pulse mt-2" />
              </>
            ) : (
              <>
                <div className="text-xs text-neutral-400">Email</div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-semibold">{me?.email ?? '—'}</div>
                  {me?.email && (
                    <button
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs"
                      onClick={() => navigator.clipboard?.writeText(me.email)}
                    >
                      Copy
                    </button>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
        <Card className="space-y-3">
          <div className="text-lg font-semibold">Recent Bookings</div>
          <div className="flex gap-2">
            <input
              className="w-full p-2 rounded bg-neutral-800"
              placeholder="Search by movie or cinema"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" onClick={exportCSV}>Export CSV</Button>
          </div>
          <div className="space-y-2">
            {loadingBookings && (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-64 bg-neutral-800 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-16 bg-neutral-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            )}
            {!loadingBookings && filteredBookings.slice(0, 6).map((b) => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="text-sm">{b.movieTitle} • {new Date(b.datetime ?? '').toLocaleString()} • {b.cinema}</div>
                <div className="text-sm">Seat {b.seatNumber}</div>
              </div>
            ))}
            {!loadingBookings && bookings.length === 0 && <div className="text-sm text-neutral-400">No recent bookings</div>}
          </div>
          <div>
            <Link to="/history/me" className="text-sm underline">View all bookings</Link>
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
                <div className="text-xs text-neutral-400">Password strength {strengthLabel}</div>
                <div className="h-1 bg-neutral-800 rounded">
                  <div
                    className={`h-1 rounded ${strength <= 2 ? 'bg-red-600' : strength <= 4 ? 'bg-yellow-500' : 'bg-emerald-600'}`}
                    style={{ width: `${Math.min(strength, 5) * 20}%` }}
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
            <div className="space-y-1">
              <label className="text-xs text-neutral-400" htmlFor="avatar">Avatar initials (optional)</label>
              <div className="flex items-center gap-2">
                <input
                  id="avatar"
                  className="w-full p-2 rounded bg-neutral-800"
                  placeholder="e.g. JD"
                  value={avatarInitials}
                  onChange={(e) => setAvatarInitials(e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    const val = avatarInitials.trim().slice(0, 2).toUpperCase()
                    if (val) {
                      localStorage.setItem('avatar_initials_override', val)
                      setAvatarInitials(val)
                      setStatus('Avatar updated')
                    }
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    localStorage.removeItem('avatar_initials_override')
                    setAvatarInitials('')
                    setStatus('Avatar reset')
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={processing || !canSave}>
              {processing ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Quick Links</div>
            <div className="flex flex-wrap gap-2">
              <Link to="/history/me" className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm">My Bookings</Link>
              <button
                className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
                onClick={() => {
                  localStorage.removeItem('auth_token')
                  localStorage.removeItem('auth_email')
                  navigate('/login')
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
