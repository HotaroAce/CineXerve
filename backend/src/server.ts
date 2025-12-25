import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { SeatMap } from './structures/SeatMap.js'
import { ReservationQueue } from './structures/ReservationQueue.js'
import { createMoviesRouter } from './routes/movies.js'
import { createShowtimesRouter } from './routes/showtimes.js'
import { createBookingsRouter } from './routes/bookings.js'
import { createSeatsRouter } from './routes/seats.js'
import { createAuthRouter } from './routes/auth.js'
import bcrypt from 'bcryptjs'
import { promises as fs } from 'fs'
import path from 'path'

type Movie = {
  id: number
  title: string
  genre?: string
  duration?: number
  description?: string
  rating?: string
  formats?: string[]
}
type Showtime = { id: number; movieId: number; datetime: Date; cinema: string }
type Seat = { id: number; showtimeId: number; seatNumber: string; status: string }
type Booking = { id: number; userName: string; showtimeId: number; seatNumber: string; createdAt: Date }
type User = { id: number; email: string; name?: string | null; passwordHash: string; createdAt: Date }

type DB = {
  movies: Movie[]
  showtimes: Showtime[]
  seats: Seat[]
  bookings: Booking[]
  users: User[]
  nextId: { movie: number; showtime: number; seat: number; booking: number; user: number }
}

const db: DB = {
  movies: [],
  showtimes: [],
  seats: [],
  bookings: [],
  users: [],
  nextId: { movie: 1, showtime: 1, seat: 1, booking: 1, user: 1 },
}

const seatMap = new SeatMap()
const queue = new ReservationQueue()

function seedData() {
  const data: Omit<Movie, 'id'>[] = [
    { title: 'Moana 2', genre: 'Animation', duration: 105, description: 'Animated adventure', rating: 'PG', formats: ['2D'] },
    { title: 'Deadpool and Wolverine', genre: 'Action', duration: 125, description: 'Superhero action', rating: 'R-16', formats: ['2D', 'IMAX'] },
    { title: 'Freakier  Friday', genre: 'Comedy', duration: 110, description: 'Body-swap comedy', rating: 'PG-13', formats: ['2D'] },
    { title: 'Thunderbolts', genre: 'Action', duration: 122, description: 'Marvel ensemble', rating: 'PG-13', formats: ['2D', 'IMAX'] },
    { title: 'The Little Mermaid', genre: 'Fantasy', duration: 120, description: 'Underwater tale', rating: 'PG', formats: ['2D'] },
    { title: 'Elemental', genre: 'Animation', duration: 102, description: 'Elements collide', rating: 'PG', formats: ['2D'] },
    { title: 'Haunted Mansion', genre: 'Horror', duration: 100, description: 'Spooky fun', rating: 'PG-13', formats: ['2D'] },
    { title: 'Snow White', genre: 'Fantasy', duration: 95, description: 'Classic fairy tale', rating: 'PG', formats: ['2D'] },
    { title: 'The Fantastic Four First Steps', genre: 'Sci-Fi', duration: 118, description: 'Heroic origins', rating: 'PG-13', formats: ['2D', 'IMAX'] },
    { title: 'Elio', genre: 'Animation', duration: 98, description: 'Out-of-this-world kid', rating: 'PG', formats: ['2D'] },
    { title: 'Lilo and Stitch', genre: 'Animation', duration: 92, description: 'Ohana means family', rating: 'PG', formats: ['2D'] },
    { title: 'Tron Ares', genre: 'Sci-Fi', duration: 130, description: 'Digital frontier', rating: 'PG-13', formats: ['2D', 'IMAX'] },
    { title: 'A Goofy Movie', genre: 'Animation', duration: 90, description: 'Father-son road trip', rating: 'G', formats: ['2D'] },
    { title: 'Hoppers', genre: 'Animation', duration: 88, description: 'Adventurous critters', rating: 'PG', formats: ['2D'] },
    { title: 'Snowwhite', genre: 'Fantasy', duration: 95, description: 'Classic fairy tale', rating: 'PG', formats: ['2D'] },
    { title: 'Wish', genre: 'Animation', duration: 100, description: 'Magical wish', rating: 'PG', formats: ['2D'] },
    { title: 'Spider Man Homecoming', genre: 'Action', duration: 133, description: 'Friendly neighborhood hero', rating: 'PG-13', formats: ['2D', 'IMAX'] },
    { title: 'The Notebook', genre: 'Romance', duration: 123, description: 'Timeless love story', rating: 'PG-13', formats: ['2D'] },
    { title: 'How to Train Your Dragon', genre: 'Animation', duration: 98, description: 'Dragon friendship', rating: 'PG', formats: ['2D'] },
    { title: 'Inception', genre: 'Sci-Fi', duration: 148, description: 'Mind-bending heist', rating: 'PG-13', formats: ['2D', 'IMAX'] },
    { title: 'Jumanji', genre: 'Adventure', duration: 119, description: 'Game world adventure', rating: 'PG-13', formats: ['2D'] },
    { title: 'John Wick', genre: 'Action', duration: 101, description: 'Relentless hitman', rating: 'R-16', formats: ['2D'] },
    { title: 'Interstellar', genre: 'Sci-Fi', duration: 169, description: 'Space epic', rating: 'PG-13', formats: ['2D', 'IMAX'] },
    { title: 'Train to Busan', genre: 'Horror', duration: 118, description: 'Zombie thriller', rating: 'R-16', formats: ['2D'] },
    { title: 'Goblin', genre: 'Fantasy', duration: 120, description: 'Mystical tale', rating: 'PG-13', formats: ['2D'] },
    { title: 'The First Omen', genre: 'Horror', duration: 140, description: 'Mysterious supernatural horror', rating: 'R-16', formats: ['2D'] },
    { title: 'Zootopia 2', genre: 'Animation', duration: 168, description: 'Zootopia adventures', rating: 'PG-13', formats: ['2D'] },
  ]
  for (const m of data) {
    const movie: Movie = { id: db.nextId.movie++, ...m }
    db.movies.push(movie)
  }
  for (const movie of db.movies) {
    const showtime: Showtime = {
      id: db.nextId.showtime++,
      movieId: movie.id,
      datetime: new Date(Date.now() + 24 * 3600 * 1000),
      cinema: 'Hall 1',
    }
    db.showtimes.push(showtime)
    const rows = ['A', 'B', 'C', 'D']
    for (const r of rows) {
      for (let n = 1; n <= 10; n++) {
        const seat: Seat = { id: db.nextId.seat++, showtimeId: showtime.id, seatNumber: `${r}${n}`, status: 'available' }
        db.seats.push(seat)
        seatMap.set(showtime.id, seat.seatNumber, 'available')
      }
    }
  }
  const adminUser: User = {
    id: db.nextId.user++,
    email: 'admin@cinexerve.local',
    name: 'Admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
    createdAt: new Date(),
  }
  db.users.push(adminUser)
}

async function loadUsersFromFile() {
  try {
    const dir = path.join(process.cwd(), 'data')
    const file = path.join(dir, 'users.json')
    await fs.mkdir(dir, { recursive: true })
    const buf = await fs.readFile(file).catch(() => null)
    if (buf) {
      const arr = JSON.parse(buf.toString()) as { email: string; name?: string | null; passwordHash: string; createdAt: string }[]
      for (const u of arr) {
        const exists = db.users.find((x) => x.email === u.email)
        if (!exists) {
          const user: User = {
            id: db.nextId.user++,
            email: u.email,
            name: u.name ?? null,
            passwordHash: u.passwordHash,
            createdAt: new Date(u.createdAt),
          }
          db.users.push(user)
        }
      }
    } else {
      const admin = db.users.find((x) => x.email === 'admin@cinexerve.local')
      const initial = admin
        ? [
            {
              email: admin.email,
              name: admin.name ?? null,
              passwordHash: admin.passwordHash,
              createdAt: admin.createdAt.toISOString(),
            },
          ]
        : []
      await fs.writeFile(file, JSON.stringify(initial, null, 2), 'utf-8')
    }
  } catch (e) {
    console.error('Failed to load users from file', e)
  }
}

async function main() {
  seedData()
  await loadUsersFromFile()

  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }))

  app.use('/auth', createAuthRouter(db))
  app.use('/movies', createMoviesRouter(db))
  app.use('/showtimes', createShowtimesRouter(db))
  app.use('/seats', createSeatsRouter(db))
  app.use('/', createBookingsRouter({ db, queue, seatMap }))

  const port = process.env.PORT ? Number(process.env.PORT) : 4000
  app.listen(port, () => {
    console.log(`CineXerve API listening on http://localhost:${port}`)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
