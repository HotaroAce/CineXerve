import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

type JwtPayload = { id: number; email: string }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  const token = auth.slice('Bearer '.length)
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret'
    const payload = jwt.verify(token, secret) as JwtPayload
    ;(req as any).user = payload
    next()
  } catch {
    res.status(401).json({ error: 'unauthorized' })
  }
}
