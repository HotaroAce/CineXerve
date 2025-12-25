import jwt from 'jsonwebtoken';
export function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        res.status(401).json({ error: 'unauthorized' });
        return;
    }
    const token = auth.slice('Bearer '.length);
    try {
        const secret = process.env.JWT_SECRET || 'dev-secret';
        const payload = jwt.verify(token, secret);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ error: 'unauthorized' });
    }
}
