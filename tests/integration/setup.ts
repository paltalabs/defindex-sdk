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
const requiredEnvVars = ['DEFINDEX_API_EMAIL', 'DEFINDEX_API_PASSWORD'];
const optionalEnvVars = ['DEFINDEX_API_KEY']; // Alternative authentication
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// Allow running with either email/password OR API key
const hasApiKey = process.env.DEFINDEX_API_KEY;
const hasEmailPassword = process.env.DEFINDEX_API_EMAIL && process.env.DEFINDEX_API_PASSWORD;

if (!hasApiKey && !hasEmailPassword) {
  console.warn(`
⚠️  Integration tests require authentication credentials:

Option 1 - API Key (recommended):
   - DEFINDEX_API_KEY

Option 2 - Email/Password:
   - DEFINDEX_API_EMAIL
   - DEFINDEX_API_PASSWORD

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
  if (hasApiKey || hasEmailPassword) {
    console.log('🚀 Starting integration tests against DefIndex API...');
    
    if (hasApiKey) {
      console.log(`🔑 Using API key: ${process.env.DEFINDEX_API_KEY?.substring(0, 10)}...`);
    } else {
      console.log(`📧 Using email: ${process.env.DEFINDEX_API_EMAIL}`);
      console.log(`🔒 Password: [HIDDEN]`);
    }
  }
});

afterAll(async () => {
  if (hasApiKey || hasEmailPassword) {
    console.log('✅ Integration tests completed');
  }
}); 