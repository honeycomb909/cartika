import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://zzpvoakdcekpwwhvmntq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cHZvYWtkY2VrcHd3aHZtbnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTY1OTMsImV4cCI6MjA3ODEzMjU5M30.aBCTPN2qOPhy5pP6RxkUPvEi9y9EvtXJ1Gd-WdAZl7Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  try {
    // Create demo seller
    const hashedPassword = await bcrypt.hash('seller123', 10);
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .upsert({
        name: 'Demo Seller',
        email: 'seller@demo.com',
        password: hashedPassword,
        phone: '+1234567890',
        business_name: 'Demo Store',
        is_verified: true,
        is_active: true
      })
      .select()
      .single();

    if (sellerError) throw sellerError;
    console.log('✅ Seller created:', seller.id);

    // Get categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, slug');
    
    if (catError) throw catError;
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Products data
    const products = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
        price: 2999.00,
        compare_at_price: 3999.00,
        stock_quantity: 50,
        category_slug: 'electronics',
        images: ['https://picsum.photos/seed/headphones/800/800']
      },
      {
        name: 'Smart Watch Pro',
        description: 'Feature-rich smartwatch with heart rate monitor, GPS, and water resistance. Track your fitness and stay connected.',
        price: 8999.00,
        compare_at_price: 11999.00,
        stock_quantity: 30,
        category_slug: 'electronics',
        images: ['https://picsum.photos/seed/smartwatch/800/800']
      },
      {
        name: 'Cotton T-Shirt - Classic Fit',
        description: 'Comfortable 100% cotton t-shirt in classic fit. Available in multiple colors. Perfect for everyday wear.',
        price: 599.00,
        compare_at_price: 899.00,
        stock_quantity: 100,
        category_slug: 'fashion',
        images: ['https://picsum.photos/seed/tshirt/800/800']
      },
      {
        name: 'Denim Jeans - Slim Fit',
        description: 'Premium denim jeans with stretch comfort. Slim fit design that looks great and feels comfortable all day.',
        price: 1999.00,
        compare_at_price: 2499.00,
        stock_quantity: 75,
        category_slug: 'fashion',
        images: ['https://picsum.photos/seed/denim/800/800']
      },
      {
        name: 'Modern Coffee Table',
        description: 'Elegant wooden coffee table with clean lines. Perfect centerpiece for your living room. Assembly required.',
        price: 4999.00,
        compare_at_price: 6999.00,
        stock_quantity: 20,
        category_slug: 'home-living',
        images: ['https://picsum.photos/seed/coffeetable/800/800']
      },
      {
        name: 'Decorative Throw Pillows (Set of 2)',
        description: 'Beautiful decorative throw pillows that add color and comfort to any room. Premium fabric with soft filling.',
        price: 899.00,
        compare_at_price: 1299.00,
        stock_quantity: 40,
        category_slug: 'home-living',
        images: ['https://picsum.photos/seed/pillows/800/800']
      },
      {
        name: 'The Art of Programming',
        description: 'Comprehensive guide to programming fundamentals. Perfect for beginners and intermediate developers.',
        price: 499.00,
        compare_at_price: 699.00,
        stock_quantity: 60,
        category_slug: 'books',
        images: ['https://picsum.photos/seed/programmingbook/800/800']
      },
      {
        name: 'Mystery Novel Collection',
        description: 'Three thrilling mystery novels in one collection. Gripping stories that will keep you on the edge of your seat.',
        price: 799.00,
        compare_at_price: 999.00,
        stock_quantity: 45,
        category_slug: 'books',
        images: ['https://picsum.photos/seed/mystery/800/800']
      },
      {
        name: 'Face Moisturizer with SPF',
        description: 'Hydrating daily moisturizer with SPF 30 protection. Keeps your skin soft, hydrated, and protected from sun damage.',
        price: 1299.00,
        compare_at_price: 1699.00,
        stock_quantity: 80,
        category_slug: 'beauty',
        images: ['https://picsum.photos/seed/moisturizer/800/800']
      },
      {
        name: 'Luxury Perfume Set',
        description: 'Elegant perfume set with three distinct fragrances. Long-lasting scents for day and night wear.',
        price: 2499.00,
        compare_at_price: 3499.00,
        stock_quantity: 35,
        category_slug: 'beauty',
        images: ['https://picsum.photos/seed/perfume/800/800']
      },
      {
        name: 'Yoga Mat - Premium',
        description: 'Non-slip yoga mat with extra cushioning. Perfect for yoga, pilates, and all floor exercises.',
        price: 1499.00,
        compare_at_price: 1999.00,
        stock_quantity: 55,
        category_slug: 'sports',
        images: ['https://picsum.photos/seed/yogamat/800/800']
      },
      {
        name: 'Dumbbell Set (5kg each)',
        description: 'Pair of 5kg dumbbells for home workouts. Durable construction with comfortable grip handles.',
        price: 1999.00,
        compare_at_price: 2499.00,
        stock_quantity: 25,
        category_slug: 'sports',
        images: ['https://picsum.photos/seed/dumbbells/800/800']
      }
    ];

    // Insert products
    for (const product of products) {
      const slug = product.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const { error: productError } = await supabase
        .from('products')
        .upsert({
          seller_id: seller.id,
          category_id: categoryMap[product.category_slug],
          name: product.name,
          slug: slug,
          description: product.description,
          price: product.price,
          compare_at_price: product.compare_at_price,
          stock_quantity: product.stock_quantity,
          images: product.images,
          is_approved: true,
          is_active: true
        });

      if (productError) {
        console.error(`Error inserting ${product.name}:`, productError.message);
      } else {
        console.log(`✅ Created product: ${product.name}`);
      }
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();