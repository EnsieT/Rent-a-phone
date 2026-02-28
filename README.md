# Rent-a-Phone 📱

A full-stack phone rental website built with Node.js + Express (backend) and React + TypeScript (frontend).

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, SQLite (better-sqlite3), JWT auth, bcrypt
- **Frontend**: React 18, TypeScript, Vite, React Router v6, Axios

## Features

- Browse available phones with pricing
- User registration and login (JWT-based auth)
- Rent a phone by selecting start/end dates
- Live total price calculation
- View and cancel your rentals
- Availability check to prevent double-booking

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env    # edit JWT_SECRET
npm run dev             # starts on http://localhost:3001
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:5173
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register a new user |
| POST | /api/auth/login | No | Login |
| GET | /api/phones | No | List all phones |
| GET | /api/phones/:id | No | Phone details (includes `current_price_inr`) |
| GET | /api/quote?phone_id=&days=&intent= | No | Price quote breakdown |
| GET | /api/rentals | Yes | My rentals |
| POST | /api/rentals | Yes | Create rental |
| DELETE | /api/rentals/:id | Yes | Cancel rental |

### Quote endpoint

`GET /api/quote?phone_id=1&days=10&intent=rent`

Returns a full pricing breakdown based on INR depreciation model:

```json
{
  "phone_id": 1,
  "days": 10,
  "intent": "rent",
  "current_price_inr": 101200,
  "deposit_inr": 101200,
  "base_daily_inr": 253.00,
  "discount_pct": 0.18,
  "effective_daily_inr": 207.46,
  "rent_total_inr": 2074.60,
  "grand_total_inr": 103274.60
}
```

**Pricing rules:**
- `current_price_inr = round_to_100(msrp_inr × 0.75^age_years)`
- `base_daily_inr = current_price_inr / 400`
- `discount_pct = min(0.30, 0.02 × (days − 1))` — 2% per extra day, capped at 30%
- `effective_daily_inr = base_daily_inr × (1 − discount_pct)`
- `rent_total_inr = effective_daily_inr × days`
- `deposit_inr = current_price_inr` (refundable)
- `grand_total_inr = rent_total_inr + deposit_inr` (for rent intent)

**Constraints:** `1 ≤ days ≤ 100`

## Running Tests

```bash
cd backend
npm test   # runs Jest unit tests for quote calculations
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express app (port 3001)
│   │   ├── db.ts             # SQLite setup, migrations, seed data
│   │   ├── middleware/auth.ts # JWT middleware
│   │   ├── lib/
│   │   │   ├── quote.ts      # Pricing/quote calculation helpers
│   │   │   └── quote.test.ts # Unit tests (Jest)
│   │   └── routes/
│   │       ├── auth.ts
│   │       ├── phones.ts
│   │       ├── quote.ts      # GET /api/quote
│   │       └── rentals.ts
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/index.ts       # Axios API client
    │   ├── context/AuthContext.tsx
    │   ├── components/        # Navbar, PhoneCard, RentalModal, ProtectedRoute
    │   └── pages/             # Home, Phones, PhoneDetail, Login, Register, MyRentals
    └── package.json
```
