import { Router } from 'express';
export function createShowtimesRouter(db) {
    const router = Router();
    router.get('/:movieId', async (req, res) => {
        const movieId = Number(req.params.movieId);
        if (Number.isNaN(movieId)) {
            res.status(400).json({ error: 'invalid movieId' });
            return;
        }
        const showtimes = db.showtimes.filter((s) => s.movieId === movieId).sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
        res.json(showtimes);
    });
    router.get('/by-id/:id', async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'invalid id' });
            return;
        }
        const showtime = db.showtimes.find((s) => s.id === id);
        if (!showtime) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        const movie = db.movies.find((m) => m.id === showtime.movieId);
        res.json({ ...showtime, movie });
    });
    router.post('/', async (req, res) => {
        const { movieId, datetime, cinema } = req.body;
        const id = Number(movieId);
        if (Number.isNaN(id) || !datetime || !cinema) {
            res.status(400).json({ error: 'invalid payload' });
            return;
        }
        const nextShowtimeId = db.nextId?.showtime ?? Math.max(0, ...db.showtimes.map((s) => s.id)) + 1;
        db.nextId && (db.nextId.showtime = nextShowtimeId + 1);
        const showtime = { id: nextShowtimeId, movieId: id, datetime: new Date(datetime), cinema };
        db.showtimes.push(showtime);
        const rows = ['A', 'B', 'C', 'D'];
        for (const r of rows) {
            for (let n = 1; n <= 10; n++) {
                const nextSeatId = db.nextId?.seat ?? Math.max(0, ...db.seats.map((x) => x.id)) + 1;
                db.nextId && (db.nextId.seat = nextSeatId + 1);
                const seat = { id: nextSeatId, showtimeId: showtime.id, seatNumber: `${r}${n}`, status: 'available' };
                db.seats.push(seat);
            }
        }
        res.status(201).json(showtime);
    });
    router.patch('/:id', async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'invalid id' });
            return;
        }
        const showtime = db.showtimes.find((s) => s.id === id);
        if (!showtime) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        const { datetime, cinema } = req.body;
        if (typeof datetime !== 'undefined') {
            const d = new Date(datetime);
            if (Number.isNaN(d.getTime())) {
                res.status(400).json({ error: 'invalid datetime' });
                return;
            }
            showtime.datetime = d;
        }
        if (typeof cinema !== 'undefined') {
            showtime.cinema = cinema;
        }
        res.json(showtime);
    });
    router.delete('/:id', async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'invalid id' });
            return;
        }
        const showtime = db.showtimes.find((s) => s.id === id);
        if (!showtime) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        const hasBookings = db.bookings.some((b) => b.showtimeId === id);
        if (hasBookings) {
            res.status(409).json({ error: 'cannot delete showtime with existing bookings' });
            return;
        }
        db.seats = db.seats.filter((s) => s.showtimeId !== id);
        db.showtimes = db.showtimes.filter((s) => s.id !== id);
        res.json({ ok: true });
    });
    return router;
}
