const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { authenticateAdmin } = require('../middleware/auth');

// Get all products for moderation
router.get('/products', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, s.name as seller_name, s.email as seller_email, c.name as category_name,
             COUNT(*) OVER() as total_count
      FROM products p
      LEFT JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status === 'pending') {
      query += ` AND p.is_approved = false`;
    } else if (status === 'approved') {
      query += ` AND p.is_approved = true`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      products: result.rows.map(row => ({
        ...row,
        price: parseFloat(row.price),
        compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price) : null
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
        totalPages: Math.ceil((result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products for moderation:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Approve product
router.post('/products/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE products
      SET is_approved = true, is_active = true
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product approved successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ error: 'Failed to approve product' });
  }
});

// Reject product
router.post('/products/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await pool.query(`
      UPDATE products
      SET is_approved = false, is_active = false
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product rejected',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({ error: 'Failed to reject product' });
  }
});

// Get all sellers
router.get('/sellers', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT s.*, 
             COUNT(p.id) as product_count,
             COUNT(*) OVER() as total_count
      FROM sellers s
      LEFT JOIN products p ON s.id = p.seller_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      sellers: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        business_name: row.business_name,
        is_verified: row.is_verified,
        is_active: row.is_active,
        product_count: parseInt(row.product_count),
        created_at: row.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
        totalPages: Math.ceil((result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

// Toggle seller status
router.post('/sellers/:id/toggle-status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE sellers
      SET is_active = NOT is_active
      WHERE id = $1
      RETURNING id, name, email, is_active
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json({
      message: `Seller ${result.rows[0].is_active ? 'activated' : 'deactivated'} successfully`,
      seller: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling seller status:', error);
    res.status(500).json({ error: 'Failed to toggle seller status' });
  }
});

// Get all orders
router.get('/orders', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, COUNT(*) OVER() as total_count
      FROM orders o
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND o.order_status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      orders: result.rows.map(row => ({
        ...row,
        total_amount: parseFloat(row.total_amount)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
        totalPages: Math.ceil((result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/orders/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const result = await pool.query(`
      UPDATE orders
      SET order_status = $1
      WHERE id = $2
      RETURNING *
    `, [order_status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get dashboard stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    // Product stats
    const productStats = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE is_approved = true) as approved_products,
        COUNT(*) FILTER (WHERE is_approved = false) as pending_products
      FROM products
    `);

    // Seller stats
    const sellerStats = await pool.query(`
      SELECT 
        COUNT(*) as total_sellers,
        COUNT(*) FILTER (WHERE is_active = true) as active_sellers,
        COUNT(*) FILTER (WHERE is_verified = true) as verified_sellers
      FROM sellers
    `);

    // Order stats
    const orderStats = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        SUM(total_amount) FILTER (WHERE payment_status = 'paid') as paid_revenue,
        COUNT(*) FILTER (WHERE order_status = 'pending') as pending_orders
      FROM orders
    `);

    res.json({
      products: {
        total: parseInt(productStats.rows[0].total_products),
        approved: parseInt(productStats.rows[0].approved_products),
        pending: parseInt(productStats.rows[0].pending_products)
      },
      sellers: {
        total: parseInt(sellerStats.rows[0].total_sellers),
        active: parseInt(sellerStats.rows[0].active_sellers),
        verified: parseInt(sellerStats.rows[0].verified_sellers)
      },
      orders: {
        total: parseInt(orderStats.rows[0].total_orders || 0),
        totalRevenue: parseFloat(orderStats.rows[0].total_revenue || 0),
        paidRevenue: parseFloat(orderStats.rows[0].paid_revenue || 0),
        pending: parseInt(orderStats.rows[0].pending_orders || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;

