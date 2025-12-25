import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const navigate = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    setProcessing(true)
    const r = await api.post('/auth/login', { email, password }).catch((e) => e.response)
    if (r?.status !== 200) {
      setError(r?.data?.error ?? 'Login failed')
      setProcessing(false)
      return
    }
    localStorage.setItem('auth_token', r.data.token)
    localStorage.setItem('auth_email', r.data.user.email)
    navigate('/')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="h-full">
          <div className="relative h-full rounded overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-fuchsia-800/20 to-transparent" />
            <div className="relative h-full flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <div className="text-2xl font-semibold">CineXerve</div>
                <div className="text-sm text-neutral-400">Book tickets with ease</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Login</h2>
          {error && <Alert message={error} variant="error" />}
          <form className="space-y-3" onSubmit={submit}>
            <div className="space-y-1">
              <label className="text-xs text-neutral-400" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full p-2 rounded bg-neutral-800"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-neutral-400" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="w-full p-2 rounded bg-neutral-800"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="accent-purple-600" />
                <span>Remember me</span>
              </label>
              <a href="#" className="underline">Forgot password?</a>
            </div>
            <Button type="submit" className="w-full" disabled={processing || !email || !password}>
              {processing ? 'Signing in…' : 'Login'}
            </Button>
          </form>
          <div className="text-sm text-neutral-400">
            New here?{' '}
            <Link to="/signup" className="underline text-purple-300">Create an account</Link>
          </div>
          <div className="text-sm text-neutral-400">
            Admin?{' '}
            <Link to="/admin/login" className="underline text-purple-300">Go to Admin Login</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
