import dotenv from 'dotenv';
import { initFirebase } from './config/firebase.js';
import { initOracle, closePool } from './config/oracle-database.js';
import { createApp } from './app.js';

dotenv.config();

const PORT = process.env.PORT || 10000;

(async () => {
  console.log('🚀 Starting Castolin Backend...');

  try {
    // Initialize services
    initFirebase();
    await initOracle();

    // Create app
    const app = createApp();

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ Test query: http://localhost:${PORT}/test-query`);
      console.log(`✅ Customers: http://localhost:${PORT}/customer`);
      console.log(`✅ Stock: http://localhost:${PORT}/stock_item`);
      console.log(`✅ Orders: http://localhost:${PORT}/orders`);
      console.log(`✅ Admins: http://localhost:${PORT}/admins`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

/* -------------------------------------------------------
   GRACEFUL SHUTDOWN
------------------------------------------------------- */
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await closePool();
  console.log('✅ Server shutdown complete');
  process.exit(0);
});