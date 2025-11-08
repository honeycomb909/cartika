const bcrypt = require('bcryptjs');

// Hash password for admin user
const password = 'admin123';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password:', hash);
  console.log('\nUse this in your database schema.sql file:');
  console.log(`INSERT INTO admin_users (email, password, name, role) VALUES`);
  console.log(`    ('admin@breezycart.com', '${hash}', 'Admin User', 'admin')`);
  console.log(`ON CONFLICT (email) DO NOTHING;`);
});

