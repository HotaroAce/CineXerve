import { Router, type Request, type Response } from 'express'

type Seat = { id: number; showtimeId: number; seatNumber: string; status: string }
type DB = { seats: Seat[] }

export function createSeatsRouter(db: DB) {
  const router = Router()

  router.get('/:showtimeId', async (req: Request, res: Response) => {
    const showtimeId = Number(req.params.showtimeId)
    if (Number.isNaN(showtimeId)) {
      res.status(400).json({ error: 'invalid showtimeId' })
      return
    }
    const seats = db.seats
      .filter((s) => s.showtimeId === showtimeId)
      .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber))
    res.json(seats)
  })

  return router
}
