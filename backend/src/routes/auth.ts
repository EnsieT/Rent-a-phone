import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';
const SALT_ROUNDS = 10;

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: 'name, email, and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  try {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = db
      .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(name, email, password_hash);

    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(result.lastInsertRowid) as Omit<UserRow, 'password_hash'>;

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const row = db
    .prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?')
    .get(email) as UserRow | undefined;

  if (!row) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  try {
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: row.id, email: row.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const { password_hash: _ph, ...user } = row;
    res.json({ token, user });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
