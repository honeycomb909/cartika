const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_approved = true AND p.is_active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    res.json({
      categories: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        product_count: parseInt(row.product_count || 0)
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;

