const bcrypt = require('bcryptjs');
const pool = require('../database/db');
require('dotenv').config();

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@breezycart.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = 'Admin User';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existing = await pool.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      console.log('Admin user already exists. Updating password...');
      await pool.query(
        'UPDATE admin_users SET password = $1 WHERE email = $2',
        [hashedPassword, email]
      );
      console.log('✅ Admin password updated successfully');
    } else {
      // Create admin user
      await pool.query(
        'INSERT INTO admin_users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        [email, hashedPassword, name, 'admin']
      );
      console.log('✅ Admin user created successfully');
    }

    console.log(`\nAdmin Credentials:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

