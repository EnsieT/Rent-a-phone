import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

interface PhoneRow {
  id: number;
  price_per_day: number;
  buy_price: number;
  available: number;
  premium_only: number;
}

interface RentalRow {
  id: number;
  user_id: number;
  phone_id: number;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  deposit: number;
  created_at: string;
}

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function hasOverlap(phoneId: number, startDate: string, endDate: string, excludeId?: number): boolean {
  let query = `
    SELECT id FROM rentals
    WHERE phone_id = ?
      AND status NOT IN ('cancelled', 'completed')
      AND start_date < ?
      AND end_date > ?
  `;
  const params: unknown[] = [phoneId, endDate, startDate];

  if (excludeId !== undefined) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const row = db.prepare(query).get(...params);
  return row !== undefined;
}

router.get('/', (req: AuthRequest, res: Response): void => {
  const userId = req.user!.userId;
  const rentals = db
    .prepare(`
      SELECT r.*, p.brand, p.model, p.image_url
      FROM rentals r
      JOIN phones p ON p.id = r.phone_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `)
    .all(userId);

  res.json(rentals);
});

router.post('/', (req: AuthRequest, res: Response): void => {
  const userId = req.user!.userId;
  const { phoneId, startDate, endDate } = req.body as {
    phoneId?: number;
    startDate?: string;
    endDate?: string;
  };

  if (!phoneId || !startDate || !endDate) {
    res.status(400).json({ error: 'phoneId, startDate, and endDate are required' });
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    return;
  }

  if (end <= start) {
    res.status(400).json({ error: 'endDate must be after startDate' });
    return;
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  if (start < today) {
    res.status(400).json({ error: 'startDate cannot be in the past' });
    return;
  }

  const phone = db
    .prepare('SELECT id, price_per_day, buy_price, available, premium_only FROM phones WHERE id = ?')
    .get(phoneId) as PhoneRow | undefined;

  if (!phone) {
    res.status(404).json({ error: 'Phone not found' });
    return;
  }

  // Check membership requirement for premium-only phones
  if (phone.premium_only) {
    const user = db.prepare('SELECT is_member, membership_expiry FROM users WHERE id = ?')
      .get(userId) as { is_member: number; membership_expiry: string | null } | undefined;
    if (!user?.is_member || !user.membership_expiry || new Date(user.membership_expiry) < new Date()) {
      res.status(403).json({ error: 'This phone is available only to RentAPhone members. Please subscribe to a membership first.' });
      return;
    }
  }

  if (hasOverlap(phone.id, startDate, endDate)) {
    res.status(409).json({ error: 'Phone is already rented for the requested period' });
    return;
  }

  const days = daysBetween(startDate, endDate);
  const total_price = Math.round(days * phone.price_per_day * 100) / 100;

  // Deposit = buy_price. Members get ₹9,000 off deposit.
  const userRow = db.prepare('SELECT is_member, membership_expiry FROM users WHERE id = ?')
    .get(userId) as { is_member: number; membership_expiry: string | null } | undefined;
  const isMember = userRow?.is_member && userRow?.membership_expiry && new Date(userRow.membership_expiry) >= new Date();
  const deposit = Math.max(0, phone.buy_price - (isMember ? 9000 : 0));

  const result = db
    .prepare(`
      INSERT INTO rentals (user_id, phone_id, start_date, end_date, status, total_price, deposit)
      VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `)
    .run(userId, phone.id, startDate, endDate, total_price, deposit);

  const rental = db
    .prepare('SELECT * FROM rentals WHERE id = ?')
    .get(result.lastInsertRowid) as RentalRow;

  res.status(201).json(rental);
});

router.delete('/:id', (req: AuthRequest, res: Response): void => {
  const userId = req.user!.userId;
  const rentalId = Number(req.params.id);

  const rental = db
    .prepare('SELECT * FROM rentals WHERE id = ?')
    .get(rentalId) as RentalRow | undefined;

  if (!rental) {
    res.status(404).json({ error: 'Rental not found' });
    return;
  }

  if (rental.user_id !== userId) {
    res.status(403).json({ error: 'Not authorized to cancel this rental' });
    return;
  }

  if (rental.status === 'cancelled') {
    res.status(400).json({ error: 'Rental is already cancelled' });
    return;
  }

  if (rental.status === 'completed') {
    res.status(400).json({ error: 'Cannot cancel a completed rental' });
    return;
  }

  db.prepare("UPDATE rentals SET status = 'cancelled' WHERE id = ?").run(rentalId);

  res.json({ message: 'Rental cancelled successfully' });
});

export default router;
