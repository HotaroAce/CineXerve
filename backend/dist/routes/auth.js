import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth.js';
import { promises as fs } from 'fs';
import path from 'path';
export function createAuthRouter(db) {
    const router = Router();
    const dir = path.join(process.cwd(), 'data');
    const file = path.join(dir, 'users.json');
    async function persistUsers() {
        try {
            await fs.mkdir(dir, { recursive: true });
            const payload = db.users.map((u) => ({
                email: u.email,
                name: u.name ?? null,
                passwordHash: u.passwordHash,
                createdAt: u.createdAt.toISOString(),
            }));
            await fs.writeFile(file, JSON.stringify(payload, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to persist users', e);
        }
    }
    router.post('/signup', async (req, res) => {
        const { email, password, name } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'email and password required' });
            return;
        }
        const exists = db.users.find((u) => u.email === email);
        if (exists) {
            res.status(409).json({ error: 'email already exists' });
            return;
        }
        const hash = await bcrypt.hash(password, 10);
        const nextUserId = db.nextId?.user ?? Math.max(0, ...db.users.map((u) => u.id)) + 1;
        db.nextId && (db.nextId.user = nextUserId + 1);
        const user = { id: nextUserId, email, passwordHash: hash, name: name ?? null, createdAt: new Date() };
        db.users.push(user);
        await persistUsers();
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    });
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'email and password required' });
            return;
        }
        const user = db.users.find((u) => u.email === email);
        if (!user) {
            res.status(401).json({ error: 'invalid credentials' });
            return;
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            res.status(401).json({ error: 'invalid credentials' });
            return;
        }
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    });
    router.get('/me', requireAuth, async (req, res) => {
        const auth = req.user;
        const user = db.users.find((u) => u.email === auth.email);
        if (!user) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        res.json({ id: user.id, email: user.email, name: user.name });
    });
    router.patch('/me', requireAuth, async (req, res) => {
        const auth = req.user;
        const { name, password } = req.body;
        const user = db.users.find((u) => u.email === auth.email);
        if (!user) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        if (typeof name !== 'undefined') {
            user.name = name ?? null;
        }
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            user.passwordHash = hash;
        }
        await persistUsers();
        res.json({ id: user.id, email: user.email, name: user.name });
    });
    return router;
}
