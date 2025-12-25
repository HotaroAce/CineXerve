import { Router } from 'express';
export function createMoviesRouter(db) {
    const router = Router();
    router.get('/', async (_req, res) => {
        const genre = typeof _req.query.genre === 'string' ? _req.query.genre : undefined;
        const movies = genre ? db.movies.filter((m) => m.genre === genre) : db.movies;
        res.json(movies);
    });
    router.get('/:id', async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'invalid id' });
            return;
        }
        const movie = db.movies.find((m) => m.id === id);
        if (!movie) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        const showtimes = db.showtimes.filter((s) => s.movieId === id);
        res.json({ ...movie, showtimes });
    });
    router.post('/', async (req, res) => {
        const { title, genre, duration, description } = req.body;
        if (!title) {
            res.status(400).json({ error: 'title required' });
            return;
        }
        const nextId = db.nextId?.movie ?? Math.max(0, ...db.movies.map((m) => m.id)) + 1;
        db.nextId && (db.nextId.movie = nextId + 1);
        const movie = { id: nextId, title, genre, duration, description };
        db.movies.push(movie);
        res.status(201).json(movie);
    });
    router.patch('/:id', async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'invalid id' });
            return;
        }
        const movie = db.movies.find((m) => m.id === id);
        if (!movie) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        const { title, genre, duration, description } = req.body;
        if (typeof title !== 'undefined')
            movie.title = title;
        if (typeof genre !== 'undefined')
            movie.genre = genre ?? undefined;
        if (typeof duration !== 'undefined')
            movie.duration = duration ?? undefined;
        if (typeof description !== 'undefined')
            movie.description = description ?? undefined;
        res.json(movie);
    });
    router.delete('/:id', async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'invalid id' });
            return;
        }
        const movie = db.movies.find((m) => m.id === id);
        if (!movie) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        const showtimes = db.showtimes.filter((s) => s.movieId === id);
        const hasBookings = db.bookings.some((b) => showtimes.some((s) => s.id === b.showtimeId));
        if (hasBookings) {
            res.status(409).json({ error: 'cannot delete movie with existing bookings' });
            return;
        }
        const showtimeIds = new Set(showtimes.map((s) => s.id));
        db.showtimes = db.showtimes.filter((s) => s.movieId !== id);
        db.seats = db.seats.filter((seat) => !showtimeIds.has(seat.showtimeId));
        db.movies = db.movies.filter((m) => m.id !== id);
        res.json({ ok: true });
    });
    return router;
}
