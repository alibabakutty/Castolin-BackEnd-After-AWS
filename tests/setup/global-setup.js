// tests/setup/global-setup.js
import { execSync } from 'child_process';

module.exports = async () => {
  console.log('🌐 Global test setup starting...');
  
  // 1. Load test environment variables
  require('dotenv').config({ path: '.env.test' });
  
  // 2. Start the server if not already running
  try {
    execSync('npm run start:test', { stdio: 'inherit' });
  } catch (error) {
    console.log('Server might already be running or failed to start');
  }
  
  // 3. Seed test database
  console.log('📊 Seeding test database...');
  // Add your database seeding logic here
  
  // 4. Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('✅ Global setup complete');
  
  return async () => {
    console.log('🧹 Global teardown...');
    // Cleanup logic
  };
};