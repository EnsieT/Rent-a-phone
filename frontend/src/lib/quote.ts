/**
 * Client-side mirror of the backend pricing formula (backend/src/lib/quote.ts).
 *
 * Rounding policy:
 *   - currentPriceInr   → nearest ₹100
 *   - baseDailyInr      → 2 decimal places
 *   - effectiveDailyInr → 2 decimal places
 *   - rentTotalInr      → 2 decimal places
 *   - depositInr        → same as currentPriceInr
 *   - grandTotalInr     → 2 decimal places
 *   - discountPct       → decimal fraction (0–0.30)
 */

export interface QuoteCalc {
  baseDailyInr: number
  discountPct: number
  effectiveDailyInr: number
  rentTotalInr: number
  depositInr: number
  grandTotalInr: number
}

/**
 * Compute the rental quote for a given current phone price and number of days.
 *
 * Pricing rules (mirrors backend computeQuote):
 *   base_daily       = currentPriceInr / 400
 *   discount_pct     = min(0.30, 0.02 × (days − 1))
 *   effective_daily  = base_daily × (1 − discount_pct)
 *   rent_total       = effective_daily × days
 *   deposit          = currentPriceInr
 *   grand_total      = rent_total + deposit
 */
export function calcQuote(currentPriceInr: number, days: number): QuoteCalc {
  const baseDailyInr = Math.round((currentPriceInr / 400) * 100) / 100
  // 2% discount per additional day, capped at 30%
  const discountPct = Math.min(0.3, 0.02 * (days - 1))
  const effectiveDailyInr = Math.round(baseDailyInr * (1 - discountPct) * 100) / 100
  const rentTotalInr = Math.round(effectiveDailyInr * days * 100) / 100
  const depositInr = currentPriceInr
  const grandTotalInr = Math.round((rentTotalInr + depositInr) * 100) / 100
  return { baseDailyInr, discountPct, effectiveDailyInr, rentTotalInr, depositInr, grandTotalInr }
}
