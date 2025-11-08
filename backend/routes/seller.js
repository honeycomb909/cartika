const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { authenticateSeller } = require('../middleware/auth');

// Get seller's products
router.get('/products', authenticateSeller, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name,
             COUNT(*) OVER() as total_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.seller_id = $1
    `;
    const params = [req.seller.id];
    let paramCount = 1;

    if (status === 'approved') {
      query += ` AND p.is_approved = true AND p.is_active = true`;
    } else if (status === 'pending') {
      query += ` AND p.is_approved = false`;
    } else if (status === 'rejected') {
      query += ` AND p.is_approved = false AND p.is_active = false`;
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
    console.error('Error fetching seller products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get seller dashboard stats
router.get('/dashboard', authenticateSeller, async (req, res) => {
  try {
    // Get product stats
    const productStats = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE is_approved = true AND is_active = true) as approved_products,
        COUNT(*) FILTER (WHERE is_approved = false) as pending_products,
        SUM(views_count) as total_views
      FROM products
      WHERE seller_id = $1
    `, [req.seller.id]);

    // Get order stats
    const orderStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        SUM(oi.quantity) as total_items_sold,
        SUM(oi.subtotal) as total_revenue,
        SUM(oi.subtotal) FILTER (WHERE o.payment_status = 'paid') as paid_revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.seller_id = $1
    `, [req.seller.id]);

    // Get recent orders
    const recentOrders = await pool.query(`
      SELECT 
        o.id,
        o.order_number,
        o.customer_name,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.created_at,
        SUM(oi.quantity) as item_count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.seller_id = $1
      GROUP BY o.id, o.order_number, o.customer_name, o.total_amount, o.order_status, o.payment_status, o.created_at
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [req.seller.id]);

    res.json({
      productStats: {
        total: parseInt(productStats.rows[0].total_products),
        approved: parseInt(productStats.rows[0].approved_products),
        pending: parseInt(productStats.rows[0].pending_products),
        totalViews: parseInt(productStats.rows[0].total_views || 0)
      },
      orderStats: {
        totalOrders: parseInt(orderStats.rows[0].total_orders || 0),
        totalItemsSold: parseInt(orderStats.rows[0].total_items_sold || 0),
        totalRevenue: parseFloat(orderStats.rows[0].total_revenue || 0),
        paidRevenue: parseFloat(orderStats.rows[0].paid_revenue || 0)
      },
      recentOrders: recentOrders.rows.map(row => ({
        ...row,
        total_amount: parseFloat(row.total_amount)
      }))
    });
  } catch (error) {
    console.error('Error fetching seller dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;

