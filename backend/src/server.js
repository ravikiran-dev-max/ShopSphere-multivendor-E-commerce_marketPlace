import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`[ShopSphere Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
      console.log(`[ShopSphere Server] Base API: https://shopsphere-multivendor-e-commerce-ndk7.onrender.com${PORT}/`);
      console.log(`[ShopSphere Server] Health Check: https://shopsphere-multivendor-e-commerce-ndk7.onrender.com${PORT}/api/v1/health`);
    });

    // Graceful Shutdown handling for deployment platforms (Render, Railway, Fly.io, Docker)
    const handleShutdown = (signal) => {
      console.log(`[ShopSphere Server] Received ${signal}. Starting graceful shutdown...`);
      server.close(() => {
        console.log('[ShopSphere Server] All pending requests closed. Terminating process.');
        process.exit(0);
      });

      // Force terminate if graceful shutdown hangs
      setTimeout(() => {
        console.error('[ShopSphere Server] Forcefully shutting down after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  })
  .catch((err) => {
    console.error(`[ShopSphere Server Fatal Error] Failed to start server: ${err.message}`);
    process.exit(1);
  });
