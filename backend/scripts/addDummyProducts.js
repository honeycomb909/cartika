const bcrypt = require('bcryptjs');
const pool = require('../database/db');
require('dotenv').config();

async function createDummyData() {
  try {
    // Create a dummy seller
    const hashedPassword = await bcrypt.hash('seller123', 10);
    const sellerResult = await pool.query(
      `INSERT INTO sellers (name, email, password, phone, business_name, is_verified, is_active)
       VALUES ('Demo Seller', 'seller@demo.com', $1, '+1234567890', 'Demo Store', true, true)
       ON CONFLICT (email) DO UPDATE SET is_active = true
       RETURNING id`,
      [hashedPassword]
    );
    const sellerId = sellerResult.rows[0].id;
    console.log('✅ Seller created/updated:', sellerId);

    // Get categories
    const categories = await pool.query('SELECT id, slug FROM categories');
    const categoryMap = {};
    categories.rows.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Dummy products
    const products = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
        price: 2999.00,
        compare_at_price: 3999.00,
        stock_quantity: 50,
        category_slug: 'electronics',
        images: [
          'https://picsum.photos/seed/headphones/800/800'
        ]
      },
      {
        name: 'Smart Watch Pro',
        description: 'Feature-rich smartwatch with heart rate monitor, GPS, and water resistance. Track your fitness and stay connected.',
        price: 8999.00,
        compare_at_price: 11999.00,
        stock_quantity: 30,
        category_slug: 'electronics',
        images: [
          'https://picsum.photos/seed/smartwatch/800/800'
        ]
      },
      {
        name: 'Cotton T-Shirt - Classic Fit',
        description: 'Comfortable 100% cotton t-shirt in classic fit. Available in multiple colors. Perfect for everyday wear.',
        price: 599.00,
        compare_at_price: 899.00,
        stock_quantity: 100,
        category_slug: 'fashion',
        images: [
          'https://picsum.photos/seed/tshirt/800/800'
        ]
      },
      {
        name: 'Denim Jeans - Slim Fit',
        description: 'Premium denim jeans with stretch comfort. Slim fit design that looks great and feels comfortable all day.',
        price: 1999.00,
        compare_at_price: 2499.00,
        stock_quantity: 75,
        category_slug: 'fashion',
        images: [
          'https://picsum.photos/seed/denim/800/800'
        ]
      },
      {
        name: 'Modern Coffee Table',
        description: 'Elegant wooden coffee table with clean lines. Perfect centerpiece for your living room. Assembly required.',
        price: 4999.00,
        compare_at_price: 6999.00,
        stock_quantity: 20,
        category_slug: 'home-living',
        images: [
          'https://picsum.photos/seed/coffeetable/800/800'
        ]
      },
      {
        name: 'Decorative Throw Pillows (Set of 2)',
        description: 'Beautiful decorative throw pillows that add color and comfort to any room. Premium fabric with soft filling.',
        price: 899.00,
        compare_at_price: 1299.00,
        stock_quantity: 40,
        category_slug: 'home-living',
        images: [
          'https://picsum.photos/seed/pillows/800/800'
        ]
      },
      {
        name: 'The Art of Programming',
        description: 'Comprehensive guide to programming fundamentals. Perfect for beginners and intermediate developers.',
        price: 499.00,
        compare_at_price: 699.00,
        stock_quantity: 60,
        category_slug: 'books',
        images: [
          'https://picsum.photos/seed/programmingbook/800/800'
        ]
      },
      {
        name: 'Mystery Novel Collection',
        description: 'Three thrilling mystery novels in one collection. Gripping stories that will keep you on the edge of your seat.',
        price: 799.00,
        compare_at_price: 999.00,
        stock_quantity: 45,
        category_slug: 'books',
        images: [
          'https://picsum.photos/seed/mystery/800/800'
        ]
      },
      {
        name: 'Face Moisturizer with SPF',
        description: 'Hydrating daily moisturizer with SPF 30 protection. Keeps your skin soft, hydrated, and protected from sun damage.',
        price: 1299.00,
        compare_at_price: 1699.00,
        stock_quantity: 80,
        category_slug: 'beauty',
        images: [
          'https://picsum.photos/seed/moisturizer/800/800'
        ]
      },
      {
        name: 'Luxury Perfume Set',
        description: 'Elegant perfume set with three distinct fragrances. Long-lasting scents for day and night wear.',
        price: 2499.00,
        compare_at_price: 3499.00,
        stock_quantity: 35,
        category_slug: 'beauty',
        images: [
          'https://picsum.photos/seed/perfume/800/800'
        ]
      },
      {
        name: 'Yoga Mat - Premium',
        description: 'Non-slip yoga mat with extra cushioning. Perfect for yoga, pilates, and all floor exercises.',
        price: 1499.00,
        compare_at_price: 1999.00,
        stock_quantity: 55,
        category_slug: 'sports',
        images: [
          'https://picsum.photos/seed/yogamat/800/800'
        ]
      },
      {
        name: 'Dumbbell Set (5kg each)',
        description: 'Pair of 5kg dumbbells for home workouts. Durable construction with comfortable grip handles.',
        price: 1999.00,
        compare_at_price: 2499.00,
        stock_quantity: 25,
        category_slug: 'sports',
        images: [
          'https://picsum.photos/seed/dumbbells/800/800'
        ]
      }
    ];

    // Insert products
    let created = 0;
    for (const product of products) {
      const slug = product.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const categoryId = categoryMap[product.category_slug];
      
      try {
        await pool.query(
          `INSERT INTO products (
            seller_id, category_id, name, slug, description, price, compare_at_price,
            stock_quantity, images, is_approved, is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true)
          ON CONFLICT (seller_id, slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            compare_at_price = EXCLUDED.compare_at_price,
            stock_quantity = EXCLUDED.stock_quantity,
            is_approved = true,
            is_active = true`,
          [
            sellerId,
            categoryId,
            product.name,
            slug,
            product.description,
            product.price,
            product.compare_at_price,
            product.stock_quantity,
            product.images
          ]
        );
        created++;
      } catch (error) {
        console.error(`Error inserting ${product.name}:`, error.message);
      }
    }

    console.log(`✅ Created/updated ${created} dummy products`);
    console.log('\n📦 Products are now available on the website!');
    console.log('🌐 Visit http://localhost:3001 to see them');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

createDummyData();

