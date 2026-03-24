# DP_Restaurant
=================
# Restaurant Online Ordering System

A modern full-stack restaurant website built with Next.js 16, MongoDB, JWT auth, and Tailwind CSS v4.

## Features

- 🍽️ **Public Menu** — Browse, filter by category, add to cart
- 🛒 **Cart & Checkout** — Local cart state, delivery form, payment selection
- 💳 **Payments** — Cash on Delivery + simulated online payment
- 🔐 **Admin Dashboard** — Login, analytics, CRUD menu items, manage orders
- 📊 **Analytics** — Total orders, revenue, status breakdown
- 📱 **Responsive** — Works beautifully on mobile, tablet, and desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | MongoDB (Atlas compatible) |
| Auth | JWT + bcrypt |
| Styling | Tailwind CSS v4 |
| Notifications | react-hot-toast |
| Icons | react-icons |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.env.local` in the project root:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/restaurant?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install dotenv (for seed script)
```bash
npm install dotenv
```

### 4. Seed the database
```bash
npm run seed
```
This creates:
- **Admin user**: `admin@restaurant.com` / `admin123`
- **10 sample menu items** across 5 categories

### 5. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/        # login, register, logout
│   │   ├── menu/        # GET (public), POST/PUT/DELETE (admin)
│   │   ├── orders/      # POST (public), GET/PATCH (admin)
│   │   └── admin/stats/ # dashboard analytics
│   ├── admin/           # dashboard, menu CRUD, orders
│   ├── menu/            # public menu page
│   ├── cart/            # cart page
│   ├── checkout/        # checkout form
│   ├── order-confirmation/
│   ├── layout.js
│   └── page.js          # homepage
├── components/          # Navbar, Footer, MenuCard
├── context/             # CartContext
├── lib/                 # db.js, auth.js
├── models/              # User, MenuItem, Order
└── middleware.js         # admin route protection
```

## User Roles

| Role | Access |
|------|--------|
| Guest | Browse menu, add to cart, place orders |
| Admin | Dashboard, CRUD menu items, manage orders |

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy — zero config needed for Next.js

## License

MIT
>>>>>>> 46cb45f (Initial commit)
