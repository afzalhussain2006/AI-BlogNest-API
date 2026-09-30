require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'admin@blognest.com';
    const password = 'Admin@123456';

    const hashedPassword = await bcrypt.hash(password, 12);

    let user = await User.findOne({ email });

    if (user) {
      user.name = 'BlogNest Admin';
      user.password = hashedPassword;
      user.role = 'Admin';

      await user.save();

      console.log('Existing user promoted to Admin.');
    } else {
      user = await User.create({
        name: 'BlogNest Admin',
        email,
        password: hashedPassword,
        role: 'Admin'
      });

      console.log('Admin user created successfully.');
    }

    console.log(`Admin email: ${email}`);
    console.log('Admin password: Admin@123456');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Admin setup failed:', error.message);
    process.exit(1);
  }
}

createAdmin();