import { Router, type Request, type Response } from 'express'

type Movie = { id: number; title: string; genre?: string; duration?: number; description?: string }
type Showtime = { id: number; movieId: number; datetime: Date; cinema: string }
type Seat = { id: number; showtimeId: number; seatNumber: string; status: string }
type Booking = { id: number; showtimeId: number }
type DB = { movies: Movie[]; showtimes: Showtime[]; seats: Seat[]; bookings: Booking[] }

export function createMoviesRouter(db: DB) {
  const router = Router()

  router.get('/', async (_req: Request, res: Response) => {
    const genre = typeof _req.query.genre === 'string' ? _req.query.genre : undefined
    const movies = genre ? db.movies.filter((m) => m.genre === genre) : db.movies
    res.json(movies)
  })

  router.get('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'invalid id' })
      return
    }
    const movie = db.movies.find((m) => m.id === id)
    if (!movie) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const showtimes = db.showtimes.filter((s) => s.movieId === id)
    res.json({ ...movie, showtimes })
  })

  router.post('/', async (req: Request, res: Response) => {
    const { title, genre, duration, description } = req.body as {
      title?: string
      genre?: string
      duration?: number
      description?: string
    }
    if (!title) {
      res.status(400).json({ error: 'title required' })
      return
    }
    const nextId = (db as any).nextId?.movie ?? Math.max(0, ...db.movies.map((m) => m.id)) + 1
    ;(db as any).nextId && ((db as any).nextId.movie = nextId + 1)
    const movie: Movie = { id: nextId, title, genre, duration, description }
    db.movies.push(movie)
    res.status(201).json(movie)
  })

  router.patch('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'invalid id' })
      return
    }
    const movie = db.movies.find((m) => m.id === id)
    if (!movie) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const { title, genre, duration, description } = req.body as {
      title?: string
      genre?: string | null
      duration?: number | null
      description?: string | null
    }
    if (typeof title !== 'undefined') movie.title = title
    if (typeof genre !== 'undefined') movie.genre = genre ?? undefined
    if (typeof duration !== 'undefined') movie.duration = duration ?? undefined
    if (typeof description !== 'undefined') movie.description = description ?? undefined
    res.json(movie)
  })

  router.delete('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'invalid id' })
      return
    }
    const movie = db.movies.find((m) => m.id === id)
    if (!movie) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const showtimes = db.showtimes.filter((s) => s.movieId === id)
    const hasBookings = db.bookings.some((b) => showtimes.some((s) => s.id === b.showtimeId))
    if (hasBookings) {
      res.status(409).json({ error: 'cannot delete movie with existing bookings' })
      return
    }
    const showtimeIds = new Set(showtimes.map((s) => s.id))
    db.showtimes = db.showtimes.filter((s) => s.movieId !== id)
    db.seats = db.seats.filter((seat) => !showtimeIds.has(seat.showtimeId))
    db.movies = db.movies.filter((m) => m.id !== id)
    res.json({ ok: true })
  })

  return router
}
