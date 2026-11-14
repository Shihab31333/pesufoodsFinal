# PESUFOODS

PESUFOODS is a MERN campus food ordering application with a React/Vite client and an Express/Mongoose API.

## Prerequisites

- Node.js 18+
- MongoDB 6+ running locally
- For checkout transactions, MongoDB must run as a single-node replica set.

## Setup

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run seed
npm run seed:admin
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:5000`.

The default admin is `admin@pesufoods.local` / `Admin@12345`. Change these values in `.env` before running `seed:admin`.

## MongoDB replica set

Transactions are intentionally required for checkout so inventory decrement and order creation are consistent. Start a local MongoDB instance with a replica set, for example:

```powershell
mongod --dbpath C:\data\db --replSet rs0
mongosh --eval "rs.initiate()"
```

Use `mongodb://127.0.0.1:27017/pesufoodsMern?replicaSet=rs0` as `MONGO_URI`. If the server is not running as a replica set, checkout fails explicitly instead of using an unsafe inventory fallback.

## Seed data

`npm run seed` is idempotent and creates three canteens and 36 menu items using stable seed keys. It does not overwrite existing seeded records, so admin edits are preserved. `npm run seed:admin` creates or promotes the single admin account.

## API

- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/canteens`, `GET /api/canteens/:id`
- `GET /api/menu`, `GET /api/menu/:id` (supports `q`, `canteen`, `category`, `available`, and `sort`)
- Admin can create, update, and delete canteens and menu items with the corresponding POST/PUT/DELETE routes.
- `POST /api/orders/checkout`, `GET /api/orders/my-orders`, `PATCH /api/orders/:id/cancel`
- Admin: `GET /api/orders`, `PATCH /api/orders/:id/status`, `GET /api/admin/dashboard`, `GET /api/admin/users`, `GET /api/admin/inventory`

## Data and safety

The database is `pesufoodsMern` with `users`, `canteens`, `menuitems`, and `orders` collections. The browser cart is persisted in local storage and is restricted to one canteen. Cart prices and stock are display-only; checkout re-reads both from MongoDB. A payment is simulated, then conditional atomic stock decrements run inside a MongoDB transaction before the order is created. Idempotency keys prevent duplicate checkout requests. Cancellation restores stock once and stores order snapshots.

Food images are public Unsplash URLs with a browser fallback image. No real payment provider is connected.
