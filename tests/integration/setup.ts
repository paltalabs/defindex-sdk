/**
 * Integration test setup
 * This file is run before all integration tests
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

// Increase timeout for integration tests
jest.setTimeout(30000);

// Check for required environment variables
const requiredEnvVars = ['SOROSWAP_EMAIL', 'SOROSWAP_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`
⚠️  Integration tests require the following environment variables:
${missingVars.map(v => `   - ${v}`).join('\n')}

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
  if (missingVars.length === 0) {
    console.log('🚀 Starting integration tests against Soroswap API...');
    console.log(`📧 Using email: ${process.env.SOROSWAP_EMAIL}`);
    console.log('🔒 Password: [HIDDEN]');
  }
});

afterAll(async () => {
  if (missingVars.length === 0) {
    console.log('✅ Integration tests completed');
  }
}); 