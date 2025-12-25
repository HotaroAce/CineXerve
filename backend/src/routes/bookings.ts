import { Router, type Request, type Response } from 'express'
import { ReservationQueue, type ReservationRequest } from '../structures/ReservationQueue.js'
import { SeatMap, type SeatStatus } from '../structures/SeatMap.js'
import { requireAuth } from '../middleware/auth.js'

type Deps = {
  db: {
    bookings: { id: number; userName: string; showtimeId: number; seatNumber: string; createdAt: Date }[]
    seats: { id: number; showtimeId: number; seatNumber: string; status: string }[]
    showtimes: { id: number; movieId: number; datetime: Date; cinema: string }[]
    movies: { id: number; title: string }[]
    nextId?: { booking: number }
  }
  queue: ReservationQueue
  seatMap: SeatMap
}

export function createBookingsRouter({ db, queue, seatMap }: Deps) {
  const router = Router()
  let processing = false

  async function processQueue() {
    if (processing) return
    processing = true
    try {
      while (!queue.isEmpty()) {
        const item = queue.dequeue()
        if (!item) continue
        const { userName, showtimeId, seatNumber } = item.request
        try {
          const seat = db.seats.find((s) => s.showtimeId === showtimeId && s.seatNumber === seatNumber)
          if (!seat) throw new Error('seat not found')
          if (seat.status !== 'available') throw new Error('seat not available')
          seat.status = 'reserved'
          const nextBookingId = (db as any).nextId?.booking ?? Math.max(0, ...db.bookings.map((b) => b.id)) + 1
          ;(db as any).nextId && ((db as any).nextId.booking = nextBookingId + 1)
          const booking = { id: nextBookingId, userName, showtimeId, seatNumber, createdAt: new Date() }
          db.bookings.push(booking)
          const status: SeatStatus = seat.status as SeatStatus
          seatMap.set(showtimeId, seatNumber, status)
          const result = { bookingId: booking.id }
          item.resolve(result)
        } catch (err) {
          item.reject(err)
        }
      }
    } finally {
      processing = false
    }
  }

  router.post('/book', requireAuth, async (req: Request, res: Response) => {
    const { userName, showtimeId, seatNumber } = req.body as ReservationRequest
    const id = Number(showtimeId)
    const authUser = (req as any).user as { email?: string }
    const finalUser = authUser?.email ?? userName
    if (!finalUser || !seatNumber || Number.isNaN(id)) {
      res.status(400).json({ error: 'invalid payload' })
      return
    }
    const status = seatMap.get(id, seatNumber)
    if (status && status !== 'available') {
      res.status(409).json({ error: 'seat already reserved' })
      return
    }
    const promise = new Promise<{ bookingId: number }>((resolve, reject) => {
      queue.enqueue({ request: { userName: finalUser, showtimeId: id, seatNumber }, resolve, reject })
    })
    processQueue()
    try {
      const result = await promise
      res.json(result)
    } catch (err: any) {
      res.status(409).json({ error: err?.message ?? 'reservation failed' })
    }
  })

  router.delete('/cancel/:bookingId', requireAuth, async (req: Request, res: Response) => {
    const bookingId = Number(req.params.bookingId)
    if (Number.isNaN(bookingId)) {
      res.status(400).json({ error: 'invalid bookingId' })
      return
    }
    const booking = db.bookings.find((b) => b.id === bookingId)
    if (!booking) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const seat = db.seats.find((s) => s.showtimeId === booking.showtimeId && s.seatNumber === booking.seatNumber)
    if (seat) {
      seat.status = 'available'
      seatMap.set(booking.showtimeId, booking.seatNumber, 'available')
    }
    db.bookings = db.bookings.filter((b) => b.id !== bookingId)
    res.json({ ok: true })
  })

  router.get('/history/me', requireAuth, async (req: Request, res: Response) => {
    const authUser = (req as any).user as { email?: string }
    const userName = authUser?.email ?? ''
    if (!userName) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }
    const bookings = db.bookings.filter((b) => b.userName === userName).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    res.json(
      bookings.map((b) => ({
        id: b.id,
        userName: b.userName,
        seatNumber: b.seatNumber,
        createdAt: b.createdAt,
        showtimeId: b.showtimeId,
        movieTitle: db.movies.find((m) => m.id === db.showtimes.find((s) => s.id === b.showtimeId)?.movieId)?.title,
        cinema: db.showtimes.find((s) => s.id === b.showtimeId)?.cinema,
        datetime: db.showtimes.find((s) => s.id === b.showtimeId)?.datetime,
      })),
    )
  })

  router.get('/history/:user', async (req: Request, res: Response) => {
    const userName = req.params.user
    const bookings = db.bookings.filter((b) => b.userName === userName).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    res.json(
      bookings.map((b) => ({
        id: b.id,
        userName: b.userName,
        seatNumber: b.seatNumber,
        createdAt: b.createdAt,
        showtimeId: b.showtimeId,
        movieTitle: db.movies.find((m) => m.id === db.showtimes.find((s) => s.id === b.showtimeId)?.movieId)?.title,
        cinema: db.showtimes.find((s) => s.id === b.showtimeId)?.cinema,
        datetime: db.showtimes.find((s) => s.id === b.showtimeId)?.datetime,
      })),
    )
  })
  router.get('/reservations', async (_req: Request, res: Response) => {
    const bookings = db.bookings.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    res.json(
      bookings.map((b) => ({
        id: b.id,
        userName: b.userName,
        seatNumber: b.seatNumber,
        createdAt: b.createdAt,
        showtimeId: b.showtimeId,
        movieTitle: db.movies.find((m) => m.id === db.showtimes.find((s) => s.id === b.showtimeId)?.movieId)?.title,
        cinema: db.showtimes.find((s) => s.id === b.showtimeId)?.cinema,
        datetime: db.showtimes.find((s) => s.id === b.showtimeId)?.datetime,
      })),
    )
  })

  return router
}
