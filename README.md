# BreezyCart 🛍️

Shopping that feels light — fast, fun, and effortless.

## Overview

BreezyCart is a modern, minimal shopping platform where users can browse, discover, and buy products without friction — no login, no clutter. Sellers can easily register, list, and manage their products.

## Features

### Buyer Features
- 🏠 Homepage feed with featured products
- 🔍 Product listing & search
- 📦 Product detail page
- 🛒 Cart & Checkout (no login required)
- ✅ Order confirmation
- 💳 Payment integration (Razorpay)
- 🎨 Dark mode / pastel theme toggle
- 📱 Guest order tracking
- ✨ Fun micro-interactions

### Seller Features
- 👤 Seller registration
- 📊 Seller dashboard
- 💰 Sales dashboard
- 📸 Image uploader
- 📈 Analytics (Phase 2)

### Admin Features
- ✅ Product moderation
- 👥 User & seller management
- 📦 Order management
- 📊 Reports & analytics
- 🎨 CMS for homepage banners

## Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **Axios** - API calls

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Razorpay** - Payment gateway
- **Multer** - File uploads

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AI_project
```

2. Install dependencies
```bash
npm run install:all
```

3. Set up the database
```bash
# Create PostgreSQL database
createdb breezycart

# Run migrations (SQL file will be provided)
psql breezycart < backend/database/schema.sql
```

4. Configure environment variables
```bash
cd backend
cp .env.example .env
# Edit .env with your database and Razorpay credentials
```

5. Start the development servers
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
breezycart/
├── frontend/          # Next.js frontend
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and API clients
│   └── store/        # State management
├── backend/          # Express backend
│   ├── routes/       # API routes
│   ├── models/       # Database models
│   ├── middleware/   # Auth & validation
│   ├── controllers/  # Business logic
│   └── database/     # Database schema & migrations
└── README.md
```

## Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend
```

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (AWS/Render)
- Set environment variables
- Configure PostgreSQL connection
- Deploy using PM2 or similar

## License

MIT

