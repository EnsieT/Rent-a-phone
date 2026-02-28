import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET membership status
router.get('/status', (req: AuthRequest, res: Response): void => {
  const userId = req.user!.userId;
  const user = db.prepare('SELECT is_member, membership_expiry FROM users WHERE id = ?')
    .get(userId) as { is_member: number; membership_expiry: string | null } | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const active = user.is_member === 1 && user.membership_expiry && new Date(user.membership_expiry) >= new Date();
  res.json({
    isMember: !!active,
    expiryDate: user.membership_expiry,
  });
});

// POST subscribe to membership (₹10,000 / year, fully refundable)
router.post('/subscribe', (req: AuthRequest, res: Response): void => {
  const userId = req.user!.userId;
  const user = db.prepare('SELECT is_member, membership_expiry FROM users WHERE id = ?')
    .get(userId) as { is_member: number; membership_expiry: string | null } | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (user.is_member === 1 && user.membership_expiry && new Date(user.membership_expiry) >= new Date()) {
    res.status(400).json({ error: 'You already have an active membership.' });
    return;
  }

  const startDate = new Date().toISOString().split('T')[0];
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);
  const expiryDate = expiry.toISOString().split('T')[0];

  db.prepare('UPDATE users SET is_member = 1, membership_expiry = ? WHERE id = ?')
    .run(expiryDate, userId);

  db.prepare('INSERT INTO memberships (user_id, amount, start_date, expiry_date, status) VALUES (?, 10000, ?, ?, ?)')
    .run(userId, startDate, expiryDate, 'active');

  res.status(201).json({
    isMember: true,
    expiryDate,
    message: 'Membership activated! ₹10,000 charged (fully refundable). You now get ₹9,000 off deposits and access to premium-only phones.',
  });
});

export default router;
