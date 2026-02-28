import Database from 'better-sqlite3';
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

function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      password_hash TEXT  NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS phones (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      brand         TEXT    NOT NULL,
      model         TEXT    NOT NULL,
      description   TEXT    NOT NULL,
      price_per_day REAL    NOT NULL,
      image_url     TEXT    NOT NULL DEFAULT '',
      available     INTEGER NOT NULL DEFAULT 1,
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
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Add INR pricing columns if they don't exist yet (idempotent).
  try { db.exec('ALTER TABLE phones ADD COLUMN msrp_inr INTEGER NOT NULL DEFAULT 0'); } catch { /* already exists */ }
  try { db.exec('ALTER TABLE phones ADD COLUMN age_years REAL    NOT NULL DEFAULT 0'); } catch { /* already exists */ }
}

function seed(): void {
  const count = (db.prepare('SELECT COUNT(*) as c FROM phones').get() as { c: number }).c;

  const insert = db.prepare(`
    INSERT INTO phones (brand, model, description, price_per_day, image_url, available, msrp_inr, age_years)
    VALUES (@brand, @model, @description, @price_per_day, @image_url, 1, @msrp_inr, @age_years)
  `);

  // msrp_inr: Indian launch MRP.  age_years: approximate age of the device.
  // current_price_inr = round_to_100(msrp_inr × 0.75^age_years)
  const phones = [
    {
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      description: 'Latest Apple flagship with A17 Pro chip, titanium design, and ProRes video.',
      price_per_day: 12.99,
      image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
      msrp_inr: 134900,
      age_years: 1,
    },
    {
      brand: 'Apple',
      model: 'iPhone 14',
      description: 'Reliable Apple performer with A15 Bionic, great cameras, and all-day battery.',
      price_per_day: 8.99,
      image_url: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=400',
      msrp_inr: 79900,
      age_years: 2,
    },
    {
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      description: 'Samsung\'s best with built-in S Pen, 200 MP camera, and Snapdragon 8 Gen 3.',
      price_per_day: 13.99,
      image_url: 'https://images.unsplash.com/photo-1706134030060-cf5e19773cee?w=400',
      msrp_inr: 129999,
      age_years: 1,
    },
    {
      brand: 'Samsung',
      model: 'Galaxy A54',
      description: 'Mid-range Samsung with AMOLED display, 50 MP camera, and 5000 mAh battery.',
      price_per_day: 5.99,
      image_url: 'https://images.unsplash.com/photo-1610945264803-c22b62831985?w=400',
      msrp_inr: 38999,
      age_years: 2,
    },
    {
      brand: 'Google',
      model: 'Pixel 8 Pro',
      description: 'Google\'s flagship with Tensor G3 chip, advanced AI features, and 7 years of updates.',
      price_per_day: 11.99,
      image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
      msrp_inr: 106999,
      age_years: 1,
    },
    {
      brand: 'Google',
      model: 'Pixel 7a',
      description: 'Affordable Pixel experience with Tensor G2, excellent cameras, and pure Android.',
      price_per_day: 7.49,
      image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
      msrp_inr: 43999,
      age_years: 2,
    },
    {
      brand: 'OnePlus',
      model: 'OnePlus 12',
      description: 'Flagship killer with Snapdragon 8 Gen 3, 100W fast charging, and Hasselblad cameras.',
      price_per_day: 10.99,
      image_url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',
      msrp_inr: 64999,
      age_years: 1,
    },
    {
      brand: 'OnePlus',
      model: 'OnePlus Nord CE 3',
      description: 'Solid mid-ranger with Snapdragon 782G, 50 MP Sony sensor, and 80W charging.',
      price_per_day: 4.99,
      image_url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',
      msrp_inr: 26999,
      age_years: 2,
    },
  ];

  if (count === 0) {
    const insertMany = db.transaction(() => {
      for (const phone of phones) insert.run(phone);
    });
    insertMany();
  } else {
    // Backfill INR prices for phones that were inserted before this migration.
    const update = db.prepare(
      'UPDATE phones SET msrp_inr = @msrp_inr, age_years = @age_years WHERE brand = @brand AND model = @model AND msrp_inr = 0',
    );
    const backfill = db.transaction(() => {
      for (const phone of phones) update.run(phone);
    });
    backfill();
  }
}

migrate();
seed();

export default db;
