# End-to-End Tests

## Purpose

E2E tests verify the complete user workflow in the browser environment using Playwright.

## Test File

### viewer.spec.ts

Tests the complete user workflow:

- [x] Display initial UI elements (canvas, file inputs, status)
- [x] Load valid OBJ file and show success message
- [x] Show error for invalid OBJ file
- [x] Show loading state while processing
- [x] Allow camera orbit via mouse drag
- [x] Allow camera zoom via scroll wheel
- [x] Handle texture input
- [x] Recover from error and allow new file loads
- [x] Handle rapid file changes gracefully
- [x] Resize canvas when viewport shrinks below 800px (maintains 4:3 aspect ratio)
- [x] Resize canvas when viewport expands after shrinking (verifies canvas grows back)
- [x] Maintain canvas rendering after resize (verifies continued functionality)
- [x] Complete workflow: load model and interact with camera

## Test Fixtures

Located in `fixtures/`:

- `cube.obj` - Valid cube model for testing
- `invalid.obj` - Invalid OBJ file for error testing

## Running E2E Tests

```bash
# Install Playwright browsers first (if not already done)
npx playwright install

# Run E2E tests
npm run test:e2e
```

## Notes

- Tests run against a local development server (started automatically)
- Camera interaction tests verify the gesture handling works
- Visual verification of rendering would require screenshot comparison (not implemented)
