import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function RequireAuth() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
