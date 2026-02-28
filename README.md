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
| GET | /api/phones/:id | No | Phone details |
| GET | /api/rentals | Yes | My rentals |
| POST | /api/rentals | Yes | Create rental |
| DELETE | /api/rentals/:id | Yes | Cancel rental |

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express app (port 3001)
│   │   ├── db.ts             # SQLite setup, migrations, seed data
│   │   ├── middleware/auth.ts # JWT middleware
│   │   └── routes/
│   │       ├── auth.ts
│   │       ├── phones.ts
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
