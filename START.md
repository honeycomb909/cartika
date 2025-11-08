# 🚀 Start BreezyCart

## Quick Start

### Option 1: Start Both Servers (Recommended)

```bash
# Make sure Node.js is in PATH
export PATH="/opt/homebrew/bin:$PATH"

# Start both frontend and backend
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
export PATH="/opt/homebrew/bin:$PATH"
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
export PATH="/opt/homebrew/bin:$PATH"
cd frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Default Credentials

### Admin Login
- **URL**: http://localhost:3000/admin/login
- **Email**: admin@breezycart.com
- **Password**: admin123

### Seller Registration
- **URL**: http://localhost:3000/seller/register
- Create a new seller account

## Important Notes

### Node.js Path
Since Node.js was installed via Homebrew, add to your shell profile:

```bash
# Add to ~/.zshrc
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Or run with full path:
```bash
/opt/homebrew/bin/npm run dev
```

### Database
- Database: breezycart
- User: jay
- Already configured in `backend/.env`

## Troubleshooting

### Port Already in Use
If port 3000 or 5000 is in use:
- Change port in `backend/.env` (PORT=5001)
- Or kill the process using the port

### Database Connection Error
- Check PostgreSQL is running: `brew services list | grep postgresql`
- Verify database exists: `psql -l | grep breezycart`

### Node.js Not Found
- Add to PATH: `export PATH="/opt/homebrew/bin:$PATH"`
- Or use full path: `/opt/homebrew/bin/npm`

## Ready to Go! 🎉

Everything is set up and ready. Just run `npm run dev` and start using BreezyCart!

