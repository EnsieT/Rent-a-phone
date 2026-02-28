/**
 * Quote calculation helpers for Rent-a-Phone.
 *
 * Rounding policy:
 *   - currentPriceInr   → rounded to nearest ₹100 (roundTo100)
 *   - baseDailyInr      → rounded to 2 decimal places
 *   - effectiveDailyInr → rounded to 2 decimal places
 *   - rentTotalInr      → rounded to 2 decimal places
 *   - depositInr        → same as currentPriceInr (whole hundreds)
 *   - grandTotalInr     → rounded to 2 decimal places
 *   - discountPct       → returned as a decimal fraction (0–0.30)
 */

/** Round a number to the nearest 100. */
export function roundTo100(n: number): number {
  return Math.round(n / 100) * 100;
}

/**
 * Compute current market value of a used/refurb phone.
 * Formula: round_to_100(msrp_inr × 0.75^age_years)
 */
export function currentPriceInr(msrpInr: number, ageYears: number): number {
  return roundTo100(msrpInr * Math.pow(0.75, ageYears));
}

export interface QuoteResult {
  phone_id: number;
  days: number;
  intent: 'rent' | 'buy';
  current_price_inr: number;
  deposit_inr: number;
  base_daily_inr: number;
  /** Discount as a decimal fraction, e.g. 0.18 means 18%. */
  discount_pct: number;
  effective_daily_inr: number;
  rent_total_inr: number;
  grand_total_inr: number;
}

/**
 * Compute a full rental/purchase quote.
 *
 * Pricing rules:
 *   base_daily       = current_price_inr / 400
 *   discount_pct     = min(0.30, 0.02 × (days − 1))   (2% per extra day, capped at 30%)
 *   effective_daily  = base_daily × (1 − discount_pct)
 *   rent_total       = effective_daily × days
 *   deposit          = current_price_inr
 *   grand_total (rent) = rent_total + deposit
 *   grand_total (buy)  = current_price_inr
 *
 * @throws Error if days is outside the range 1–100.
 */
export function computeQuote(
  phoneId: number,
  msrpInr: number,
  ageYears: number,
  days: number,
  intent: 'rent' | 'buy',
): QuoteResult {
  if (!Number.isInteger(days) || days < 1 || days > 100) {
    throw new Error('days must be an integer between 1 and 100');
  }

  const current_price_inr = currentPriceInr(msrpInr, ageYears);
  const deposit_inr = current_price_inr;

  const base_daily_inr = Math.round((current_price_inr / 400) * 100) / 100;

  // 2% discount per additional day, capped at 30%
  const discount_pct = Math.min(0.3, 0.02 * (days - 1));

  const effective_daily_inr = Math.round(base_daily_inr * (1 - discount_pct) * 100) / 100;
  const rent_total_inr = Math.round(effective_daily_inr * days * 100) / 100;

  const grand_total_inr =
    intent === 'rent'
      ? Math.round((rent_total_inr + deposit_inr) * 100) / 100
      : current_price_inr;

  return {
    phone_id: phoneId,
    days,
    intent,
    current_price_inr,
    deposit_inr,
    base_daily_inr,
    discount_pct,
    effective_daily_inr,
    rent_total_inr,
    grand_total_inr,
  };
}
