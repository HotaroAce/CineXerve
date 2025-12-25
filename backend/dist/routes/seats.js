import { Router } from 'express';
export function createSeatsRouter(db) {
    const router = Router();
    router.get('/:showtimeId', async (req, res) => {
        const showtimeId = Number(req.params.showtimeId);
        if (Number.isNaN(showtimeId)) {
            res.status(400).json({ error: 'invalid showtimeId' });
            return;
        }
        const seats = db.seats
            .filter((s) => s.showtimeId === showtimeId)
            .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
        res.json(seats);
    });
    return router;
}
