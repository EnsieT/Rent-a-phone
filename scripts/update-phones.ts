#!/usr/bin/env npx tsx
/**
 * Phone Catalog Update Tool
 * =========================
 * Interactive CLI to add, edit, remove, or list phones in the Rent-A-Phone catalog.
 *
 * Usage:
 *   npx tsx scripts/update-phones.ts
 *
 * What it does:
 *   - Reads the current catalog from frontend/src/data/catalog.ts
 *   - Lets you add, edit, or remove phone entries
 *   - Writes changes back to catalog.ts
 *   - Reminds you to update backend/src/db.ts seed data if needed
 *
 * After making changes:
 *   1. Delete backend/data/ folder to re-seed the database
 *   2. Restart the backend server
 *   3. Clear localStorage in the browser (rap_catalog key)
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

// ─── Paths ──────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..')
const CATALOG_PATH = path.join(ROOT, 'frontend', 'src', 'data', 'catalog.ts')

// ─── Types ──────────────────────────────────────────────────────────────
interface PhoneEntry {
  id: number
  brand: string
  model: string
  description: string
  tier: 'budget' | 'mid-tier' | 'premium'
  imagePath: string
  ram: string
  storage: string
  os: string
  condition: 'Mint' | 'Like New' | 'Good' | 'Fair'
  mrp: number
  available: boolean
  premiumOnly: boolean
}

// ─── Readline setup ─────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

function askWithDefault(question: string, defaultVal: string): Promise<string> {
  return new Promise((resolve) =>
    rl.question(`${question} [${defaultVal}]: `, (ans) => resolve(ans.trim() || defaultVal))
  )
}

// ─── Parse catalog.ts ───────────────────────────────────────────────────
function parseCatalog(): PhoneEntry[] {
  const content = fs.readFileSync(CATALOG_PATH, 'utf-8')

  // Extract the RAW_CATALOG array content between [ and ]
  const match = content.match(/const RAW_CATALOG[\s\S]*?=\s*\[([\s\S]*?)\]\s*$/m)
  if (!match) {
    console.error('Could not parse RAW_CATALOG from catalog.ts')
    process.exit(1)
  }

  const phones: PhoneEntry[] = []
  // Match each { ... } block
  const entryRegex = /\{([^}]+)\}/g
  let m: RegExpExecArray | null
  while ((m = entryRegex.exec(match[1])) !== null) {
    const block = m[1]
    const get = (key: string): string => {
      const r = new RegExp(`${key}:\\s*(?:'([^']*)'|"([^"]*)"|(\d+)|true|false)`)
      const rm = block.match(r)
      if (!rm) return ''
      return rm[1] ?? rm[2] ?? rm[3] ?? ''
    }
    const getBool = (key: string): boolean => {
      const r = new RegExp(`${key}:\\s*(true|false)`)
      const rm = block.match(r)
      return rm ? rm[1] === 'true' : false
    }
    const getNum = (key: string): number => {
      const r = new RegExp(`${key}:\\s*(\d+)`)
      const rm = block.match(r)
      return rm ? parseInt(rm[1]) : 0
    }

    phones.push({
      id: getNum('id'),
      brand: get('brand'),
      model: get('model'),
      description: get('description'),
      tier: get('tier') as PhoneEntry['tier'],
      imagePath: get('imagePath'),
      ram: get('ram'),
      storage: get('storage'),
      os: get('os'),
      condition: get('condition') as PhoneEntry['condition'],
      mrp: getNum('mrp'),
      available: getBool('available'),
      premiumOnly: getBool('premiumOnly'),
    })
  }

  return phones
}

// ─── Write catalog.ts ───────────────────────────────────────────────────
function writeCatalog(phones: PhoneEntry[]): void {
  const CONDITION_FACTORS: Record<string, number> = {
    Mint: 0.85,
    'Like New': 0.80,
    Good: 0.65,
    Fair: 0.50,
  }

  function tierComment(tier: string): string {
    switch (tier) {
      case 'premium': return '// ═══════════════ PREMIUM (MRP ₹50,000+) ═══════════════'
      case 'mid-tier': return '// ═══════════════ MID-TIER (MRP ₹20,000 – ₹50,000) ═══════════════'
      case 'budget': return '// ═══════════════ BUDGET (MRP under ₹20,000) ═══════════════'
      default: return ''
    }
  }

  const premiums = phones.filter((p) => p.tier === 'premium')
  const midTiers = phones.filter((p) => p.tier === 'mid-tier')
  const budgets = phones.filter((p) => p.tier === 'budget')

  function phoneToStr(p: PhoneEntry): string {
    const desc = p.description.replace(/'/g, "\\'")
    return `  { id: ${p.id}, brand: '${p.brand}', model: '${p.model}', description: '${desc}', tier: '${p.tier}', imagePath: '${p.imagePath}', ram: '${p.ram}', storage: '${p.storage}', os: '${p.os}', condition: '${p.condition}', mrp: ${p.mrp}, available: ${p.available}, premiumOnly: ${p.premiumOnly} },`
  }

  function groupToStr(group: PhoneEntry[], tier: string): string {
    if (group.length === 0) return ''
    return `  ${tierComment(tier)}\n${group.map(phoneToStr).join('\n')}`
  }

  const entries = [
    groupToStr(premiums, 'premium'),
    groupToStr(midTiers, 'mid-tier'),
    groupToStr(budgets, 'budget'),
  ].filter(Boolean).join('\n\n')

  const output = `export type Tier = 'budget' | 'mid-tier' | 'premium'
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
${entries}
]

export const DEFAULT_CATALOG: CatalogPhone[] = RAW_CATALOG.map((p) => ({
  ...p,
  ...calcPrices(p.mrp, p.condition),
}))

export const REPO_IMAGES: { label: string; path: string }[] = [
  { label: 'Generic Phone', path: '/assets/images/fallback.svg' },
]
`

  fs.writeFileSync(CATALOG_PATH, output, 'utf-8')
}

// ─── Actions ────────────────────────────────────────────────────────────
function listPhones(phones: PhoneEntry[]): void {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗')
  console.log('║                    PHONE CATALOG (' + String(phones.length).padStart(2) + ' phones)                    ║')
  console.log('╠══════════════════════════════════════════════════════════════════╣')

  const tiers = ['premium', 'mid-tier', 'budget'] as const
  for (const tier of tiers) {
    const group = phones.filter((p) => p.tier === tier)
    if (group.length === 0) continue
    console.log(`║  ── ${tier.toUpperCase()} ${'─'.repeat(55 - tier.length)}║`)
    for (const p of group) {
      const premium = p.premiumOnly ? ' ★' : '  '
      const line = `${premium} #${String(p.id).padStart(2)} ${p.brand} ${p.model}`
      const price = `₹${p.mrp.toLocaleString('en-IN')}`
      console.log(`║  ${line.padEnd(48)} ${price.padStart(14)} ║`)
    }
  }
  console.log('╚══════════════════════════════════════════════════════════════════╝')
  console.log('  ★ = Members Only\n')
}

async function addPhone(phones: PhoneEntry[]): Promise<PhoneEntry[]> {
  console.log('\n── Add New Phone ──')
  console.log('Tip: Find image at gsmarena.com → right-click product image → Copy image address')
  console.log('     URL format: https://fdn2.gsmarena.com/vv/bigpic/{phone-slug}.jpg\n')

  const nextId = Math.max(...phones.map((p) => p.id), 0) + 1

  const brand = await ask('  Brand: ')
  const model = await ask('  Model: ')
  const description = await ask('  Description: ')
  const tierInput = await askWithDefault('  Tier (budget / mid-tier / premium)', 'mid-tier')
  const tier = (['budget', 'mid-tier', 'premium'].includes(tierInput) ? tierInput : 'mid-tier') as PhoneEntry['tier']
  const imagePath = await ask('  Image URL: ')
  const ram = await askWithDefault('  RAM (e.g. 8 GB)', '8 GB')
  const storage = await askWithDefault('  Storage (e.g. 128 GB)', '128 GB')
  const os = await ask('  OS (e.g. Android 14 (One UI 6.1)): ')
  const condInput = await askWithDefault('  Condition (Mint / Like New / Good / Fair)', 'Like New')
  const condition = (['Mint', 'Like New', 'Good', 'Fair'].includes(condInput) ? condInput : 'Like New') as PhoneEntry['condition']
  const mrpStr = await ask('  MRP (₹): ')
  const mrp = parseInt(mrpStr) || 0
  const premiumStr = await askWithDefault('  Premium only? (y/n)', 'n')
  const premiumOnly = premiumStr.toLowerCase() === 'y'

  const newPhone: PhoneEntry = {
    id: nextId,
    brand, model, description, tier, imagePath, ram, storage, os, condition, mrp,
    available: true,
    premiumOnly,
  }

  const factor = { Mint: 0.85, 'Like New': 0.80, Good: 0.65, Fair: 0.50 }[condition]
  const buyPrice = Math.round(mrp * factor)
  const rentPerDay = Math.round(buyPrice / 400)

  console.log(`\n  ✓ Phone #${nextId}: ${brand} ${model}`)
  console.log(`    Buy: ₹${buyPrice.toLocaleString('en-IN')}  |  Rent: ₹${rentPerDay}/day  |  Tier: ${tier}`)
  console.log(`    Image: ${imagePath}`)

  const confirm = await askWithDefault('  Save? (y/n)', 'y')
  if (confirm.toLowerCase() !== 'y') {
    console.log('  Cancelled.')
    return phones
  }

  return [...phones, newPhone]
}

async function editPhone(phones: PhoneEntry[]): Promise<PhoneEntry[]> {
  const idStr = await ask('\n  Enter phone ID to edit: ')
  const id = parseInt(idStr)
  const idx = phones.findIndex((p) => p.id === id)
  if (idx === -1) {
    console.log('  Phone not found.')
    return phones
  }

  const p = phones[idx]
  console.log(`\n  Editing: #${p.id} ${p.brand} ${p.model}`)
  console.log('  Press Enter to keep current value.\n')

  const brand = await askWithDefault('  Brand', p.brand)
  const model = await askWithDefault('  Model', p.model)
  const description = await askWithDefault('  Description', p.description)
  const tier = await askWithDefault('  Tier', p.tier) as PhoneEntry['tier']
  const imagePath = await askWithDefault('  Image URL', p.imagePath)
  const ram = await askWithDefault('  RAM', p.ram)
  const storage = await askWithDefault('  Storage', p.storage)
  const os = await askWithDefault('  OS', p.os)
  const condition = await askWithDefault('  Condition', p.condition) as PhoneEntry['condition']
  const mrp = parseInt(await askWithDefault('  MRP', String(p.mrp)))
  const premiumStr = await askWithDefault('  Premium only? (y/n)', p.premiumOnly ? 'y' : 'n')
  const availStr = await askWithDefault('  Available? (y/n)', p.available ? 'y' : 'n')

  const updated = [...phones]
  updated[idx] = {
    ...p,
    brand, model, description, tier, imagePath, ram, storage, os, condition, mrp,
    premiumOnly: premiumStr.toLowerCase() === 'y',
    available: availStr.toLowerCase() === 'y',
  }

  console.log(`  ✓ Updated #${id} ${brand} ${model}`)
  return updated
}

async function removePhone(phones: PhoneEntry[]): Promise<PhoneEntry[]> {
  const idStr = await ask('\n  Enter phone ID to remove: ')
  const id = parseInt(idStr)
  const phone = phones.find((p) => p.id === id)
  if (!phone) {
    console.log('  Phone not found.')
    return phones
  }
  const confirm = await askWithDefault(`  Remove #${id} ${phone.brand} ${phone.model}? (y/n)`, 'n')
  if (confirm.toLowerCase() !== 'y') {
    console.log('  Cancelled.')
    return phones
  }
  console.log(`  ✓ Removed #${id} ${phone.brand} ${phone.model}`)
  return phones.filter((p) => p.id !== id)
}

// ─── Main ───────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║       📱 Rent-A-Phone Catalog Update Tool       ║')
  console.log('╚══════════════════════════════════════════════════╝')

  let phones = parseCatalog()
  let modified = false

  while (true) {
    console.log('\nWhat would you like to do?')
    console.log('  1) List all phones')
    console.log('  2) Add a new phone')
    console.log('  3) Edit an existing phone')
    console.log('  4) Remove a phone')
    console.log('  5) Image URL tips')
    console.log('  6) Save & exit')
    console.log('  7) Exit without saving')

    const choice = await ask('\nChoice (1-7): ')

    switch (choice.trim()) {
      case '1':
        listPhones(phones)
        break
      case '2':
        phones = await addPhone(phones)
        modified = true
        break
      case '3':
        phones = await editPhone(phones)
        modified = true
        break
      case '4':
        phones = await removePhone(phones)
        modified = true
        break
      case '5':
        console.log('\n── Finding Phone Image URLs ──')
        console.log('  1. Go to https://www.gsmarena.com')
        console.log('  2. Search for the phone model')
        console.log('  3. Right-click the main product image')
        console.log('  4. Select "Copy image address"')
        console.log('  5. URL will look like: https://fdn2.gsmarena.com/vv/bigpic/{slug}.jpg')
        console.log('\n  Common slug patterns:')
        console.log('    apple-iphone-15-pro-max.jpg')
        console.log('    samsung-galaxy-s24-ultra-5g.jpg')
        console.log('    oneplus-12.jpg')
        console.log('    google-pixel-8-pro-new.jpg')
        break
      case '6':
        if (modified) {
          writeCatalog(phones)
          console.log(`\n✓ Saved ${phones.length} phones to catalog.ts`)
          console.log('\n⚠ IMPORTANT: After saving, you need to:')
          console.log('  1. Update backend/src/db.ts with matching phone data')
          console.log('  2. Delete backend/data/ folder to re-seed the DB')
          console.log('  3. Restart the backend server')
          console.log('  4. Clear browser localStorage (rap_catalog key)')
        } else {
          console.log('\nNo changes to save.')
        }
        rl.close()
        return
      case '7':
        if (modified) {
          const confirm = await askWithDefault('  Discard changes? (y/n)', 'n')
          if (confirm.toLowerCase() !== 'y') continue
        }
        console.log('\nExited without saving.')
        rl.close()
        return
      default:
        console.log('  Invalid choice. Enter 1-7.')
    }
  }
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
