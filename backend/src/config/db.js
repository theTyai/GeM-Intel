const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows / ISP DNS resolvers failing on MongoDB Atlas SRV (_mongodb._tcp) queries
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('[DB] Custom DNS setServers skipped:', dnsErr.message);
}

// Direct replica set URI fallback in case SRV lookup is completely blocked on local network
const FALLBACK_DIRECT_URI =
  'mongodb://gem:gem@ac-mqbvlwi-shard-00-00.vbor8rn.mongodb.net:27017,ac-mqbvlwi-shard-00-01.vbor8rn.mongodb.net:27017,ac-mqbvlwi-shard-00-02.vbor8rn.mongodb.net:27017/gem_intel?ssl=true&replicaSet=atlas-2y420c-shard-0&authSource=admin&retryWrites=true&w=majority';

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gem_intel';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (primaryErr) {
    console.warn(`[DB] Primary connection attempt failed: ${primaryErr.message}`);

    // If SRV lookup failed, try direct replica set nodes
    if (primaryUri.includes('mongodb+srv://') && (primaryErr.message.includes('querySrv') || primaryErr.message.includes('ECONNREFUSED'))) {
      console.log('[DB] Attempting direct replica-set connection fallback...');
      try {
        const fallbackConn = await mongoose.connect(FALLBACK_DIRECT_URI, {
          serverSelectionTimeoutMS: 10000,
        });
        console.log(`[DB] MongoDB Connected via direct replica set: ${fallbackConn.connection.host}`);
        return;
      } catch (fallbackErr) {
        console.error(`[DB] Fallback connection failed: ${fallbackErr.message}`);
      }
    }

    console.error('[DB] Ensure Atlas IP Access list has 0.0.0.0/0 allowed and internet connection is active.');
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[DB] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[DB] MongoDB error: ${err.message}`);
});

module.exports = connectDB;
