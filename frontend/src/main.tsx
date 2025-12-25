import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import Movie from './pages/Movie'
import Seats from './pages/Seats'
import History from './pages/History'
import AdminAddMovie from './pages/AdminAddMovie'
import AdminAddShowtime from './pages/AdminAddShowtime'
import AdminReservations from './pages/AdminReservations'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BookingDetails from './pages/BookingDetails'
import Checkout from './pages/Checkout'
import VerifyPayment from './pages/VerifyPayment'
import Ticket from './pages/Ticket'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminManageMovies from './pages/AdminManageMovies'
import AdminManageTheater from './pages/AdminManageTheater'
import RequireAuth from './components/RequireAuth'
import AdminLayout from './layouts/AdminLayout'
import UserProfile from './pages/UserProfile'
import AdminProfile from './pages/AdminProfile'
import Footer from './components/Footer'

function Layout() {
  const location = useLocation()
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/admin/login'
  const isAdminPage = location.pathname.startsWith('/admin')
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur border-b border-neutral-800 transition-colors">
        <div className="p-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent transition-all hover:scale-[1.02]">
            CineXerve
          </Link>
          <nav className="flex gap-2">
            {isAuthPage || isAdminPage ? null : token ? (
              <>
                <Link to="/" className={`text-sm px-3 py-1 rounded transition-all duration-300 ${location.pathname === '/' ? 'bg-purple-700' : 'bg-neutral-800 hover:bg-neutral-700 hover:-translate-y-0.5'}`}>Home</Link>
                <Link to="/history/demo" className={`text-sm px-3 py-1 rounded transition-all duration-300 ${location.pathname.startsWith('/history') ? 'bg-purple-700' : 'bg-neutral-800 hover:bg-neutral-700 hover:-translate-y-0.5'}`}>History</Link>
                <Link to="/profile" className={`text-sm px-3 py-1 rounded transition-all duration-300 ${location.pathname.startsWith('/profile') ? 'bg-purple-700' : 'bg-neutral-800 hover:bg-neutral-700 hover:-translate-y-0.5'}`}>Profile</Link>
                <button
                  className="text-sm px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  onClick={() => {
                    localStorage.removeItem('auth_token')
                    localStorage.removeItem('auth_email')
                    window.location.href = '/login'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="text-sm px-3 py-1 rounded bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 transition-all duration-300 hover:-translate-y-0.5 text-white">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="px-4 py-6 flex-1">
        <div className="w-full animate-cross-fade" key={location.pathname}>
          <Routes>
            <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
            <Route path="/movie/:id" element={<Movie />} />
            <Route element={<RequireAuth />}>
              <Route path="/seats/:showtimeId" element={<Seats />} />
              <Route path="/history/:user" element={<History />} />
              <Route path="/booking-details" element={<BookingDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/verify" element={<VerifyPayment />} />
              <Route path="/ticket" element={<Ticket />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route element={<RequireAuth />}>
                <Route path="add-movie" element={<AdminAddMovie />} />
                <Route path="add-showtime" element={<AdminAddShowtime />} />
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="manage/movies" element={<AdminManageMovies />} />
                <Route path="manage/theater" element={<AdminManageTheater />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </React.StrictMode>,
)
