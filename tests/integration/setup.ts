/**
 * Integration test setup for DefIndex SDK
 * This file is run before all integration tests
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

// Increase timeout for integration tests
jest.setTimeout(30000);

// Check for required environment variables
const requiredEnvVars = ['DEFINDEX_API_KEY', 'DEFINDEX_BASE_URL']; // Alternative authentication
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// Allow running with API key
const hasApiKey = process.env.DEFINDEX_API_KEY;

if (!hasApiKey) {
  console.warn(`
⚠️  Integration tests require authentication credentials:
   - DEFINDEX_API_KEY

To run integration tests, set these variables and run:
   pnpm run test:integration

Unit tests (mocked) can still be run with:
   pnpm test
`);
}

// Set default timeout for async operations
const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  // Add timestamp to console logs in integration tests
  originalConsoleLog(`[${new Date().toISOString()}]`, ...args);
};

// Global test state
beforeAll(async () => {
  if (hasApiKey) {
    console.log('🚀 Starting integration tests against DefIndex API...');
    
    if (hasApiKey) {
      console.log(`🔑 Using API key: ${process.env.DEFINDEX_API_KEY?.substring(0, 10)}...`);
    }
  }
});

afterAll(async () => {
  if (hasApiKey) {
    console.log('✅ Integration tests completed');
  }
}); 