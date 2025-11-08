const pool = require('../database/db');

(async function(){
  try {
    const res = await pool.query("SELECT id, name, images, images::text as images_text FROM products ORDER BY created_at DESC LIMIT 50");
    for (const row of res.rows) {
      console.log(row.name, '=>', row.images, '::text=>', row.images_text);
    }
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error', err);
    await pool.end();
    process.exit(1);
  }
})();
