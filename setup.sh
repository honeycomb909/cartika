#!/bin/bash

# BreezyCart Setup Script
# This script automates the setup process

set -e  # Exit on error

echo "🚀 Starting BreezyCart Setup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Or install using Homebrew: brew install node"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed.${NC}"
    echo "Please install PostgreSQL: brew install postgresql@14"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version:$(node --version)${NC}"
echo -e "${GREEN}✅ npm version:$(npm --version)${NC}"
echo -e "${GREEN}✅ PostgreSQL found${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Step 1: Installing dependencies...${NC}"
npm run install:all
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Database setup
echo -e "${YELLOW}🗄️  Step 2: Setting up database...${NC}"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw breezycart; then
    echo -e "${YELLOW}⚠️  Database 'breezycart' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        dropdb breezycart || true
        createdb breezycart
        echo -e "${GREEN}✅ Database recreated${NC}"
    else
        echo -e "${YELLOW}⚠️  Using existing database${NC}"
    fi
else
    createdb breezycart
    echo -e "${GREEN}✅ Database created${NC}"
fi

# Run schema
echo "Running database schema..."
psql breezycart < backend/database/schema.sql
echo -e "${GREEN}✅ Database schema applied${NC}"
echo ""

# Step 3: Create admin user
echo -e "${YELLOW}👤 Step 3: Creating admin user...${NC}"
cd backend
node scripts/createAdmin.js
cd ..
echo -e "${GREEN}✅ Admin user created${NC}"
echo ""

# Step 4: Create uploads directory
echo -e "${YELLOW}📁 Step 4: Creating uploads directory...${NC}"
mkdir -p backend/uploads
echo -e "${GREEN}✅ Uploads directory created${NC}"
echo ""

# Step 5: Environment check
echo -e "${YELLOW}⚙️  Step 5: Checking environment configuration...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env file not found. Creating from template...${NC}"
    cp backend/.env.example backend/.env 2>/dev/null || echo "Please create backend/.env manually"
fi

# Check Razorpay keys
if grep -q "test_secret_key_replace" backend/.env; then
    echo -e "${YELLOW}⚠️  Razorpay keys need to be configured in backend/.env${NC}"
    echo "   Get test keys from: https://dashboard.razorpay.com/app/keys"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure Razorpay keys in backend/.env (optional for testing)"
echo "2. Start the application: npm run dev"
echo "3. Visit http://localhost:3000"
echo ""
echo "Default Admin Credentials:"
echo "  Email: admin@breezycart.com"
echo "  Password: admin123"
echo ""

