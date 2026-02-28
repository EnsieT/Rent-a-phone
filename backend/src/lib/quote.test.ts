import { roundTo100, currentPriceInr, computeQuote } from './quote';

describe('roundTo100', () => {
  test('rounds down to nearest 100', () => {
    expect(roundTo100(44943.75)).toBe(44900);
  });

  test('rounds up to nearest 100', () => {
    expect(roundTo100(101175)).toBe(101200);
  });

  test('exact multiple of 100 is unchanged', () => {
    expect(roundTo100(50000)).toBe(50000);
  });
});

describe('currentPriceInr', () => {
  test('iPhone 15 Pro: msrp=134900, age=1 → 101200', () => {
    // 134900 × 0.75 = 101175 → round to 100 → 101200
    expect(currentPriceInr(134900, 1)).toBe(101200);
  });

  test('iPhone 14: msrp=79900, age=2 → 44900', () => {
    // 79900 × 0.5625 = 44943.75 → round to 100 → 44900
    expect(currentPriceInr(79900, 2)).toBe(44900);
  });

  test('age=0 returns the msrp rounded to 100', () => {
    expect(currentPriceInr(50000, 0)).toBe(50000);
  });
});

describe('computeQuote', () => {
  const MSRP = 80000;
  const AGE = 0; // current_price_inr = 80000

  test('day 1 has 0% discount', () => {
    const q = computeQuote(1, MSRP, AGE, 1, 'rent');
    expect(q.discount_pct).toBe(0);
    expect(q.effective_daily_inr).toBe(q.base_daily_inr);
    expect(q.rent_total_inr).toBe(q.effective_daily_inr);
  });

  test('day 2 has 2% discount', () => {
    const q = computeQuote(1, MSRP, AGE, 2, 'rent');
    expect(q.discount_pct).toBeCloseTo(0.02);
  });

  test('discount caps at 30% from day 16 onward', () => {
    const q16 = computeQuote(1, MSRP, AGE, 16, 'rent');
    const q100 = computeQuote(1, MSRP, AGE, 100, 'rent');
    expect(q16.discount_pct).toBe(0.3);
    expect(q100.discount_pct).toBe(0.3);
  });

  test('base_daily = current_price_inr / 400', () => {
    const q = computeQuote(1, MSRP, AGE, 1, 'rent');
    expect(q.base_daily_inr).toBeCloseTo(MSRP / 400, 2);
  });

  test('effective_daily < base_daily when discount > 0', () => {
    const q = computeQuote(1, MSRP, AGE, 10, 'rent');
    expect(q.effective_daily_inr).toBeLessThan(q.base_daily_inr);
  });

  test('rent_total = effective_daily × days', () => {
    const q = computeQuote(1, MSRP, AGE, 7, 'rent');
    expect(q.rent_total_inr).toBeCloseTo(q.effective_daily_inr * 7, 1);
  });

  test('grand_total (rent) = rent_total + deposit', () => {
    const q = computeQuote(1, MSRP, AGE, 5, 'rent');
    expect(q.grand_total_inr).toBeCloseTo(q.rent_total_inr + q.deposit_inr, 2);
  });

  test('grand_total (buy) = current_price_inr', () => {
    const q = computeQuote(1, MSRP, AGE, 5, 'buy');
    expect(q.grand_total_inr).toBe(q.current_price_inr);
  });

  test('deposit = current_price_inr', () => {
    const q = computeQuote(1, MSRP, AGE, 3, 'rent');
    expect(q.deposit_inr).toBe(q.current_price_inr);
  });

  test('throws for days < 1', () => {
    expect(() => computeQuote(1, MSRP, AGE, 0, 'rent')).toThrow();
  });

  test('throws for days > 100', () => {
    expect(() => computeQuote(1, MSRP, AGE, 101, 'rent')).toThrow();
  });

  test('throws for non-integer days', () => {
    expect(() => computeQuote(1, MSRP, AGE, 1.5, 'rent')).toThrow();
  });
});
