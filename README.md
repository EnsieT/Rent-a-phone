# Rent-a-Phone 📱

A full-stack phone rental web application built with **React + TypeScript + Vite** (frontend) and **Express + SQLite** (backend).

---

## Features

- Browse phones organized by tier (Budget, Mid-Tier, Premium)
- Detailed phone specs: RAM, storage, condition, buy price
- Flexible rental booking with date picker
- **Volume discounts**: Every 30 days rented = 3% off daily rate (max 30%)
- **Rent-to-Own**: Rent for 365 cumulative days to become purchase-eligible
- Admin panel for managing the phone catalog (stored in localStorage)
- SVG phone illustrations with brand identity
- Fallback image on load error

---

## Project Structure

```
Rent-a-phone/
├── frontend/               # React + TypeScript + Vite
│   ├── public/
│   │   └── assets/images/  # SVG phone images
│   └── src/
│       ├── api/            # Axios API client
│       ├── components/     # Reusable UI components
│       ├── context/        # Auth context
│       ├── data/           # catalog.ts - phone catalog & image registry
│       ├── pages/          # Route pages
│       └── utils/          # catalogStore.ts, pricing.ts
└── backend/                # Express + SQLite
    └── src/
        ├── db.ts           # Database setup, migrations, seed data
        ├── index.ts        # Express app entry point
        ├── middleware/     # JWT auth middleware
        └── routes/         # phones, auth, rentals
```

---

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev   # runs on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # runs on http://localhost:5173
```

Set `VITE_API_URL` in `frontend/.env` if the backend runs on a different port:

```
VITE_API_URL=http://localhost:3001
```

---

## Pricing & Discounts

The rental price decreases as you accumulate more rental days on a specific phone:

| Days Rented | Discount |
|------------|----------|
| 0–29       | 0%       |
| 30–59      | 3%       |
| 60–89      | 6%       |
| 90–119     | 9%       |
| …          | …        |
| 300+       | 30% (max)|

**Formula**: `discount = floor(days / 30) × 3%`, capped at 30%.

Rental day history is persisted per phone in `localStorage` under the key `rap_rental_history`.

---

## Rent-to-Own

After accumulating **365 total rental days** on a specific phone, you become eligible for the **Rent-to-Own** programme. A progress bar on the phone detail page shows your progress.

The buy price for each phone is shown on the catalog cards and detail pages.

---

## Admin Panel

Visit `/admin` to manage the phone catalog.

### What you can do:
- **Edit** any phone's brand, model, tier, RAM, storage, condition, prices, image, availability
- **Add** new phones to the catalog
- **Delete** phones from the catalog
- **Reset to Defaults** to restore the original 8-phone catalog

All changes are saved to `localStorage` under key `rap_catalog` and loaded on every page visit.

> **Note**: The admin panel is frontend-only. Changes persist in the browser but do not sync to the backend database.

---

## Adding New Phone Images

1. Create an SVG or PNG file (recommended: 200×400px portrait)
2. Place it in `frontend/public/assets/images/`
3. Register it in `frontend/src/data/catalog.ts` under `REPO_IMAGES`:

```ts
export const REPO_IMAGES: { label: string; path: string }[] = [
  // ...existing entries...
  { label: 'My New Phone', path: '/assets/images/my-new-phone.svg' },
]
```

4. The image will now appear in the Admin panel's image picker dropdown.

---

## Phone Tiers

| Tier     | Description                            | Examples                              |
|----------|----------------------------------------|---------------------------------------|
| Budget   | Great performance, affordable price    | Galaxy A54, OnePlus Nord CE 3         |
| Mid-Tier | Balanced features for everyday use     | iPhone 14, Pixel 7a                   |
| Premium  | Top-of-the-line flagship experience    | iPhone 15 Pro, Galaxy S24 Ultra       |

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, TypeScript, Vite        |
| Styling  | Plain CSS (design system)         |
| Routing  | React Router v6                   |
| HTTP     | Axios                             |
| Backend  | Express.js, TypeScript            |
| Database | SQLite via better-sqlite3         |
| Auth     | JWT (jsonwebtoken + bcryptjs)     |
