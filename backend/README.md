# GroceryDeliveryFrontend — Backend

Node.js + Express + MongoDB API for the [GroceryDeliveryFrontend](https://github.com/kritika8006/GroceryDelieveryFrontend) React app.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run seed            # creates sample products + an admin user (admin@example.com / admin123)
npm run dev              # starts on http://localhost:5000
```

Requires a running MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster — paste its connection string into `MONGO_URI`).

## Connecting the frontend

In `frontend`, create a `.env` with:
```
VITE_API_URL=http://localhost:5000/api
```

Then replace the dummy-data imports (`src/assets/assets.ts`) in each page with real calls, e.g.:

```ts
const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
const { products } = await res.json();
```

Store the JWT from `/api/auth/login` (e.g. in localStorage as `token`) and send it as
`Authorization: Bearer <token>` on every request that needs `protect`/`isAdmin`.

For live order tracking, connect a socket and join the order's room:
```ts
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));
socket.emit("joinOrder", orderId);
socket.on("orderUpdated", (order) => setOrder(order));
```

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/signup | — | Create account |
| POST | /api/auth/login | — | Get JWT |
| GET | /api/auth/me | user | Current user |
| GET | /api/products | — | List/search/filter products |
| GET | /api/products/deals | — | Discounted products (FlashDeals) |
| GET | /api/products/:id | — | Single product |
| POST/PUT/DELETE | /api/products(/:id) | admin | Manage catalog |
| GET/POST/PUT/DELETE | /api/addresses(/:id) | user | Saved addresses |
| POST | /api/orders | user | Checkout |
| GET | /api/orders | user | My orders |
| GET | /api/orders/:id | user/admin | Order + tracking detail |
| PUT | /api/orders/:id/status | admin | Update status/location/partner |
| POST | /api/orders/:id/verify-otp | user | Confirm delivery via OTP |
| GET | /api/admin/dashboard | admin | Stats for AdminDashboard |
| GET | /api/admin/orders | admin | All orders |
| GET/POST/PUT | /api/admin/delivery-partners(/:id) | admin | Manage delivery partners |

## Project structure

```
backend/
  server.js              Express app + Socket.io setup
  src/
    config/db.js         Mongo connection
    models/               User, Product, Order, DeliveryPartner
    middleware/            auth (JWT), error handler
    controllers/            business logic per resource
    routes/                 route <-> controller wiring
    utils/                  token + OTP generators
    seed/seed.js            sample data loader
```
