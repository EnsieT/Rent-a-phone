import { Router, Request, Response } from 'express';
import db from '../db';
import { computeQuote } from '../lib/quote';

const router = Router();

interface PhoneRow {
  id: number;
  msrp_inr: number;
  age_years: number;
}

/**
 * GET /api/quote?phone_id=<id>&days=<n>&intent=rent|buy
 *
 * Returns a full price breakdown for renting or buying the specified phone.
 * Does not require authentication.
 */
router.get('/', (req: Request, res: Response): void => {
  const phoneId = Number(req.query.phone_id);
  const days = Number(req.query.days);
  const intent = (req.query.intent as string) ?? 'rent';

  if (!phoneId || isNaN(phoneId)) {
    res.status(400).json({ error: 'phone_id is required and must be a number' });
    return;
  }

  if (isNaN(days) || req.query.days === undefined) {
    res.status(400).json({ error: 'days is required and must be a number' });
    return;
  }

  if (intent !== 'rent' && intent !== 'buy') {
    res.status(400).json({ error: 'intent must be "rent" or "buy"' });
    return;
  }

  const phone = db
    .prepare('SELECT id, msrp_inr, age_years FROM phones WHERE id = ?')
    .get(phoneId) as PhoneRow | undefined;

  if (!phone) {
    res.status(404).json({ error: 'Phone not found' });
    return;
  }

  try {
    const quote = computeQuote(phone.id, phone.msrp_inr, phone.age_years, days, intent);
    res.json(quote);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    res.status(400).json({ error: message });
  }
});

export default router;
