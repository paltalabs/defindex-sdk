# Integration Tests

These tests actually call the real DefIndex API to verify end-to-end functionality. Unlike unit tests which mock all external dependencies, integration tests:

- ✅ Test real API communication
- ✅ Verify authentication flow works
- ✅ Catch breaking API changes
- ✅ Test actual data flow
- ⚠️ Require valid credentials
- ⚠️ May fail due to network issues
- ⚠️ Slower execution than unit tests

## Setup

### 1. Get DefIndex API Credentials

You need valid DefIndex credentials to run integration tests. Choose one of the authentication methods:

### Getting API Key
1. Login to your DefIndex account
2. Generate an API key via web interface
3. Set the API key for authentication


### 2. Set Environment Variables

Set the required environment variables based on your chosen authentication method:

```bash
export DEFINDEX_API_KEY="sk_your_api_key_here"

# Optional: Custom API URL (defaults to https://api.defindex.io)
export DEFINDEX_API_URL="https://api.defindex.io"
```

#### Using .env File (DO NOT commit this!)

```bash
# Create a .env file in the project root
echo "DEFINDEX_API_KEY=sk_your_api_key_here" > .env

```

## Running Tests

```bash
# Run only integration tests
pnpm run test:integration

# Run both unit and integration tests
pnpm run test:all

# Run unit tests only (default, no credentials needed)
pnpm test
```

## Test Structure

The integration tests are organized into categories:

- **System Health** - API health checks, system status
- **Authentication Flow** - Login, token management, JWT refresh
- **API Key Management** - Generate, list, and revoke API keys
- **Factory Operations** - Factory addresses, vault creation capabilities
- **Vault Operations** - Vault info, balances, deposits, withdrawals
- **Transaction Management** - Transaction submission to Stellar network
- **Error Handling** - Invalid requests, network errors
- **Rate Limiting & Performance** - Concurrent requests, timeouts

## Important Notes

### Security
- **Never commit credentials** to version control
- Integration tests use testnet by default for safety
- Credentials are only used for authentication, not stored

### Test Environment
- Tests use DefIndex testnet to avoid real money transactions
- Some features may require specific roles or permissions
- Tests include graceful handling of missing data
- Placeholder addresses are used for testing API contracts

### Vault Operations
- Most vault operations require existing vaults and proper roles
- Tests are designed to be non-destructive (read-only operations)
- Creation and management operations may require specific permissions
- Some tests use placeholder data and expect graceful failures

### CI/CD
- Integration tests should be run separately from unit tests in CI
- Consider running them on a schedule rather than every commit
- Set up separate secrets management for credentials
- Use API keys instead of passwords in CI environments

### Debugging

If tests fail:

1. **Check credentials**: Ensure environment variables are set correctly
2. **Check network**: Verify you can reach api.defindex.io
3. **Check API status**: Visit the health endpoint manually
4. **Check permissions**: Ensure your account has necessary roles
5. **Check rate limits**: Wait a few minutes if hitting rate limits

```bash
# Manual health check
curl https://api.defindex.io/health

# Check your environment variables
echo $DEFINDEX_API_KEY
```

## Example Test Run

```bash
$ pnpm run test:integration

> defindex-sdk@1.0.0 test:integration
> jest --config=jest.integration.config.js

[2024-01-15T10:30:00.000Z] 🚀 Starting integration tests against DefIndex API...
[2024-01-15T10:30:00.000Z] 🔑 Using API key: sk_test_ab...

  DefindexSDK - Integration Tests
    System Health
      ✓ should check API health status (1234ms)
    Factory Operations
      ✓ should get factory address (2109ms)
    Vault Operations
      ✓ should handle vault info request gracefully (1654ms)
      ✓ should handle vault balance request gracefully (1432ms)
    [... more tests ...]

[2024-01-15T10:35:00.000Z] ✅ Integration tests completed

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Time:        35.123s
```

## Contributing

When adding new integration tests:

1. Follow the same patterns as existing tests
2. Include graceful handling for missing data or permissions
3. Use realistic but safe test data
4. Add appropriate timeouts for network operations
5. Include descriptive console logs for debugging
6. Test both success and expected failure scenarios
7. Use placeholder data when testing API contracts
8. Consider using the `skipTests` pattern for conditional execution

## Test Categories

### Read-Only Tests
These tests safely read data without making changes:
- Health checks
- Authentication verification
- Factory address retrieval
- Vault information queries (with placeholder addresses)
- API key listing

### Write Operations (Careful!)
These tests may create or modify data:
- API key generation and revocation
- Vault creation (commented out, requires proper setup)
- Deposit/withdrawal operations (commented out, requires real assets)

### Error Handling Tests
These tests verify graceful error handling:
- Invalid addresses and parameters
- Network connectivity issues
- Authentication failures
- Rate limiting scenarios

### Performance Tests
These tests verify system behavior under load:
- Concurrent requests
- Timeout handling
- Rate limiting compliance