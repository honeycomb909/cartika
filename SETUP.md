# BreezyCart Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for both frontend and backend.

### 2. Database Setup

1. Create PostgreSQL database:
```bash
createdb breezycart
```

2. Run the schema SQL:
```bash
psql breezycart < backend/database/schema.sql
```

3. Create admin user:
```bash
cd backend
node scripts/createAdmin.js
```

This will create an admin user with:
- Email: admin@breezycart.com
- Password: admin123

### 3. Environment Configuration

1. Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=breezycart
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Razorpay Configuration (Test Mode - FREE)
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Admin Credentials
ADMIN_EMAIL=admin@breezycart.com
ADMIN_PASSWORD=admin123
```

3. For Razorpay (FREE Test Mode):
   - Sign up at https://razorpay.com (free account)
   - Get test API keys from dashboard
   - Use test keys in `.env` file

### 4. Create Uploads Directory

```bash
mkdir -p backend/uploads
```

### 5. Start Development Servers

```bash
npm run dev
```

This will start both frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

## Testing

### Run All Tests
```bash
npm test
```

### Run Frontend Tests
```bash
npm run test:frontend
```

### Run Backend Tests
```bash
npm run test:backend
```

## Usage

### As a Buyer
1. Visit http://localhost:3000
2. Browse products
3. Add items to cart
4. Checkout (no login required)
5. Complete payment via Razorpay test mode
6. Track order using order number and email/phone

### As a Seller
1. Visit http://localhost:3000/seller/register
2. Create seller account
3. Login at http://localhost:3000/seller/login
4. Add products from dashboard
5. Wait for admin approval
6. View sales and analytics

### As an Admin
1. Login at http://localhost:3000/admin/login
2. Use credentials: admin@breezycart.com / admin123
3. Approve/reject products
4. Manage sellers and orders
5. View analytics

## Features

### ✅ Implemented (MVP)
- ✅ Product browsing and search
- ✅ Shopping cart (guest checkout)
- ✅ Razorpay payment integration (test mode)
- ✅ Seller registration and dashboard
- ✅ Product listing by sellers
- ✅ Admin product moderation
- ✅ Order management
- ✅ Guest order tracking
- ✅ Dark/light mode toggle
- ✅ Responsive design
- ✅ Micro-interactions with Framer Motion

### 🔄 Phase 2 (Future Enhancements)
- Seller dashboard analytics
- Reviews & ratings
- Recommendation engine
- AI-generated descriptions
- Advanced search
- Delivery partner integration

## Tech Stack

### Frontend
- Next.js 14 (React)
- TypeScript
- TailwindCSS
- Framer Motion
- Zustand (state management)
- Axios

### Backend
- Node.js
- Express
- PostgreSQL
- JWT authentication
- Razorpay (payment gateway)
- Multer (file uploads)

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l | grep breezycart`

### Payment Issues
- Ensure Razorpay test keys are correctly set
- Test mode doesn't require real payment
- Check Razorpay dashboard for test transactions

### File Upload Issues
- Ensure `backend/uploads` directory exists
- Check file permissions
- Verify `MAX_FILE_SIZE` in `.env`

## Production Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (Render/AWS)
1. Set environment variables
2. Configure PostgreSQL connection
3. Run database migrations
4. Deploy with PM2 or similar

## License

MIT

