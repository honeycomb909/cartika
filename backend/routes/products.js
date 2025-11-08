const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { authenticateSeller } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all products (public - for buyers)
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, minPrice, maxPrice, sort = 'created_at' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, s.name as seller_name, c.name as category_name,
             COUNT(*) OVER() as total_count
      FROM products p
      LEFT JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_approved = true AND p.is_active = true
    `;
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND c.slug = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (minPrice) {
      paramCount++;
      query += ` AND p.price >= $${paramCount}`;
      params.push(minPrice);
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND p.price <= $${paramCount}`;
      params.push(maxPrice);
    }

    // Validate sort column
    const allowedSorts = ['created_at', 'price', 'name', 'views_count'];
    const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = req.query.order === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY p.${sortColumn} ${sortOrder} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      products: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        price: parseFloat(row.price),
        compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
        stock_quantity: row.stock_quantity,
        images: row.images || [],
        category: row.category_name,
        seller_name: row.seller_name,
        views_count: row.views_count,
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
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Increment view count
    await pool.query(
      'UPDATE products SET views_count = views_count + 1 WHERE slug = $1',
      [slug]
    );

    const result = await pool.query(`
      SELECT p.*, s.name as seller_name, s.business_name, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_approved = true AND p.is_active = true
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];
    res.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: parseFloat(product.price),
      compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
      stock_quantity: product.stock_quantity,
      sku: product.sku,
      images: product.images || [],
      category: {
        name: product.category_name,
        slug: product.category_slug
      },
      seller: {
        name: product.seller_name,
        business_name: product.business_name
      },
      views_count: product.views_count,
      created_at: product.created_at
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (seller only)
router.post('/', authenticateSeller, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      compare_at_price,
      stock_quantity,
      sku,
      category_id
    } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Get image URLs
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const result = await pool.query(`
      INSERT INTO products (seller_id, category_id, name, slug, description, price, compare_at_price, stock_quantity, sku, images, is_approved)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
      RETURNING *
    `, [
      req.seller.id,
      category_id || null,
      name,
      slug,
      description || '',
      price,
      compare_at_price || null,
      stock_quantity || 0,
      sku || null,
      images
    ]);

    res.status(201).json({
      message: 'Product created successfully. Waiting for admin approval.',
      product: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Product with this name already exists' });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (seller only)
router.put('/:id', authenticateSeller, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      compare_at_price,
      stock_quantity,
      sku,
      category_id,
      images
    } = req.body;

    // Verify product belongs to seller
    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND seller_id = $2',
      [id, req.seller.id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle image uploads
    let imageUrls = images ? JSON.parse(images) : [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      imageUrls = [...imageUrls, ...newImages];
    }

    // Generate slug if name changed
    let slug = productCheck.rows[0].slug;
    if (name) {
      slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const result = await pool.query(`
      UPDATE products
      SET name = COALESCE($1, name),
          slug = $2,
          description = COALESCE($3, description),
          price = COALESCE($4, price),
          compare_at_price = COALESCE($5, compare_at_price),
          stock_quantity = COALESCE($6, stock_quantity),
          sku = COALESCE($7, sku),
          category_id = COALESCE($8, category_id),
          images = $9,
          is_approved = false
      WHERE id = $10 AND seller_id = $11
      RETURNING *
    `, [
      name,
      slug,
      description,
      price,
      compare_at_price,
      stock_quantity,
      sku,
      category_id,
      imageUrls,
      id,
      req.seller.id
    ]);

    res.json({
      message: 'Product updated successfully. Waiting for admin approval.',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (seller only)
router.delete('/:id', authenticateSeller, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING id',
      [id, req.seller.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;

