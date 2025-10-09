# Vault V2 - Test Suite

Comprehensive test suite for the rebuilt Privault vault system.

## Directory Structure

```
tests/vault-v2/
├── README.md                    # This file
├── setup.ts                     # Test setup and configuration
├── jest.config.js              # Jest configuration
│
├── unit/                        # Unit tests
│   ├── services/
│   │   ├── vault.service.test.ts
│   │   ├── encryption.service.test.ts
│   │   ├── expiration.service.test.ts
│   │   └── history.service.test.ts
│   ├── utils/
│   │   ├── validators.test.ts
│   │   ├── password.test.ts
│   │   └── expiration.test.ts
│   └── encryption/
│       ├── encryptor.test.ts
│       └── decryptor.test.ts
│
├── integration/                 # Integration tests
│   ├── vault-operations.test.ts
│   ├── expiration-workflow.test.ts
│   ├── import-export.test.ts
│   └── password-rotation.test.ts
│
├── e2e/                         # End-to-end tests
│   ├── vault-crud.spec.ts
│   ├── search-filter.spec.ts
│   ├── expiration.spec.ts
│   └── import-export.spec.ts
│
├── fixtures/                    # Test data
│   ├── credentials.json
│   ├── import-samples/
│   │   ├── valid.csv
│   │   ├── valid.json
│   │   └── invalid.csv
│   └── mock-data.ts
│
├── mocks/                       # Mock implementations
│   ├── database.mock.ts
│   ├── encryption.mock.ts
│   ├── repository.mock.ts
│   └── services.mock.ts
│
└── helpers/                     # Test utilities
    ├── test-utils.ts
    ├── setup-teardown.ts
    └── assertions.ts
```

## Testing Framework

### Unit & Integration Tests
- **Framework:** Jest
- **Coverage:** >80% target
- **Mocking:** Jest mocks + MSW for API

### End-to-End Tests
- **Framework:** Playwright
- **Browsers:** Chrome, Firefox, Safari
- **Devices:** Desktop, Tablet, Mobile

### Component Tests
- **Framework:** React Testing Library
- **Focus:** User interactions, accessibility

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm test -- tests/vault-v2/unit
```

### Integration Tests
```bash
npm test -- tests/vault-v2/integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

## Test Patterns

### Unit Test Example

```typescript
// tests/vault-v2/unit/services/vault.service.test.ts
import { VaultService } from '@/lib/vault-v2/services/vault.service';
import { createMockRepository } from '../../mocks/repository.mock';

describe('VaultService', () => {
  let service: VaultService;
  let mockRepo: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    service = new VaultService(mockRepo, ...otherDeps);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCredential', () => {
    it('should create and encrypt credential', async () => {
      const input = {
        site: 'example.com',
        username: 'user@example.com',
        password: 'SecurePass123!',
        category: CredentialCategory.WORK,
      };

      const result = await service.createCredential(input);

      expect(result.success).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: CredentialCategory.WORK,
        })
      );
    });

    it('should return error for invalid input', async () => {
      const invalidInput = {
        site: '',
        username: '',
        password: '',
        category: CredentialCategory.WORK,
      };

      const result = await service.createCredential(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_FAILED');
    });
  });
});
```

### Integration Test Example

```typescript
// tests/vault-v2/integration/vault-operations.test.ts
describe('Vault Operations Integration', () => {
  it('should complete create-read-update-delete flow', async () => {
    // Create
    const createResult = await vaultService.createCredential(testData);
    expect(createResult.success).toBe(true);
    
    const credentialId = createResult.data.credential_id;

    // Read
    const readResult = await vaultService.getCredential(credentialId);
    expect(readResult.success).toBe(true);
    expect(readResult.data.decrypted_data.site).toBe(testData.site);

    // Update
    const updateResult = await vaultService.updateCredential(credentialId, {
      site: 'updated.com',
      version: readResult.data.version,
    });
    expect(updateResult.success).toBe(true);

    // Delete
    const deleteResult = await vaultService.deleteCredential(credentialId);
    expect(deleteResult.success).toBe(true);
  });
});
```

### E2E Test Example

```typescript
// tests/vault-v2/e2e/vault-crud.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Vault CRUD Operations', () => {
  test('user can create, view, edit, and delete credential', async ({ page }) => {
    await page.goto('/vault-v2');

    // Create
    await page.click('text=Add Credential');
    await page.fill('[name="site"]', 'example.com');
    await page.fill('[name="username"]', 'user@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    // Verify created
    await expect(page.locator('text=example.com')).toBeVisible();

    // View
    await page.click('text=example.com');
    await expect(page.locator('text=user@example.com')).toBeVisible();

    // Edit
    await page.click('text=Edit');
    await page.fill('[name="site"]', 'updated.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=updated.com')).toBeVisible();

    // Delete
    await page.click('text=Delete');
    await page.click('text=Confirm');
    await expect(page.locator('text=updated.com')).not.toBeVisible();
  });
});
```

## Test Coverage Goals

### Overall Coverage: >80%

### By Category:
- **Services:** >90%
- **Utils:** >85%
- **Components:** >75%
- **Integration:** Critical paths covered
- **E2E:** User journeys covered

### Critical Paths (100% Coverage):
- Authentication and authorization
- Encryption/decryption
- Data validation
- Error handling
- Password lifecycle management

## Mocking Strategy

### Database Mocks
```typescript
export const createMockRepository = () => ({
  findById: jest.fn(),
  findByUser: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  incrementAccessCount: jest.fn(),
});
```

### Encryption Mocks
```typescript
export const createMockEncryption = () => ({
  encrypt: jest.fn().mockResolvedValue({
    encrypted: 'mock-encrypted',
    iv: 'mock-iv',
  }),
  decrypt: jest.fn().mockResolvedValue('{"password":"test"}'),
});
```

### API Mocks (MSW)
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  rest.get('/api/vault/credentials', (req, res, ctx) => {
    return res(ctx.json({ credentials: [] }));
  }),
];

export const server = setupServer(...handlers);
```

## Test Data Management

### Fixtures
```typescript
// tests/vault-v2/fixtures/credentials.json
{
  "valid_credential": {
    "site": "example.com",
    "username": "user@example.com",
    "password": "SecurePass123!",
    "category": "work"
  },
  "expired_credential": {
    "site": "old.com",
    "username": "user@old.com",
    "password": "OldPass123!",
    "expires_at": "2024-01-01T00:00:00Z"
  }
}
```

### Factory Functions
```typescript
export const createTestCredential = (overrides = {}) => ({
  site: 'test.com',
  username: 'test@test.com',
  password: 'TestPass123!',
  category: CredentialCategory.PERSONAL,
  ...overrides,
});
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Test Vault V2

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- tests/vault-v2
      - run: npm run test:e2e
```

## Best Practices

### 1. Test Naming
- Use descriptive names
- Follow pattern: `should [expected behavior] when [condition]`
- Example: `should return error when password is empty`

### 2. Test Structure (AAA Pattern)
```typescript
it('should do something', () => {
  // Arrange
  const input = createTestData();
  
  // Act
  const result = functionUnderTest(input);
  
  // Assert
  expect(result).toBe(expected);
});
```

### 3. Test Isolation
- Each test should be independent
- Use `beforeEach` for setup
- Use `afterEach` for cleanup
- Don't rely on test execution order

### 4. Mock External Dependencies
- Mock database calls
- Mock API requests
- Mock crypto operations
- Mock file system

### 5. Test Edge Cases
- Empty inputs
- Null/undefined values
- Boundary conditions
- Error scenarios

### 6. Async Testing
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});
```

### 7. Error Testing
```typescript
it('should throw error for invalid input', () => {
  expect(() => functionUnderTest(invalid)).toThrow();
});
```

## Accessibility Testing

### Automated A11y Tests
```typescript
import { axe } from 'jest-axe';

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Keyboard Navigation Tests
```typescript
it('should be keyboard navigable', () => {
  render(<CredentialCard />);
  
  userEvent.tab(); // Focus first element
  expect(screen.getByRole('button')).toHaveFocus();
  
  userEvent.keyboard('{Enter}');
  // Assert expected behavior
});
```

## Performance Testing

### Render Performance
```typescript
import { renderHook } from '@testing-library/react-hooks';

it('should not cause unnecessary re-renders', () => {
  const { result, rerender } = renderHook(() => useCredentials());
  
  const renderCount = getRenderCount();
  rerender();
  
  expect(getRenderCount()).toBe(renderCount);
});
```

### Load Testing
```typescript
it('should handle large datasets efficiently', async () => {
  const largeDataset = createCredentials(1000);
  
  const startTime = performance.now();
  const result = await service.listCredentials();
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(1000); // < 1 second
});
```

## Debugging Tests

### Run Single Test
```bash
npm test -- -t "should create credential"
```

### Debug in VSCode
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

### Verbose Output
```bash
npm test -- --verbose
```

## Implementation Status

### Completed ✅
- Test directory structure
- README documentation
- Testing patterns and examples

### In Progress 🚧
- Unit test implementations
- Integration test suite
- E2E test scenarios

### Planned 📋
- Performance benchmarks
- Security testing
- Load testing
- Accessibility audit

## Related Documentation

- [Vault Rebuild Plan](../../VAULT_REBUILD_PLAN.md)
- [Vault Service](../../lib/vault-v2/services/vault.service.ts)
- [Components](../../components/vault-v2/README.md)
- [Migration Guide](../../MIGRATION_GUIDE.md)

