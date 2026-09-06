require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const User = require('../models/User');

const FALLBACK_DIRECT_URI =
  'mongodb://gem:gem@ac-mqbvlwi-shard-00-00.vbor8rn.mongodb.net:27017,ac-mqbvlwi-shard-00-01.vbor8rn.mongodb.net:27017,ac-mqbvlwi-shard-00-02.vbor8rn.mongodb.net:27017/gem_intel?ssl=true&replicaSet=atlas-2y420c-shard-0&authSource=admin&retryWrites=true&w=majority';

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gem_intel';
  try {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    } catch (err) {
      console.log('Connecting via direct replica set fallback...');
      await mongoose.connect(FALLBACK_DIRECT_URI, { serverSelectionTimeoutMS: 10000 });
    }
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    const users = [
      {
        name: 'Test Officer',
        email: 'officer@gem.gov.in',
        passwordHash: 'password123', // will be hashed by pre-save hook
        role: 'officer',
        department: 'Ministry of Finance',
      },
      {
        name: 'Test Auditor',
        email: 'auditor@gem.gov.in',
        passwordHash: 'password123',
        role: 'auditor',
        department: 'CAG Office',
      },
      {
        name: 'Admin User',
        email: 'admin@gem.gov.in',
        passwordHash: 'password123',
        role: 'admin',
        department: 'GeM Administration',
      },
    ];

    for (let u of users) {
      const user = new User(u);
      await user.save();
    }

    console.log('Successfully seeded test users');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seed();
