const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/db');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin
    const result = await pool.query(
      'SELECT id, email, password, name, role, is_active FROM admin_users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current admin profile
router.get('/me', require('../middleware/auth').authenticateAdmin, async (req, res) => {
  try {
    res.json({ admin: req.admin });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;

