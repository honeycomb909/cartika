const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/db');
const validator = require('validator');

// Seller registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, business_name, business_address, gst_number } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingSeller = await pool.query(
      'SELECT id FROM sellers WHERE email = $1',
      [email]
    );

    if (existingSeller.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create seller
    const result = await pool.query(`
      INSERT INTO sellers (name, email, password, phone, business_name, business_address, gst_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, phone, business_name, is_verified, is_active, created_at
    `, [name, email, hashedPassword, phone || null, business_name || null, business_address || null, gst_number || null]);

    const seller = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { sellerId: seller.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Seller registered successfully',
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        business_name: seller.business_name,
        is_verified: seller.is_verified,
        is_active: seller.is_active
      },
      token
    });
  } catch (error) {
    console.error('Error registering seller:', error);
    res.status(500).json({ error: 'Failed to register seller' });
  }
});

// Seller login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find seller
    const result = await pool.query(
      'SELECT id, name, email, password, phone, business_name, is_verified, is_active FROM sellers WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const seller = result.rows[0];

    if (!seller.is_active) {
      return res.status(401).json({ error: 'Account is inactive. Please contact admin.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, seller.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { sellerId: seller.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        business_name: seller.business_name,
        is_verified: seller.is_verified,
        is_active: seller.is_active
      },
      token
    });
  } catch (error) {
    console.error('Error logging in seller:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current seller profile
router.get('/me', require('../middleware/auth').authenticateSeller, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, business_name, business_address, gst_number, is_verified, is_active, created_at FROM sellers WHERE id = $1',
      [req.seller.id]
    );

    res.json({ seller: result.rows[0] });
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;

