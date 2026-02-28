export type Tier = 'budget' | 'mid-tier' | 'premium'
export type Condition = 'Mint' | 'Like New' | 'Good' | 'Fair'

export interface CatalogPhone {
  id: number
  brand: string
  model: string
  description: string
  tier: Tier
  imagePath: string
  ram: string
  storage: string
  condition: Condition
  buyPrice: number
  perDayPrice: number
  available: boolean
}

export const TIER_LABELS: Record<Tier, string> = {
  budget: 'Budget',
  'mid-tier': 'Mid-Tier',
  premium: 'Premium',
}

export const TIER_ORDER: Tier[] = ['budget', 'mid-tier', 'premium']

export const DEFAULT_CATALOG: CatalogPhone[] = [
  {
    id: 1,
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    description: 'Latest Apple flagship with A17 Pro chip, titanium design, and ProRes video.',
    tier: 'premium',
    imagePath: '/assets/images/iphone-15-pro.svg',
    ram: '8 GB',
    storage: '256 GB',
    condition: 'Mint',
    buyPrice: 999.00,
    perDayPrice: 12.99,
    available: true,
  },
  {
    id: 2,
    brand: 'Apple',
    model: 'iPhone 14',
    description: 'Reliable Apple performer with A15 Bionic, great cameras, and all-day battery.',
    tier: 'mid-tier',
    imagePath: '/assets/images/iphone-14.svg',
    ram: '6 GB',
    storage: '128 GB',
    condition: 'Like New',
    buyPrice: 649.00,
    perDayPrice: 8.99,
    available: true,
  },
  {
    id: 3,
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    description: "Samsung's best with built-in S Pen, 200 MP camera, and Snapdragon 8 Gen 3.",
    tier: 'premium',
    imagePath: '/assets/images/galaxy-s24-ultra.svg',
    ram: '12 GB',
    storage: '256 GB',
    condition: 'Mint',
    buyPrice: 1099.00,
    perDayPrice: 13.99,
    available: true,
  },
  {
    id: 4,
    brand: 'Samsung',
    model: 'Galaxy A54',
    description: 'Mid-range Samsung with AMOLED display, 50 MP camera, and 5000 mAh battery.',
    tier: 'budget',
    imagePath: '/assets/images/galaxy-a54.svg',
    ram: '6 GB',
    storage: '128 GB',
    condition: 'Good',
    buyPrice: 299.00,
    perDayPrice: 5.99,
    available: true,
  },
  {
    id: 5,
    brand: 'Google',
    model: 'Pixel 8 Pro',
    description: "Google's flagship with Tensor G3 chip, advanced AI features, and 7 years of updates.",
    tier: 'premium',
    imagePath: '/assets/images/pixel-8-pro.svg',
    ram: '12 GB',
    storage: '128 GB',
    condition: 'Mint',
    buyPrice: 899.00,
    perDayPrice: 11.99,
    available: true,
  },
  {
    id: 6,
    brand: 'Google',
    model: 'Pixel 7a',
    description: 'Affordable Pixel experience with Tensor G2, excellent cameras, and pure Android.',
    tier: 'mid-tier',
    imagePath: '/assets/images/pixel-7a.svg',
    ram: '8 GB',
    storage: '128 GB',
    condition: 'Like New',
    buyPrice: 449.00,
    perDayPrice: 7.49,
    available: true,
  },
  {
    id: 7,
    brand: 'OnePlus',
    model: 'OnePlus 12',
    description: 'Flagship killer with Snapdragon 8 Gen 3, 100W fast charging, and Hasselblad cameras.',
    tier: 'premium',
    imagePath: '/assets/images/oneplus-12.svg',
    ram: '16 GB',
    storage: '256 GB',
    condition: 'Like New',
    buyPrice: 749.00,
    perDayPrice: 10.99,
    available: true,
  },
  {
    id: 8,
    brand: 'OnePlus',
    model: 'OnePlus Nord CE 3',
    description: 'Solid mid-ranger with Snapdragon 782G, 50 MP Sony sensor, and 80W charging.',
    tier: 'budget',
    imagePath: '/assets/images/oneplus-nord-ce3.svg',
    ram: '8 GB',
    storage: '128 GB',
    condition: 'Good',
    buyPrice: 249.00,
    perDayPrice: 4.99,
    available: true,
  },
]

export const REPO_IMAGES: { label: string; path: string }[] = [
  { label: 'iPhone 15 Pro', path: '/assets/images/iphone-15-pro.svg' },
  { label: 'iPhone 14', path: '/assets/images/iphone-14.svg' },
  { label: 'Galaxy S24 Ultra', path: '/assets/images/galaxy-s24-ultra.svg' },
  { label: 'Galaxy A54', path: '/assets/images/galaxy-a54.svg' },
  { label: 'Pixel 8 Pro', path: '/assets/images/pixel-8-pro.svg' },
  { label: 'Pixel 7a', path: '/assets/images/pixel-7a.svg' },
  { label: 'OnePlus 12', path: '/assets/images/oneplus-12.svg' },
  { label: 'OnePlus Nord CE 3', path: '/assets/images/oneplus-nord-ce3.svg' },
  { label: 'Generic Phone', path: '/assets/images/fallback.svg' },
]
