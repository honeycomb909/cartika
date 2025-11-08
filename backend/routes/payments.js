const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../database/db');

// Initialize Razorpay (using test keys - FREE)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Test key (free)
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key' // Test secret (free)
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { order_id, amount, currency = 'INR' } = req.body;

    if (!order_id || !amount) {
      return res.status(400).json({ error: 'Order ID and amount are required' });
    }

    // Verify order exists
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: currency,
      receipt: order.order_number,
      notes: {
        order_id: order.id,
        order_number: order.order_number
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update order with Razorpay order ID
    await pool.query(
      'UPDATE orders SET razorpay_order_id = $1 WHERE id = $2',
      [razorpayOrder.id, order.id]
    );

    res.json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: razorpay.key_id
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return res.status(400).json({ error: 'All payment details are required' });
    }

    // Verify signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', razorpay.key_secret)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update order payment status
    const result = await pool.query(`
      UPDATE orders
      SET payment_status = 'paid',
          razorpay_payment_id = $1,
          razorpay_signature = $2,
          order_status = 'confirmed'
      WHERE id = $3 AND razorpay_order_id = $4
      RETURNING *
    `, [razorpay_payment_id, razorpay_signature, order_id, razorpay_order_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or already processed' });
    }

    res.json({
      message: 'Payment verified successfully',
      order: {
        id: result.rows[0].id,
        order_number: result.rows[0].order_number,
        payment_status: result.rows[0].payment_status,
        order_status: result.rows[0].order_status
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

module.exports = router;

