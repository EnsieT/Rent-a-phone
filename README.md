# Rent-a-Phone 📱

A full-stack phone rental web application built with **React 18 + TypeScript + Vite** (frontend) and **Express + SQLite** (backend). Rent smartphones by the day with transparent MRP-based pricing, refundable deposits, and a membership programme.

> **Live Demo**: After hosting, update this link.

---

## Features

### Core Rental System
- Browse **30 phones** organised by tier — Budget, Mid-Tier, Premium
- Detailed specs per phone: RAM, Storage, **OS**, Condition, MRP, Buy Price
- Flexible rental booking with start/end date picker
- **Refundable deposit** equal to buy price on every rental
- **Volume discounts**: Every 30 days rented = 3% off daily rate (max 30%)
- **Rent-to-Own**: Rent for 365 cumulative days to become purchase-eligible

### Membership Programme (₹10,000/year)
- **₹9,000 off** every rental deposit
- **Exclusive access** to premium-only phones (iPhone 15 Pro Max, iPhone 15 Pro, Galaxy S24 Ultra, Galaxy Z Fold 5)
- Fully refundable membership fee
- Priority support & early access to new inventory
- Membership status page at `/membership`

### Payment System (Mock Razorpay-Style)
- **UPI** — QR code placeholder + quick-fill for Google Pay, Paytm, PhonePe, BHIM
- **Credit/Debit Card** — card number, expiry, CVV form
- **Net Banking** — SBI, HDFC, ICICI, Axis, Kotak, PNB bank selector
- All payments are simulated — no real charges

### Authentication & Security
- JWT-based auth with **7-day token expiry**
- Auto-logout on expired tokens (decoded client-side)
- Bcrypt password hashing
- Rate limiting on API endpoints
- Admin panel with separate login (`/admin-login`)

### UI & Marketing
- Modern CSS design system with tier-based colour coding
- Marketing sections on homepage — phone repair, try-before-buy, travel rentals, gifting
- Membership promo banner with benefits
- Responsive layout for mobile, tablet, desktop
- GSMArena product images for every phone (accurate model-specific photos)

---

## Project Structure

```
Rent-a-Phone/
├── frontend/                      # React 18 + TypeScript + Vite
│   ├── public/
│   │   └── assets/images/         # Fallback SVG
│   └── src/
│       ├── api/index.ts           # Axios client, types, API functions
│       ├── components/
│       │   ├── Navbar.tsx          # Nav bar with membership link
│       │   ├── PhoneCard.tsx       # Phone card with OS, deposit, premium badge
│       │   ├── ProtectedRoute.tsx  # Auth guard
│       │   └── RentalModal.tsx     # Date-picker rental modal
│       ├── context/
│       │   ├── AuthContext.tsx     # JWT auth + expiry check
│       │   └── CartContext.tsx     # Shopping cart state
│       ├── data/
│       │   └── catalog.ts         # 30 phones: images, specs, pricing, tiers
│       ├── pages/
│       │   ├── Home.tsx           # Hero + marketing + membership promo
│       │   ├── Phones.tsx         # Filterable phone grid
│       │   ├── PhoneDetail.tsx    # Full specs, deposit, rent-to-own progress
│       │   ├── Cart.tsx           # Cart with deposit totals
│       │   ├── Checkout.tsx       # Razorpay-style UPI/Card/NetBanking
│       │   ├── Membership.tsx     # Membership subscribe + status
│       │   ├── MyRentals.tsx      # User's rental history
│       │   ├── Login.tsx          # User login
│       │   ├── Register.tsx       # User registration
│       │   ├── Admin.tsx          # Phone catalog management
│       │   └── AdminLogin.tsx     # Admin authentication
│       ├── utils/
│       │   ├── catalogStore.ts    # localStorage catalog read/write
│       │   └── pricing.ts        # Discount & rent-to-own calculations
│       ├── App.tsx                # Routes
│       └── index.css              # Full design system (~2000 lines)
├── backend/
│   └── src/
│       ├── db.ts                  # SQLite setup, migrations, 30-phone seed
│       ├── index.ts               # Express entry, CORS, routes
│       ├── middleware/auth.ts     # JWT verification middleware
│       └── routes/
│           ├── phones.ts          # GET /api/phones (with OS, premium_only)
│           ├── auth.ts            # POST login/register (with membership status)
│           ├── rentals.ts         # POST/GET rentals (deposit, premium check)
│           └── membership.ts      # GET status, POST subscribe
├── scripts/
│   └── update-phones.ts           # CLI tool to update phone catalog
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** 18+ and **npm**
- Git

### 1. Clone the repository

```bash
git clone https://github.com/EnsieT/rent-a-phone.git
cd rent-a-phone
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file (or use the included `.env.example`):

```env
JWT_SECRET=change-me-in-production
PORT=3001
```

Start the backend:

```bash
npx tsx src/index.ts
# or: npm run dev  (uses ts-node-dev)
# Server runs at http://localhost:3001
```

The SQLite database is auto-created in `backend/data/rental.db` on first run with all 30 phones seeded.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

### 4. Open in browser

Visit **http://localhost:5173** — register an account and start browsing phones.

**Admin panel**: Go to `/admin-login` and log in with:
- Username: `admin`
- Password: `admin123`

---

## Pricing Model

### MRP → Buy Price → Rent Per Day

Each phone has an MRP (retail price). The **buy price** depends on condition:

| Condition | Factor | Example (MRP ₹1,00,000) |
|-----------|--------|--------------------------|
| Mint      | 85%    | ₹85,000                  |
| Like New  | 80%    | ₹80,000                  |
| Good      | 65%    | ₹65,000                  |
| Fair      | 50%    | ₹50,000                  |

**Rent per day** = `Math.round(buyPrice / 400)`

### Volume Discounts

| Days Rented | Discount |
|-------------|----------|
| 0–29        | 0%       |
| 30–59       | 3%       |
| 60–89       | 6%       |
| 90–119      | 9%       |
| …           | …        |
| 300+        | 30% (max)|

**Formula**: `discount = floor(days / 30) × 3%`, capped at 30%.

### Deposit

Every rental requires a **refundable deposit = buy price**. Members get **₹9,000 off** each deposit.

### Rent-to-Own

After **365 cumulative rental days** on a specific phone, you become eligible for the rent-to-own programme.

---

## Membership

| Feature                    | Detail                           |
|----------------------------|----------------------------------|
| Price                      | ₹10,000 / year                   |
| Deposit discount           | ₹9,000 off every rental deposit  |
| Premium phone access       | 4 exclusive flagship devices      |
| Refund policy              | 100% refundable                  |
| Priority support           | ✓                                |

Premium-only phones: iPhone 15 Pro Max, iPhone 15 Pro, Galaxy S24 Ultra, Galaxy Z Fold 5.

---

## Updating Phone Catalog

### Quick method — Edit `catalog.ts`

The frontend phone catalog lives in `frontend/src/data/catalog.ts`. Each phone entry looks like:

```ts
{
  id: 31,
  brand: 'Samsung',
  model: 'Galaxy S25',
  description: 'Latest Samsung flagship.',
  tier: 'premium',        // 'budget' | 'mid-tier' | 'premium'
  imagePath: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25.jpg',
  ram: '12 GB',
  storage: '256 GB',
  os: 'Android 15 (One UI 7)',
  condition: 'Mint',       // 'Mint' | 'Like New' | 'Good' | 'Fair'
  mrp: 79999,
  available: true,
  premiumOnly: false,      // true = members only
}
```

Buy price and rent/day are auto-calculated from MRP × condition factor.

### CLI Script — `scripts/update-phones.ts`

A guided script to add, edit, or remove phones from both catalog files at once:

```bash
npx tsx scripts/update-phones.ts
```

This will prompt you to:
1. **List** all current phones
2. **Add** a new phone (guided prompts)
3. **Edit** an existing phone by ID
4. **Remove** a phone by ID
5. **Find image URL** — opens GSMArena search tips

Changes are written to both `frontend/src/data/catalog.ts` and `backend/src/db.ts`.

### Finding phone images

All images use GSMArena product photos. To find an image URL for a new phone:

1. Go to [gsmarena.com](https://www.gsmarena.com)
2. Search for the phone model
3. Right-click the main product image → **Copy image address**
4. The URL format is: `https://fdn2.gsmarena.com/vv/bigpic/{phone-slug}.jpg`

---

## Phone Tiers

| Tier     | MRP Range         | Examples                                        |
|----------|-------------------|-------------------------------------------------|
| Budget   | Under ₹20,000     | Redmi Note 13 Pro, Galaxy M34, Poco X5 Pro      |
| Mid-Tier | ₹20,000 – ₹50,000 | iPhone 14, Pixel 7a, Nothing Phone (2)           |
| Premium  | ₹50,000+          | iPhone 15 Pro Max, Galaxy S24 Ultra, OnePlus 12  |

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, TypeScript, Vite          |
| Styling  | Plain CSS (custom design system)    |
| Routing  | React Router v6                     |
| HTTP     | Axios                               |
| Backend  | Express.js, TypeScript              |
| Database | SQLite via better-sqlite3           |
| Auth     | JWT (jsonwebtoken + bcryptjs)       |
| Images   | GSMArena product photos             |

---

## API Endpoints

| Method | Endpoint              | Auth | Description                        |
|--------|-----------------------|------|------------------------------------|
| GET    | `/api/phones`         | No   | List all phones (with OS, tier)    |
| POST   | `/api/auth/register`  | No   | Register new user                  |
| POST   | `/api/auth/login`     | No   | Login, returns JWT + membership    |
| GET    | `/api/rentals`        | JWT  | Get user's rentals                 |
| POST   | `/api/rentals`        | JWT  | Create rental (deposit calculated) |
| GET    | `/api/membership/status` | JWT | Check membership status          |
| POST   | `/api/membership/subscribe` | JWT | Subscribe to membership       |

---

## Hosting on GitHub Pages (Frontend) + Render/Railway (Backend)

See the **Hosting Guide** section below for step-by-step deployment instructions.

### Option A: GitHub Pages (Frontend Only — Static)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. The output goes to `frontend/dist/`.
3. Push to GitHub and enable Pages in repo Settings → Pages → Source: `gh-pages` branch.
4. Use the `gh-pages` npm package:
   ```bash
   npm install -D gh-pages
   ```
   Add to `frontend/package.json` scripts:
   ```json
   "deploy": "gh-pages -d dist"
   ```
   Then run:
   ```bash
   npm run build && npm run deploy
   ```

> **Note**: GitHub Pages only serves static files. You need a separate backend host.

### Option B: Render (Full-Stack — Recommended)

**Backend**:
1. Create a [Render](https://render.com) account
2. New → Web Service → connect your GitHub repo
3. Root directory: `backend`
4. Build command: `npm install && npm run build`
5. Start command: `node dist/index.js`
6. Add environment variable: `JWT_SECRET=your-secret-here`

**Frontend**:
1. New → Static Site → connect same repo
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`

### Option C: Railway (One-Click)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub → select this repo
3. Add two services: one for `backend/`, one for `frontend/`
4. Set environment variables as above
5. Railway auto-detects Node.js and deploys both

### Option D: Vercel (Frontend) + Render (Backend)

1. Import the repo into [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. It auto-detects Vite and deploys
4. Set `VITE_API_URL` environment variable to your Render backend URL

---

## Environment Variables

### Backend (`backend/.env`)

| Variable     | Default                    | Description        |
|--------------|----------------------------|--------------------|
| `JWT_SECRET` | `change-me-in-production`  | JWT signing secret |
| `PORT`       | `3001`                     | Server port        |

### Frontend

| Variable       | Default                  | Description         |
|----------------|--------------------------|---------------------|
| `VITE_API_URL` | `http://localhost:3001`  | Backend API base URL|

---

## Resetting Data

- **Delete database**: Remove `backend/data/` folder. A fresh DB is seeded on next server start.
- **Clear browser data**: Open DevTools → Application → Local Storage → Clear. This resets the frontend catalog and rental history.
- **Admin reset**: Use the "Reset to Defaults" button in the Admin panel.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT
