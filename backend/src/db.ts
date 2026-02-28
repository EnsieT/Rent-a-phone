import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'rental.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Condition-based depreciation factors (% of MRP retained)
const CONDITION_FACTOR: Record<string, number> = {
  Mint: 0.85,
  'Like New': 0.80,
  Good: 0.65,
  Fair: 0.50,
};

function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      password_hash TEXT  NOT NULL,
      is_admin    INTEGER NOT NULL DEFAULT 0,
      is_member   INTEGER NOT NULL DEFAULT 0,
      membership_expiry TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS phones (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      brand         TEXT    NOT NULL,
      model         TEXT    NOT NULL,
      description   TEXT    NOT NULL,
      mrp           REAL    NOT NULL DEFAULT 0,
      buy_price     REAL    NOT NULL DEFAULT 0,
      price_per_day REAL    NOT NULL,
      image_url     TEXT    NOT NULL DEFAULT '',
      available     INTEGER NOT NULL DEFAULT 1,
      tier          TEXT    NOT NULL DEFAULT 'mid-tier',
      ram           TEXT    NOT NULL DEFAULT '8 GB',
      storage       TEXT    NOT NULL DEFAULT '128 GB',
      os            TEXT    NOT NULL DEFAULT 'Android 14',
      condition     TEXT    NOT NULL DEFAULT 'Good',
      premium_only  INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rentals (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id),
      phone_id    INTEGER NOT NULL REFERENCES phones(id),
      start_date  TEXT    NOT NULL,
      end_date    TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'pending'
                          CHECK(status IN ('pending','active','cancelled','completed')),
      total_price REAL    NOT NULL,
      deposit     REAL    NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id),
      amount      REAL    NOT NULL DEFAULT 10000,
      start_date  TEXT    NOT NULL DEFAULT (date('now')),
      expiry_date TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'active'
                          CHECK(status IN ('active','expired','refunded')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Idempotent column additions for older databases
  const phoneCols = (db.prepare("PRAGMA table_info(phones)").all() as Array<{ name: string }>).map((r) => r.name);
  if (!phoneCols.includes('mrp'))
    db.exec("ALTER TABLE phones ADD COLUMN mrp REAL NOT NULL DEFAULT 0");
  if (!phoneCols.includes('os'))
    db.exec("ALTER TABLE phones ADD COLUMN os TEXT NOT NULL DEFAULT 'Android 14'");
  if (!phoneCols.includes('premium_only'))
    db.exec("ALTER TABLE phones ADD COLUMN premium_only INTEGER NOT NULL DEFAULT 0");

  const userCols = (db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>).map((r) => r.name);
  if (!userCols.includes('is_admin'))
    db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0");
  if (!userCols.includes('is_member'))
    db.exec("ALTER TABLE users ADD COLUMN is_member INTEGER NOT NULL DEFAULT 0");
  if (!userCols.includes('membership_expiry'))
    db.exec("ALTER TABLE users ADD COLUMN membership_expiry TEXT");

  const rentalCols = (db.prepare("PRAGMA table_info(rentals)").all() as Array<{ name: string }>).map((r) => r.name);
  if (!rentalCols.includes('deposit'))
    db.exec("ALTER TABLE rentals ADD COLUMN deposit REAL NOT NULL DEFAULT 0");
}

function calcPrice(mrp: number, condition: string) {
  const factor = CONDITION_FACTOR[condition] ?? 0.65;
  const buy_price = Math.round(mrp * factor);
  const price_per_day = Math.round(buy_price / 400);
  return { buy_price, price_per_day };
}

function seed(): void {
  const count = (db.prepare('SELECT COUNT(*) as c FROM phones').get() as { c: number }).c;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO phones (brand, model, description, mrp, buy_price, price_per_day, image_url, available, tier, ram, storage, os, condition, premium_only)
    VALUES (@brand, @model, @description, @mrp, @buy_price, @price_per_day, @image_url, 1, @tier, @ram, @storage, @os, @condition, @premium_only)
  `);

  const raw = [
    // ═══════════════ PREMIUM (MRP ₹50,000+) ═══════════════
    { brand: 'Apple', model: 'iPhone 15 Pro Max', description: "Apple's ultimate flagship — A17 Pro chip, titanium build, 5× optical zoom, and ProRes 4K video.", mrp: 159900, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg', tier: 'premium', ram: '8 GB', storage: '512 GB', os: 'iOS 17', condition: 'Mint', premium_only: 1 },
    { brand: 'Apple', model: 'iPhone 15 Pro', description: 'Titanium design, A17 Pro chip, Action button, and 48 MP camera system with 3× zoom.', mrp: 134900, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg', tier: 'premium', ram: '8 GB', storage: '256 GB', os: 'iOS 17', condition: 'Mint', premium_only: 1 },
    { brand: 'Samsung', model: 'Galaxy S24 Ultra', description: "Samsung's best with built-in S Pen, 200 MP camera, Snapdragon 8 Gen 3, and Galaxy AI.", mrp: 129999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg', tier: 'premium', ram: '12 GB', storage: '256 GB', os: 'Android 14 (One UI 6.1)', condition: 'Mint', premium_only: 1 },
    { brand: 'Samsung', model: 'Galaxy Z Fold 5', description: 'Foldable flagship with 7.6" inner display, Snapdragon 8 Gen 2, and Flex Mode cameras.', mrp: 154999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg', tier: 'premium', ram: '12 GB', storage: '256 GB', os: 'Android 13 (One UI 5.1.1)', condition: 'Like New', premium_only: 1 },
    { brand: 'Samsung', model: 'Galaxy Z Flip 5', description: 'Compact foldable with 3.4" cover display, Snapdragon 8 Gen 2, and FlexCam selfies.', mrp: 99999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg', tier: 'premium', ram: '8 GB', storage: '256 GB', os: 'Android 13 (One UI 5.1.1)', condition: 'Like New', premium_only: 0 },
    { brand: 'Google', model: 'Pixel 8 Pro', description: "Google's flagship with Tensor G3, advanced AI photo features, and 7 years of updates.", mrp: 106999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro-new.jpg', tier: 'premium', ram: '12 GB', storage: '256 GB', os: 'Android 14', condition: 'Mint', premium_only: 0 },
    { brand: 'OnePlus', model: 'OnePlus 12', description: 'Flagship killer — Snapdragon 8 Gen 3, 100W SUPERVOOC, Hasselblad camera, and 2K display.', mrp: 69999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg', tier: 'premium', ram: '16 GB', storage: '256 GB', os: 'Android 14 (OxygenOS 14)', condition: 'Like New', premium_only: 0 },
    { brand: 'Apple', model: 'iPhone 15', description: 'Dynamic Island, 48 MP camera, USB-C, A16 Bionic chip, and all-day battery life.', mrp: 79900, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg', tier: 'premium', ram: '6 GB', storage: '128 GB', os: 'iOS 17', condition: 'Like New', premium_only: 0 },
    { brand: 'Vivo', model: 'X100 Pro', description: 'Zeiss optics, Dimensity 9300, 4nm chip, 100W charging, and AMOLED 120Hz display.', mrp: 89999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg', tier: 'premium', ram: '16 GB', storage: '256 GB', os: 'Android 14 (Funtouch 14)', condition: 'Mint', premium_only: 0 },
    { brand: 'Xiaomi', model: 'Xiaomi 14', description: 'Leica optics, Snapdragon 8 Gen 3, 75W HyperCharge, and compact 6.36" LTPO display.', mrp: 69999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14.jpg', tier: 'premium', ram: '12 GB', storage: '256 GB', os: 'Android 14 (HyperOS)', condition: 'Like New', premium_only: 0 },

    // ═══════════════ MID-TIER (MRP ₹20,000 – ₹50,000) ═══════════════
    { brand: 'Apple', model: 'iPhone 14', description: 'Reliable performer with A15 Bionic, great dual cameras, and all-day battery life.', mrp: 49900, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg', tier: 'mid-tier', ram: '6 GB', storage: '128 GB', os: 'iOS 16', condition: 'Like New', premium_only: 0 },
    { brand: 'Samsung', model: 'Galaxy A54 5G', description: 'Super AMOLED 120Hz, 50 MP OIS camera, 5000 mAh battery, IP67 water resistance.', mrp: 38999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54-5g.jpg', tier: 'mid-tier', ram: '8 GB', storage: '128 GB', os: 'Android 13 (One UI 5.1)', condition: 'Like New', premium_only: 0 },
    { brand: 'Google', model: 'Pixel 7a', description: 'Affordable Pixel — Tensor G2, excellent cameras, pure Android, and 5 years of updates.', mrp: 31999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg', tier: 'mid-tier', ram: '8 GB', storage: '128 GB', os: 'Android 13', condition: 'Like New', premium_only: 0 },
    { brand: 'OnePlus', model: 'OnePlus Nord 3 5G', description: 'Dimensity 9000, 80W SUPERVOOC, 50 MP Sony IMX890, and 6.74" AMOLED 120Hz display.', mrp: 33999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-3.jpg', tier: 'mid-tier', ram: '16 GB', storage: '256 GB', os: 'Android 13 (OxygenOS 13.1)', condition: 'Like New', premium_only: 0 },
    { brand: 'Nothing', model: 'Nothing Phone (2)', description: 'Unique Glyph Interface, Snapdragon 8+ Gen 1, clean NothingOS, and 50 MP dual cameras.', mrp: 44999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone2.jpg', tier: 'mid-tier', ram: '12 GB', storage: '256 GB', os: 'Android 13 (NothingOS 2.0)', condition: 'Like New', premium_only: 0 },
    { brand: 'Vivo', model: 'Vivo V29 Pro', description: '3D curved AMOLED, 50 MP OIS + Aura Light portrait, 80W FlashCharge, and slim design.', mrp: 39999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-v29-pro.jpg', tier: 'mid-tier', ram: '12 GB', storage: '256 GB', os: 'Android 13 (Funtouch 13)', condition: 'Good', premium_only: 0 },
    { brand: 'iQOO', model: 'iQOO Neo 9 Pro', description: 'Snapdragon 8 Gen 2, 120W FlashCharge, 50 MP OIS camera, and 144Hz AMOLED display.', mrp: 36999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-neo9-pro.jpg', tier: 'mid-tier', ram: '12 GB', storage: '256 GB', os: 'Android 14 (Funtouch 14)', condition: 'Like New', premium_only: 0 },
    { brand: 'Motorola', model: 'Motorola Edge 40', description: 'Dimensity 8020, 68W TurboPower, 50 MP OIS camera, pOLED 144Hz, and IP68 rating.', mrp: 29999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40.jpg', tier: 'mid-tier', ram: '8 GB', storage: '256 GB', os: 'Android 13', condition: 'Good', premium_only: 0 },
    { brand: 'Realme', model: 'Realme GT 5 Pro', description: 'Snapdragon 8 Gen 3, 100W SUPERVOOC, Sony IMX890 camera, and 6.78" AMOLED display.', mrp: 34999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt5-pro.jpg', tier: 'mid-tier', ram: '12 GB', storage: '256 GB', os: 'Android 14 (Realme UI 5.0)', condition: 'Like New', premium_only: 0 },
    { brand: 'Samsung', model: 'Galaxy A34 5G', description: 'Super AMOLED 120Hz, triple 48 MP camera, 5000 mAh battery, and One UI 5.1.', mrp: 25999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a34-5g.jpg', tier: 'mid-tier', ram: '8 GB', storage: '128 GB', os: 'Android 13 (One UI 5.1)', condition: 'Good', premium_only: 0 },

    // ═══════════════ BUDGET (MRP under ₹20,000) ═══════════════
    { brand: 'Samsung', model: 'Galaxy M34 5G', description: 'Super AMOLED 120Hz, Exynos 1280, 6000 mAh battery, and 50 MP triple camera.', mrp: 18999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m34.jpg', tier: 'budget', ram: '6 GB', storage: '128 GB', os: 'Android 13 (One UI 5.1)', condition: 'Good', premium_only: 0 },
    { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', description: '200 MP main camera, 120Hz AMOLED, Snapdragon 7s Gen 2, and 67W turbo charging.', mrp: 19999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-4g.jpg', tier: 'budget', ram: '8 GB', storage: '128 GB', os: 'Android 13 (MIUI 14)', condition: 'Good', premium_only: 0 },
    { brand: 'Realme', model: 'Realme Narzo 60', description: 'AMOLED display, Dimensity 6020, 33W fast charging, and 64 MP main camera.', mrp: 14999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-60-5g.jpg', tier: 'budget', ram: '6 GB', storage: '128 GB', os: 'Android 13 (Realme UI 4.0)', condition: 'Good', premium_only: 0 },
    { brand: 'OnePlus', model: 'OnePlus Nord CE 3 Lite', description: '108 MP main camera, Snapdragon 695, 67W SUPERVOOC, and 5000 mAh battery.', mrp: 17999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3-lite.jpg', tier: 'budget', ram: '8 GB', storage: '128 GB', os: 'Android 13 (OxygenOS 13.1)', condition: 'Good', premium_only: 0 },
    { brand: 'Motorola', model: 'Moto G84 5G', description: 'pOLED display, Snapdragon 695, 50 MP OIS camera, and stock Android experience.', mrp: 17999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g84.jpg', tier: 'budget', ram: '8 GB', storage: '256 GB', os: 'Android 13', condition: 'Good', premium_only: 0 },
    { brand: 'Poco', model: 'Poco X5 Pro 5G', description: '120Hz Super AMOLED, Snapdragon 778G, 108 MP camera, and 67W turbo charging.', mrp: 16999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x5-pro-5g.jpg', tier: 'budget', ram: '8 GB', storage: '256 GB', os: 'Android 12 (MIUI 14)', condition: 'Like New', premium_only: 0 },
    { brand: 'iQOO', model: 'iQOO Z7 5G', description: 'Dimensity 920, 64 MP OIS camera, 44W FlashCharge, and FuntouchOS 13.', mrp: 14999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-z7.jpg', tier: 'budget', ram: '6 GB', storage: '128 GB', os: 'Android 13 (Funtouch 13)', condition: 'Good', premium_only: 0 },
    { brand: 'Xiaomi', model: 'Redmi 13C', description: 'Mediatek Helio G85, 50 MP AI camera, 5000 mAh battery, and 6.74" HD+ display.', mrp: 8999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13c.jpg', tier: 'budget', ram: '4 GB', storage: '128 GB', os: 'Android 13 (MIUI 14)', condition: 'Good', premium_only: 0 },
    { brand: 'Samsung', model: 'Galaxy A15', description: 'Super AMOLED display, MediaTek Helio G99, 50 MP camera, and 5000 mAh battery.', mrp: 13999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a15.jpg', tier: 'budget', ram: '6 GB', storage: '128 GB', os: 'Android 14 (One UI 6.0)', condition: 'Good', premium_only: 0 },
    { brand: 'Realme', model: 'Realme C55', description: 'Mini Capsule UI, 64 MP main camera, Helio G88, 33W fast charge, and 5000 mAh battery.', mrp: 10999, image_url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-c55.jpg', tier: 'budget', ram: '6 GB', storage: '64 GB', os: 'Android 13 (Realme UI 4.0)', condition: 'Good', premium_only: 0 },
  ];

  const phones = raw.map((p) => ({ ...p, ...calcPrice(p.mrp, p.condition) }));

  const insertMany = db.transaction(() => {
    for (const phone of phones) insert.run(phone);
  });
  insertMany();
}

async function seedAdmin(): Promise<void> {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@rentaphone.com');
  if (existing) return;
  const hash = await bcrypt.hash('admin123', 10);
  db.prepare('INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 1)')
    .run('Admin', 'admin@rentaphone.com', hash);
}

migrate();
seed();
seedAdmin();

export default db;
