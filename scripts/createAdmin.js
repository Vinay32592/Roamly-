require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const email = process.env.ADMIN_EMAIL || 'admin@roamly.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const name = process.env.ADMIN_NAME || 'Roamly Admin';
    const username = process.env.ADMIN_USERNAME || 'admin';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    await User.create({
      name,
      username,
      email,
      password,
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log('\n  Change these credentials after first login.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
