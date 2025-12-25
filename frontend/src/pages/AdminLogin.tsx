import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const r = await api.post('/auth/login', { email, password }).catch((e) => e.response)
    if (r?.status !== 200) {
      setError(r?.data?.error ?? 'Login failed')
      return
    }
    localStorage.setItem('auth_token', r.data.token)
    localStorage.setItem('auth_email', r.data.user.email)
    navigate('/admin/dashboard')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <Card className="h-full flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-2xl font-semibold">CineXerve Admin</div>
            <div className="text-sm text-neutral-400">Manage movies, showtimes, and reservations</div>
          </div>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Admin Login</h2>
          {error && <Alert message={error} variant="error" />}
          <form className="space-y-3" onSubmit={submit}>
            <input className="w-full p-2 rounded bg-neutral-800" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex items-center gap-2">
              <input
                className="w-full p-2 rounded bg-neutral-800"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <div className="text-sm text-neutral-400">
            User?{' '}
            <Link to="/login" className="underline text-purple-300">Go to User Login</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
