import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[ShopSphere Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
      console.log(`[ShopSphere Server] Health Check: http://localhost:${PORT}/api/v1/health`);
    });
  })
  .catch((err) => {
    console.error(`[ShopSphere Server Fatal Error] Failed to start server: ${err.message}`);
    process.exit(1);
  });
