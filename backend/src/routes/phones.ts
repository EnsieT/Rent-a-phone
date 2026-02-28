import { Router, Request, Response } from 'express';
import db from '../db';
import { currentPriceInr } from '../lib/quote';

const router = Router();

interface PhoneRow {
  id: number;
  brand: string;
  model: string;
  description: string;
  price_per_day: number;
  image_url: string;
  available: number;
  created_at: string;
  msrp_inr: number;
  age_years: number;
}

function toResponse(phone: PhoneRow) {
  return { ...phone, current_price_inr: currentPriceInr(phone.msrp_inr, phone.age_years) };
}

router.get('/', (req: Request, res: Response): void => {
  const { available } = req.query;

  let query = 'SELECT * FROM phones';

  if (available === 'true') {
    query += ' WHERE available = 1';
  } else if (available === 'false') {
    query += ' WHERE available = 0';
  }

  query += ' ORDER BY brand, model';

  const phones = db.prepare(query).all() as PhoneRow[];
  res.json(phones.map(toResponse));
});

router.get('/:id', (req: Request, res: Response): void => {
  const phone = db
    .prepare('SELECT * FROM phones WHERE id = ?')
    .get(req.params.id) as PhoneRow | undefined;

  if (!phone) {
    res.status(404).json({ error: 'Phone not found' });
    return;
  }

  res.json(toResponse(phone));
});

export default router;
