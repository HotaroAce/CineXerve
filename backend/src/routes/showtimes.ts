import { Router, type Request, type Response } from 'express'

type Movie = { id: number; title: string }
type Showtime = { id: number; movieId: number; datetime: Date; cinema: string }
type Seat = { id: number; showtimeId: number; seatNumber: string; status: string }
type Booking = { id: number; showtimeId: number }
type DB = { movies: Movie[]; showtimes: Showtime[]; seats: Seat[]; bookings: Booking[]; nextId?: { showtime: number; seat: number } }

export function createShowtimesRouter(db: DB) {
  const router = Router()

  router.get('/:movieId', async (req: Request, res: Response) => {
    const movieId = Number(req.params.movieId)
    if (Number.isNaN(movieId)) {
      res.status(400).json({ error: 'invalid movieId' })
      return
    }
    const showtimes = db.showtimes.filter((s) => s.movieId === movieId).sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
    res.json(showtimes)
  })

  router.get('/by-id/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'invalid id' })
      return
    }
    const showtime = db.showtimes.find((s) => s.id === id)
    if (!showtime) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const movie = db.movies.find((m) => m.id === showtime.movieId)
    res.json({ ...showtime, movie })
  })

  router.post('/', async (req: Request, res: Response) => {
    const { movieId, datetime, cinema } = req.body as {
      movieId?: number
      datetime?: string
      cinema?: string
    }
    const id = Number(movieId)
    if (Number.isNaN(id) || !datetime || !cinema) {
      res.status(400).json({ error: 'invalid payload' })
      return
    }
    const nextShowtimeId = (db as any).nextId?.showtime ?? Math.max(0, ...db.showtimes.map((s) => s.id)) + 1
    ;(db as any).nextId && ((db as any).nextId.showtime = nextShowtimeId + 1)
    const showtime: Showtime = { id: nextShowtimeId, movieId: id, datetime: new Date(datetime), cinema }
    db.showtimes.push(showtime)
    const rows = ['A', 'B', 'C', 'D']
    for (const r of rows) {
      for (let n = 1; n <= 10; n++) {
        const nextSeatId = (db as any).nextId?.seat ?? Math.max(0, ...db.seats.map((x) => x.id)) + 1
        ;(db as any).nextId && ((db as any).nextId.seat = nextSeatId + 1)
        const seat: Seat = { id: nextSeatId, showtimeId: showtime.id, seatNumber: `${r}${n}`, status: 'available' }
        db.seats.push(seat)
      }
    }
    res.status(201).json(showtime)
  })

  router.patch('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'invalid id' })
      return
    }
    const showtime = db.showtimes.find((s) => s.id === id)
    if (!showtime) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const { datetime, cinema } = req.body as { datetime?: string; cinema?: string }
    if (typeof datetime !== 'undefined') {
      const d = new Date(datetime)
      if (Number.isNaN(d.getTime())) {
        res.status(400).json({ error: 'invalid datetime' })
        return
      }
      showtime.datetime = d
    }
    if (typeof cinema !== 'undefined') {
      showtime.cinema = cinema
    }
    res.json(showtime)
  })

  router.delete('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'invalid id' })
      return
    }
    const showtime = db.showtimes.find((s) => s.id === id)
    if (!showtime) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const hasBookings = db.bookings.some((b) => b.showtimeId === id)
    if (hasBookings) {
      res.status(409).json({ error: 'cannot delete showtime with existing bookings' })
      return
    }
    db.seats = db.seats.filter((s) => s.showtimeId !== id)
    db.showtimes = db.showtimes.filter((s) => s.id !== id)
    res.json({ ok: true })
  })

  return router
}
