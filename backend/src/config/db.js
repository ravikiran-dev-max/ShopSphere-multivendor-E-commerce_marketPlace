import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopsphere');
    console.log(`[ShopSphere DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[ShopSphere DB Error] Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
