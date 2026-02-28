export type Tier = 'budget' | 'mid-tier' | 'premium'
export type Condition = 'Mint' | 'Like New' | 'Good' | 'Fair'

export const CONDITION_FACTORS: Record<Condition, number> = {
  Mint: 0.85,
  'Like New': 0.80,
  Good: 0.65,
  Fair: 0.50,
}

export interface CatalogPhone {
  id: number
  brand: string
  model: string
  description: string
  tier: Tier
  imagePath: string
  ram: string
  storage: string
  os: string
  condition: Condition
  mrp: number
  buyPrice: number
  perDayPrice: number
  available: boolean
  premiumOnly: boolean
}

function calcPrices(mrp: number, condition: Condition) {
  const buyPrice = Math.round(mrp * CONDITION_FACTORS[condition])
  const perDayPrice = Math.round(buyPrice / 400)
  return { buyPrice, perDayPrice }
}

export const TIER_LABELS: Record<Tier, string> = {
  budget: 'Budget',
  'mid-tier': 'Mid-Tier',
  premium: 'Premium',
}

export const TIER_ORDER: Tier[] = ['budget', 'mid-tier', 'premium']

// Raw data — prices are computed from MRP × condition factor
// Images sourced from GSMArena for accurate phone photos
const RAW_CATALOG: Omit<CatalogPhone, 'buyPrice' | 'perDayPrice'>[] = [
  // ═══════════════ PREMIUM (MRP ₹50,000+) ═══════════════
  { id: 1, brand: 'Apple', model: 'iPhone 15 Pro Max', description: "Apple's ultimate flagship — A17 Pro chip, titanium build, 5× optical zoom, and ProRes 4K video.", tier: 'premium', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg', ram: '8 GB', storage: '512 GB', os: 'iOS 17', condition: 'Mint', mrp: 159900, available: true, premiumOnly: true },
  { id: 2, brand: 'Apple', model: 'iPhone 15 Pro', description: 'Titanium design, A17 Pro chip, Action button, and 48 MP camera system with 3× zoom.', tier: 'premium', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg', ram: '8 GB', storage: '256 GB', os: 'iOS 17', condition: 'Mint', mrp: 134900, available: true, premiumOnly: true },
  { id: 3, brand: 'Samsung', model: 'Galaxy S24 Ultra', description: "Samsung's best with built-in S Pen, 200 MP camera, Snapdragon 8 Gen 3, and Galaxy AI.", tier: 'premium', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg', ram: '12 GB', storage: '256 GB', os: 'Android 14 (One UI 6.1)', condition: 'Mint', mrp: 129999, available: true, premiumOnly: true },
  { id: 4, brand: 'Samsung', model: 'Galaxy Z Fold 5', description: 'Foldable flagship with 7.6" inner display, Snapdragon 8 Gen 2, and Flex Mode cameras.', tier: 'premium', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg', ram: '12 GB', storage: '256 GB', os: 'Android 13 (One UI 5.1.1)', condition: 'Like New', mrp: 154999, available: true, premiumOnly: true },
  { id: 5, brand: 'Samsung', model: 'Galaxy Z Flip 5', description: 'Compact foldable with 3.4" cover display, Snapdragon 8 Gen 2, and FlexCam selfies.', tier: 'premium', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg', ram: '8 GB', storage: '256 GB', os: 'Android 13 (One UI 5.1.1)', condition: 'Like New', mrp: 99999, available: true, premiumOnly: false },
  { id: 6, brand: 'Google', model: 'Pixel 8 Pro', description: "Google's flagship with Tensor G3, advanced AI photo features, and 7 years of updates.", tier: 'premium', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro-new.jpg', ram: '12 GB', storage: '256 GB', os: 'Android 14', condition: 'Mint', mrp: 106999, available: true, premiumOnly: false },
  { id: 7, brand: 'OnePlus', model: 'OnePlus 12', description: 'Flagship killer — Snapdragon 8 Gen 3, 100W SUPERVOOC, Hasselblad camera, and 2K display.', tier: 'premium', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg', ram: '16 GB', storage: '256 GB', os: 'Android 14 (OxygenOS 14)', condition: 'Like New', mrp: 69999, available: true, premiumOnly: false },
  { id: 8, brand: 'Apple', model: 'iPhone 15', description: 'Dynamic Island, 48 MP camera, USB-C, A16 Bionic chip, and all-day battery life.', tier: 'premium', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg', ram: '6 GB', storage: '128 GB', os: 'iOS 17', condition: 'Like New', mrp: 79900, available: true, premiumOnly: false },
  { id: 9, brand: 'Vivo', model: 'X100 Pro', description: 'Zeiss optics, Dimensity 9300, 4nm chip, 100W charging, and AMOLED 120Hz display.', tier: 'premium', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg', ram: '16 GB', storage: '256 GB', os: 'Android 14 (Funtouch 14)', condition: 'Mint', mrp: 89999, available: true, premiumOnly: false },
  { id: 10, brand: 'Xiaomi', model: 'Xiaomi 14', description: 'Leica optics, Snapdragon 8 Gen 3, 75W HyperCharge, and compact 6.36" LTPO display.', tier: 'premium', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14.jpg', ram: '12 GB', storage: '256 GB', os: 'Android 14 (HyperOS)', condition: 'Like New', mrp: 69999, available: true, premiumOnly: false },

  // ═══════════════ MID-TIER (MRP ₹20,000 – ₹50,000) ═══════════════
  { id: 11, brand: 'Apple', model: 'iPhone 14', description: 'Reliable performer with A15 Bionic, great dual cameras, and all-day battery life.', tier: 'mid-tier', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg', ram: '6 GB', storage: '128 GB', os: 'iOS 16', condition: 'Like New', mrp: 49900, available: true, premiumOnly: false },
  { id: 12, brand: 'Samsung', model: 'Galaxy A54 5G', description: 'Super AMOLED 120Hz, 50 MP OIS camera, 5000 mAh battery, IP67 water resistance.', tier: 'mid-tier', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54-5g.jpg', ram: '8 GB', storage: '128 GB', os: 'Android 13 (One UI 5.1)', condition: 'Like New', mrp: 38999, available: true, premiumOnly: false },
  { id: 13, brand: 'Google', model: 'Pixel 7a', description: 'Affordable Pixel — Tensor G2, excellent cameras, pure Android, and 5 years of updates.', tier: 'mid-tier', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg', ram: '8 GB', storage: '128 GB', os: 'Android 13', condition: 'Like New', mrp: 31999, available: true, premiumOnly: false },
  { id: 14, brand: 'OnePlus', model: 'OnePlus Nord 3 5G', description: 'Dimensity 9000, 80W SUPERVOOC, 50 MP Sony IMX890, and 6.74" AMOLED 120Hz display.', tier: 'mid-tier', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3.jpg', ram: '16 GB', storage: '256 GB', os: 'Android 13 (OxygenOS 13.1)', condition: 'Like New', mrp: 33999, available: true, premiumOnly: false },
  { id: 15, brand: 'Nothing', model: 'Nothing Phone (2)', description: 'Unique Glyph Interface, Snapdragon 8+ Gen 1, clean NothingOS, and 50 MP dual cameras.', tier: 'mid-tier', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone2.jpg', ram: '12 GB', storage: '256 GB', os: 'Android 13 (NothingOS 2.0)', condition: 'Like New', mrp: 44999, available: true, premiumOnly: false },
  { id: 16, brand: 'Vivo', model: 'Vivo V29 Pro', description: '3D curved AMOLED, 50 MP OIS + Aura Light portrait, 80W FlashCharge, and slim design.', tier: 'mid-tier', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29-pro.jpg', ram: '12 GB', storage: '256 GB', os: 'Android 13 (Funtouch 13)', condition: 'Good', mrp: 39999, available: true, premiumOnly: false },
  { id: 17, brand: 'iQOO', model: 'iQOO Neo 9 Pro', description: 'Snapdragon 8 Gen 2, 120W FlashCharge, 50 MP OIS camera, and 144Hz AMOLED display.', tier: 'mid-tier', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg', ram: '12 GB', storage: '256 GB', os: 'Android 14 (Funtouch 14)', condition: 'Like New', mrp: 36999, available: true, premiumOnly: false },
  { id: 18, brand: 'Motorola', model: 'Motorola Edge 40', description: 'Dimensity 8020, 68W TurboPower, 50 MP OIS camera, pOLED 144Hz, and IP68 rating.', tier: 'mid-tier', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40.jpg', ram: '8 GB', storage: '256 GB', os: 'Android 13', condition: 'Good', mrp: 29999, available: true, premiumOnly: false },
  { id: 19, brand: 'Realme', model: 'Realme GT 5 Pro', description: 'Snapdragon 8 Gen 3, 100W SUPERVOOC, Sony IMX890 camera, and 6.78" AMOLED display.', tier: 'mid-tier', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt5-pro.jpg', ram: '12 GB', storage: '256 GB', os: 'Android 14 (Realme UI 5.0)', condition: 'Like New', mrp: 34999, available: true, premiumOnly: false },
  { id: 20, brand: 'Samsung', model: 'Galaxy A34 5G', description: 'Super AMOLED 120Hz, triple 48 MP camera, 5000 mAh battery, and One UI 5.1.', tier: 'mid-tier', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a34-5g.jpg', ram: '8 GB', storage: '128 GB', os: 'Android 13 (One UI 5.1)', condition: 'Good', mrp: 25999, available: true, premiumOnly: false },

  // ═══════════════ BUDGET (MRP under ₹20,000) ═══════════════
  { id: 21, brand: 'Samsung', model: 'Galaxy M34 5G', description: 'Super AMOLED 120Hz, Exynos 1280, 6000 mAh battery, and 50 MP triple camera.', tier: 'budget', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m34.jpg', ram: '6 GB', storage: '128 GB', os: 'Android 13 (One UI 5.1)', condition: 'Good', mrp: 18999, available: true, premiumOnly: false },
  { id: 22, brand: 'Xiaomi', model: 'Redmi Note 13 Pro', description: '200 MP main camera, 120Hz AMOLED, Snapdragon 7s Gen 2, and 67W turbo charging.', tier: 'budget', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-4g.jpg', ram: '8 GB', storage: '128 GB', os: 'Android 13 (MIUI 14)', condition: 'Good', mrp: 19999, available: true, premiumOnly: false },
  { id: 23, brand: 'Realme', model: 'Realme Narzo 60', description: 'AMOLED display, Dimensity 6020, 33W fast charging, and 64 MP main camera.', tier: 'budget', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60-5g.jpg', ram: '6 GB', storage: '128 GB', os: 'Android 13 (Realme UI 4.0)', condition: 'Good', mrp: 14999, available: true, premiumOnly: false },
  { id: 24, brand: 'OnePlus', model: 'OnePlus Nord CE 3 Lite', description: '108 MP main camera, Snapdragon 695, 67W SUPERVOOC, and 5000 mAh battery.', tier: 'budget', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3-lite.jpg', ram: '8 GB', storage: '128 GB', os: 'Android 13 (OxygenOS 13.1)', condition: 'Good', mrp: 17999, available: true, premiumOnly: false },
  { id: 25, brand: 'Motorola', model: 'Moto G84 5G', description: 'pOLED display, Snapdragon 695, 50 MP OIS camera, and stock Android experience.', tier: 'budget', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g84.jpg', ram: '8 GB', storage: '256 GB', os: 'Android 13', condition: 'Good', mrp: 17999, available: true, premiumOnly: false },
  { id: 26, brand: 'Poco', model: 'Poco X5 Pro 5G', description: '120Hz Super AMOLED, Snapdragon 778G, 108 MP camera, and 67W turbo charging.', tier: 'budget', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x5-pro-5g.jpg', ram: '8 GB', storage: '256 GB', os: 'Android 12 (MIUI 14)', condition: 'Like New', mrp: 16999, available: true, premiumOnly: false },
  { id: 27, brand: 'iQOO', model: 'iQOO Z7 5G', description: 'Dimensity 920, 64 MP OIS camera, 44W FlashCharge, and FuntouchOS 13.', tier: 'budget', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z7.jpg', ram: '6 GB', storage: '128 GB', os: 'Android 13 (Funtouch 13)', condition: 'Good', mrp: 14999, available: true, premiumOnly: false },
  { id: 28, brand: 'Xiaomi', model: 'Redmi 13C', description: 'Mediatek Helio G85, 50 MP AI camera, 5000 mAh battery, and 6.74" HD+ display.', tier: 'budget', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13c.jpg', ram: '4 GB', storage: '128 GB', os: 'Android 13 (MIUI 14)', condition: 'Good', mrp: 8999, available: true, premiumOnly: false },
  { id: 29, brand: 'Samsung', model: 'Galaxy A15', description: 'Super AMOLED display, MediaTek Helio G99, 50 MP camera, and 5000 mAh battery.', tier: 'budget', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a15.jpg', ram: '6 GB', storage: '128 GB', os: 'Android 14 (One UI 6.0)', condition: 'Good', mrp: 13999, available: true, premiumOnly: false },
  { id: 30, brand: 'Realme', model: 'Realme C55', description: 'Mini Capsule UI, 64 MP main camera, Helio G88, 33W fast charge, and 5000 mAh battery.', tier: 'budget', imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c55.jpg', ram: '6 GB', storage: '64 GB', os: 'Android 13 (Realme UI 4.0)', condition: 'Good', mrp: 10999, available: true, premiumOnly: false },
]

export const DEFAULT_CATALOG: CatalogPhone[] = RAW_CATALOG.map((p) => ({
  ...p,
  ...calcPrices(p.mrp, p.condition),
}))

export const REPO_IMAGES: { label: string; path: string }[] = [
  { label: 'Generic Phone', path: '/assets/images/fallback.svg' },
]
