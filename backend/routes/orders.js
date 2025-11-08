const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Create order (guest checkout - no auth required)
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      state,
      pincode,
      items,
      total_amount
    } = req.body;

    // Validation
    if (!customer_name || !customer_email || !customer_phone || !shipping_address || !city || !state || !pincode) {
      return res.status(400).json({ error: 'All customer details are required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    // Generate order number
    const orderNumber = 'BC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (
          order_number, customer_name, customer_email, customer_phone,
          shipping_address, city, state, pincode, total_amount, payment_status, order_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'pending')
        RETURNING *
      `, [orderNumber, customer_name, customer_email, customer_phone, shipping_address, city, state, pincode, total_amount]);

      const order = orderResult.rows[0];

      // Create order items and validate products
      for (const item of items) {
        // Verify product exists and is available
        const productResult = await client.query(`
          SELECT id, name, price, stock_quantity, images, seller_id
          FROM products
          WHERE id = $1 AND is_approved = true AND is_active = true
        `, [item.product_id]);

        if (productResult.rows.length === 0) {
          throw new Error(`Product ${item.product_id} not found or not available`);
        }

        const product = productResult.rows[0];

        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        // Create order item
        await client.query(`
          INSERT INTO order_items (
            order_id, product_id, seller_id, product_name, product_image,
            quantity, price, subtotal
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          order.id,
          product.id,
          product.seller_id,
          product.name,
          product.images && product.images.length > 0 ? product.images[0] : null,
          item.quantity,
          parseFloat(product.price),
          parseFloat(product.price) * item.quantity
        ]);

        // Update stock
        await client.query(`
          UPDATE products
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2
        `, [item.quantity, product.id]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order.id,
          order_number: order.order_number,
          total_amount: parseFloat(order.total_amount),
          payment_status: order.payment_status,
          order_status: order.order_status
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// Get order by order number (for guest tracking)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { email, phone } = req.query;

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number is required for tracking' });
    }

    let query = 'SELECT * FROM orders WHERE order_number = $1';
    const params = [orderNumber];

    if (email) {
      query += ' AND customer_email = $2';
      params.push(email);
    } else if (phone) {
      query += ' AND customer_phone = $2';
      params.push(phone);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];

    // Get order items
    const itemsResult = await pool.query(`
      SELECT oi.*, p.slug as product_slug
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [order.id]);

    res.json({
      order: {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        shipping_address: order.shipping_address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        total_amount: parseFloat(order.total_amount),
        payment_status: order.payment_status,
        order_status: order.order_status,
        razorpay_order_id: order.razorpay_order_id,
        created_at: order.created_at,
        updated_at: order.updated_at
      },
      items: itemsResult.rows.map(item => ({
        ...item,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal)
      }))
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get order by ID (with items)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(`
      SELECT oi.*, p.slug as product_slug
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);

    res.json({
      order: {
        ...order,
        total_amount: parseFloat(order.total_amount)
      },
      items: itemsResult.rows.map(item => ({
        ...item,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal)
      }))
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;

