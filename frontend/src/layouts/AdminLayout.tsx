import { Link, Outlet, useLocation } from 'react-router-dom'

export default function AdminLayout() {
  const location = useLocation()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur border-b border-neutral-800 transition-colors">
        <div className="p-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent transition-all hover:scale-[1.02]">CineXerve Admin</Link>
          <nav className="flex gap-2">
            <Link to="/admin/dashboard" className={`text-sm px-3 py-1 rounded transition-all duration-300 ${location.pathname.includes('/admin/dashboard') ? 'bg-purple-700' : 'bg-neutral-800 hover:bg-neutral-700 hover:-translate-y-0.5'}`}>Dashboard</Link>
            <Link to="/admin/manage/movies" className={`text-sm px-3 py-1 rounded transition-all duration-300 ${location.pathname.includes('/admin/manage/movies') ? 'bg-purple-700' : 'bg-neutral-800 hover:bg-neutral-700 hover:-translate-y-0.5'}`}>Movie</Link>
            <Link to="/admin/manage/theater" className={`text-sm px-3 py-1 rounded transition-all duration-300 ${location.pathname.includes('/admin/manage/theater') ? 'bg-purple-700' : 'bg-neutral-800 hover:bg-neutral-700 hover:-translate-y-0.5'}`}>Theater</Link>
            <Link to="/admin/reservations" className={`text-sm px-3 py-1 rounded transition-all duration-300 ${location.pathname.includes('/admin/reservations') ? 'bg-purple-700' : 'bg-neutral-800 hover:bg-neutral-700 hover:-translate-y-0.5'}`}>Reservations</Link>
            <Link to="/admin/profile" className={`text-sm px-3 py-1 rounded transition-all duration-300 ${location.pathname.includes('/admin/profile') ? 'bg-purple-700' : 'bg-neutral-800 hover:bg-neutral-700 hover:-translate-y-0.5'}`}>Profile</Link>
            <button
              className="text-sm px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              onClick={() => {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_email')
                window.location.href = '/admin/login'
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="px-4 py-6">
        <div className="w-full animate-cross-fade" key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
