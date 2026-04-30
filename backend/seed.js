// Run this once: node seed.js
// Creates default admin and staff accounts

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedUsers = [
  {
    name: 'Hall Admin',
    email: 'admin@bijoy24.sust.edu',
    password: 'Admin@123',
    role: 'admin'
  },
  {
    name: 'Hall Staff',
    email: 'staff@bijoy24.sust.edu',
    password: 'Staff@123',
    role: 'staff'
  }
];

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding default users...\n');

  for (const userData of seedUsers) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`⚠️  User already exists: ${userData.email}`);
      continue;
    }
    await User.create(userData);
    console.log(`✅ Created ${userData.role}: ${userData.email} / password: ${userData.password}`);
  }

  console.log('\n✅ Seeding complete!');
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});