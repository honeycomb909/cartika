const pool = require('../database/db');

const mapping = {
  'wireless-bluetooth-headphones': ['https://picsum.photos/seed/headphones/800/800'],
  'smart-watch-pro': ['https://picsum.photos/seed/smartwatch/800/800'],
  'cotton-t-shirt-classic-fit': ['https://picsum.photos/seed/tshirt/800/800'],
  'denim-jeans-slim-fit': ['https://picsum.photos/seed/denim/800/800'],
  'modern-coffee-table': ['https://picsum.photos/seed/coffeetable/800/800'],
  'decorative-throw-pillows-set-of-2': ['https://picsum.photos/seed/pillows/800/800'],
  'the-art-of-programming': ['https://picsum.photos/seed/programmingbook/800/800'],
  'mystery-novel-collection': ['https://picsum.photos/seed/mystery/800/800'],
  'face-moisturizer-with-spf': ['https://picsum.photos/seed/moisturizer/800/800'],
  'luxury-perfume-set': ['https://picsum.photos/seed/perfume/800/800'],
  'yoga-mat-premium': ['https://picsum.photos/seed/yogamat/800/800'],
  'dumbbell-set-5kg-each': ['https://picsum.photos/seed/dumbbells/800/800']
};

(async function(){
  try {
    for (const [slug, imgs] of Object.entries(mapping)) {
      const res = await pool.query(
        'UPDATE products SET images = $1 WHERE slug = $2 RETURNING id, name, images',
        [imgs, slug]
      );
      if (res.rowCount > 0) console.log('Updated', slug, '->', res.rows[0].images);
      else console.log('No product found for', slug);
    }
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error', err);
    await pool.end();
    process.exit(1);
  }
})();
