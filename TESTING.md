# Frontend Testing Setup — CodlyLabs PoC Platform

This document describes the Vitest + React Testing Library test infrastructure for the CodlyLabs frontend.

## Overview

The frontend test suite uses:
- **Vitest** v9+ — Fast unit test framework with Vite integration
- **React Testing Library** — User-centric testing utilities
- **jsdom** — Browser environment simulation
- **Vitest UI** — Optional visual test runner

## Setup Files

### Configuration Files

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest configuration with jsdom environment, path aliases, and coverage settings |
| `src/test/setup.ts` | Global test setup: mocks for IntersectionObserver, ResizeObserver, matchMedia |
| `package.json` | Test scripts: `test`, `test:watch`, `test:coverage` |

## Test Scripts

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Files

### Component Tests

| File | Component | Coverage |
|------|-----------|----------|
| `src/components/__tests__/ChatInterface.test.tsx` | ChatInterface | Message rendering, input handling, question types, loading states |
| `src/components/__tests__/AppErrorBoundary.test.tsx` | AppErrorBoundary | Error UI, recovery options, accessibility |

### Unit Tests

| File | Module | Coverage |
|------|--------|----------|
| `src/theme.test.ts` | theme.ts | Color tokens, typography, MUI overrides, accessibility |

## Test Patterns

### Component Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders content correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    const button = screen.getByRole('button', { name: /click/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Updated')).toBeInTheDocument()
    })
  })
})
```

### Key Testing Principles

1. **User-Centric**: Test behavior as users experience it, not implementation details
2. **Semantic Queries**: Use `getByRole`, `getByText`, `getByPlaceholderText` before `getByTestId`
3. **Async Handling**: Use `waitFor` for state updates and promise resolution
4. **Accessibility**: Verify ARIA labels, roles, and live regions in tests

## Writing New Tests

### Step 1: Create Test File

Place tests adjacent to components:
```
src/
  components/
    MyComponent.tsx
    __tests__/
      MyComponent.test.tsx
```

Or co-locate with utilities:
```
src/
  utils/
    helpers.ts
    helpers.test.ts
```

### Step 2: Import Testing Utilities

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

### Step 3: Write Descriptive Tests

```typescript
describe('ComponentName', () => {
  it('should render with correct initial state', () => {
    // Arrange
    const props = { /* ... */ }

    // Act
    render(<ComponentName {...props} />)

    // Assert
    expect(screen.getByText('Expected')).toBeInTheDocument()
  })

  it('should handle user submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ComponentName onSubmit={onSubmit} />)

    const button = screen.getByRole('button', { name: /submit/i })
    await user.click(button)

    expect(onSubmit).toHaveBeenCalled()
  })
})
```

## Mocking

### Module Mocks

```typescript
import { vi } from 'vitest'

// Mock entire module
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}))

// Mock specific function
const mockFetch = vi.fn()
```

### Component Mocks

```typescript
// Mock child component
vi.mock('../ChildComponent', () => ({
  default: () => <div>Mocked Child</div>
}))
```

## Global Mocks

The following are already mocked in `src/test/setup.ts`:
- `IntersectionObserver` — Used for lazy loading
- `ResizeObserver` — Used for responsive components
- `window.matchMedia` — Used for media queries

## Debugging Tests

### Run Specific Test File

```bash
npm run test -- src/components/__tests__/ChatInterface.test.tsx
```

### Run Tests Matching Pattern

```bash
npm run test -- --grep "handles user interactions"
```

### Enable Vitest UI

```bash
npm run test -- --ui
```

Opens interactive test runner at `http://localhost:51204`

### Console Logs in Tests

```typescript
import { screen, debug } from '@testing-library/react'

// Debug entire DOM
debug()

// Debug specific element
debug(screen.getByRole('button'))

// Print screen content
console.log(screen.logTestingPlaygroundURL())
```

## CI/CD Integration

Add to `.github/workflows/ci.yml`:

```yaml
- name: Run frontend tests
  working-directory: frontend
  run: npm run test

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    directory: ./frontend/coverage
```

## Coverage Goals

Target coverage by category:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

## Best Practices

### Do
- ✅ Test user interactions and workflows
- ✅ Use semantic queries (getByRole, getByLabelText)
- ✅ Test accessibility features (ARIA attributes)
- ✅ Keep tests focused and descriptive
- ✅ Mock external dependencies (API calls, timers)
- ✅ Use `userEvent` for realistic interactions
- ✅ Test error states and edge cases

### Don't
- ❌ Test implementation details (internal state, functions)
- ❌ Use `getByTestId` as first choice
- ❌ Test framework-specific behavior
- ❌ Create overly complex tests
- ❌ Mock internal components
- ❌ Ignore accessibility in tests
- ❌ Use `fireEvent` for user interactions (use `userEvent` instead)

## Common Patterns

### Testing Async Operations

```typescript
it('should load data', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ data: 'test' })
  vi.mock('axios', () => ({ default: { get: mockFetch } }))

  render(<Component />)

  await waitFor(() => {
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})
```

### Testing Form Submission

```typescript
it('should submit form', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()
  render(<Form onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText('Name'), 'John')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
})
```

### Testing Conditional Rendering

```typescript
it('should show error message on failure', () => {
  render(<Component shouldFail={true} />)
  expect(screen.getByRole('alert')).toHaveTextContent('Error occurred')
})
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://www.w3.org/WAI/test-evaluate/)

## Troubleshooting

### Tests Timeout

Increase timeout for slow tests:
```typescript
it('should complete slow operation', async () => {
  // test code
}, { timeout: 10000 }) // 10 seconds
```

### Hydration Errors

Use `suppressHydrationWarning` in development mode or mock DOM APIs properly in setup.ts.

### Import Aliases Not Working

Verify `vitest.config.ts` has correct path alias configuration matching `tsconfig.json`.

### Missing Module Errors

Ensure mocks are defined in `src/test/setup.ts` or in individual test files before imports.
