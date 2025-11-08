const jwt = require('jsonwebtoken');
const pool = require('../database/db');

// Verify JWT token for sellers
const authenticateSeller = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify seller exists and is active
    const result = await pool.query(
      'SELECT id, name, email, is_active, is_verified FROM sellers WHERE id = $1',
      [decoded.sellerId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Seller not found' });
    }

    if (!result.rows[0].is_active) {
      return res.status(401).json({ error: 'Seller account is inactive' });
    }

    req.seller = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Verify JWT token for admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify admin exists and is active
    const result = await pool.query(
      'SELECT id, email, name, role FROM admin_users WHERE id = $1 AND is_active = true',
      [decoded.adminId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Admin not found or inactive' });
    }

    req.admin = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = {
  authenticateSeller,
  authenticateAdmin
};

