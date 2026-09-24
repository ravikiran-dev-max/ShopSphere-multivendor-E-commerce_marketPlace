import mongoose from 'mongoose';
import dns from 'dns';

// Fix Node.js DNS SRV resolution for MongoDB Atlas on Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore fallback if custom DNS set
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopsphere';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[ShopSphere DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[ShopSphere DB Error] Database connection failed: ${error.message}`);
    // If Atlas fails due to network/firewall, fallback to local MongoDB if in development
    if (process.env.NODE_ENV === 'development' && uri.includes('mongodb.net')) {
      console.log('[ShopSphere DB Fallback] Attempting fallback to local MongoDB server...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/shopsphere');
        console.log(`[ShopSphere DB] Fallback Local MongoDB Connected: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(`[ShopSphere DB Error] Local fallback failed: ${localErr.message}`);
      }
    }
    process.exit(1);
  }
};

export default connectDB;
