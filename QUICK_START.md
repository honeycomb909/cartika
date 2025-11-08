# Quick Start Guide

## Prerequisites

Before starting, make sure you have:

1. **Node.js 18+** installed
   ```bash
   # Check if installed
   node --version
   
   # If not installed, use Homebrew (macOS):
   brew install node
   ```

2. **PostgreSQL 14+** installed
   ```bash
   # Check if installed
   psql --version
   
   # If not installed, use Homebrew (macOS):
   brew install postgresql@14
   brew services start postgresql@14
   ```

3. **npm** (comes with Node.js)

## Automated Setup (Recommended)

Run the setup script:

```bash
./setup.sh
```

This will:
- ✅ Install all dependencies
- ✅ Create the database
- ✅ Run the database schema
- ✅ Create admin user
- ✅ Setup directories
- ✅ Check configuration

## Manual Setup

If you prefer manual setup or the script fails:

### Step 1: Install Dependencies

```bash
npm run install:all
```

### Step 2: Create Database

```bash
# Create database
createdb breezycart

# Run schema
psql breezycart < backend/database/schema.sql
```

### Step 3: Create Admin User

```bash
cd backend
node scripts/createAdmin.js
cd ..
```

### Step 4: Configure Environment

The `.env` file is already created with defaults. Edit if needed:

```bash
# Edit backend/.env if needed
# Important: Set your database password if different from 'postgres'
# Optional: Set Razorpay test keys for payment testing
```

### Step 5: Create Uploads Directory

```bash
mkdir -p backend/uploads
```

## Start the Application

```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## First Time Login

### Admin
- Email: `admin@breezycart.com`
- Password: `admin123`

### Seller
- Register at: http://localhost:3000/seller/register

## Troubleshooting

### Node.js not found
```bash
# Install Node.js
brew install node

# Or download from https://nodejs.org/
```

### PostgreSQL not found
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14
```

### Database connection error
1. Check if PostgreSQL is running:
   ```bash
   brew services list | grep postgresql
   ```

2. Check database credentials in `backend/.env`

3. Try creating database manually:
   ```bash
   createdb breezycart
   ```

### Port already in use
- Change port in `backend/.env` (PORT=5001)
- Or kill the process using the port

## Next Steps

1. ✅ Setup complete
2. 🌐 Visit http://localhost:3000
3. 👤 Login as admin
4. 🛍️ Register as seller
5. 🛒 Start shopping!

## Need Help?

- Check `SETUP.md` for detailed setup instructions
- Check `README.md` for general information
- Check `FEATURES.md` for feature list

