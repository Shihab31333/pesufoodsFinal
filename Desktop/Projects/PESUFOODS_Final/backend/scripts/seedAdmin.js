import mongoose from 'mongoose';
import '../config/env.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

async function seedAdmin() {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || 'admin@pesufoods.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
    }
  } else {
    await User.create({ name: 'PESUFOODS Admin', email, password, role: 'admin' });
  }
  console.log(`Admin ready: ${email}`);
}

try {
  await seedAdmin();
} finally {
  await mongoose.disconnect();
}
