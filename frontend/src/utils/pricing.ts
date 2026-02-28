/**
 * Returns a discount percentage (0–30) that grows with number of rental days.
 * Every 30 days adds 3%, capped at 30%.
 */
export function discountPercent(daysRented: number): number {
  if (daysRented <= 0) return 0
  return Math.min(Math.floor(daysRented / 30) * 3, 30)
}

/**
 * Returns the effective daily price after applying the rental-days discount.
 */
export function discountedDailyPrice(perDayPrice: number, daysRented: number): number {
  const pct = discountPercent(daysRented)
  return perDayPrice * (1 - pct / 100)
}

/**
 * Returns true when the renter has accumulated ≥ 365 days and is eligible
 * for the rent-to-own programme.
 */
export function isRentToOwnEligible(totalDaysRented: number): boolean {
  return totalDaysRented >= 365
}

/**
 * Persist and retrieve per-phone rental day counts in localStorage.
 */
const RENTAL_HISTORY_KEY = 'rap_rental_history'

function loadHistory(): Record<number, number> {
  try {
    const raw = localStorage.getItem(RENTAL_HISTORY_KEY)
    return raw ? (JSON.parse(raw) as Record<number, number>) : {}
  } catch (err) {
    console.error('Failed to load rental history:', err)
    return {}
  }
}

export function getTotalDaysRented(phoneId: number): number {
  return loadHistory()[phoneId] ?? 0
}

export function recordRentalDays(phoneId: number, days: number): void {
  const history = loadHistory()
  history[phoneId] = (history[phoneId] ?? 0) + days
  localStorage.setItem(RENTAL_HISTORY_KEY, JSON.stringify(history))
}
