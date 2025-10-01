# API Integration Tests

This directory contains comprehensive integration tests for the Backstage Node App API.

## Test Structure

```
tests/
├── setup.js                    # Jest setup and environment configuration
├── helpers/
│   └── testHelpers.js         # Reusable test utilities and assertions
├── integration/
│   ├── all.test.js            # Complete API integration test suite
│   ├── api.test.js            # Tests for /, /api, and /api-status endpoints
│   ├── health.test.js         # Tests for /health endpoint
│   ├── users.test.js          # Tests for /api/users endpoint
│   ├── services.test.js       # Tests for /api/services endpoints
│   └── errorHandling.test.js  # Tests for error scenarios and edge cases
└── README.md                  # This file
```

## Test Coverage

### Endpoints Tested

- **GET /** - Root endpoint with API information
- **GET /health** - Health check endpoint
- **GET /api-status** - Detailed API status information
- **GET /api** - Basic API information
- **GET /api/users** - User listing endpoint
- **GET /api/services** - Service listing endpoint
- **GET /api/services/:id** - Individual service details
- **POST /api/services** - Service creation endpoint

### Test Categories

1. **Functional Tests**
   - Response structure validation
   - Data type verification
   - Business logic validation
   - Input validation

2. **Performance Tests**
   - Response time validation
   - Concurrent request handling
   - Load testing scenarios

3. **Error Handling Tests**
   - 404 Not Found scenarios
   - Malformed request handling
   - Invalid input validation
   - Edge case handling

4. **Security Tests**
   - Header validation
   - CORS handling
   - Information disclosure prevention

5. **Integration Tests**
   - Cross-endpoint consistency
   - Data integrity validation
   - API contract compliance

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Files
```bash
# Run only health tests
npm test -- health.test.js

# Run only services tests
npm test -- services.test.js

# Run only error handling tests
npm test -- errorHandling.test.js
```

## Test Configuration

The tests are configured using Jest with the following setup:

- **Test Environment**: Node.js
- **Timeout**: 10 seconds per test
- **Coverage**: Includes server.js and services directory
- **Setup**: Automatic environment configuration for testing

## Test Utilities

### Helper Functions

- `createTestApp()` - Creates a test instance of the Express app
- `expectValidTimestamp()` - Validates timestamp format
- `expectValidHealthResponse()` - Validates health endpoint response structure
- `expectValidApiStatusResponse()` - Validates API status response structure
- `expectValidUserResponse()` - Validates users endpoint response structure
- `expectValidServiceResponse()` - Validates services endpoint response structure
- `expectValidSingleServiceResponse()` - Validates individual service response structure

## Environment Variables

Tests use the following environment variables (automatically set in setup.js):

- `NODE_ENV=test`
- `PORT=0` (random available port)
- `GITHUB_TOKEN=test-token`
- `GITHUB_OWNER=test-owner`
- `GITHUB_REPO=test-repo`

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Cleanup**: Tests clean up after themselves
3. **Assertions**: Comprehensive validation of response structure and data
4. **Edge Cases**: Testing boundary conditions and error scenarios
5. **Performance**: Validating response times and concurrent handling
6. **Security**: Ensuring no sensitive information is exposed

## Adding New Tests

When adding new endpoints or features:

1. Create appropriate test files in the `integration/` directory
2. Use existing helper functions when possible
3. Follow the established naming conventions
4. Include both positive and negative test cases
5. Add performance and security validations
6. Update this README if needed

## Continuous Integration

These tests are designed to run in CI/CD pipelines and provide:

- Fast execution (typically under 30 seconds)
- Reliable results (no flaky tests)
- Comprehensive coverage
- Clear failure reporting
- Performance benchmarks
