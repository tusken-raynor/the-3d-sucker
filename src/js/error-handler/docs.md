# Error Handler Module

## Purpose

Provides centralized error handling for the 3D renderer application. Converts unknown errors to AppError instances, logs errors for debugging, and generates user-friendly messages.

## How It Works

The error handler:

1. **Converts errors**: Transforms any thrown value (Error, string, unknown) into an AppError
2. **Logs errors**: Outputs error code, message, and context to console for debugging
3. **Generates user messages**: Creates appropriate user-facing messages based on error type

Internal error details are never exposed to users. Sensitive data (like full stack traces) stays in the context for developer debugging only.

## I/O Interface

### Exports

```typescript
interface ErrorHandler {
  handle(error: unknown): AppError;
  getUserMessage(error: AppError): string;
}

const errorHandler: ErrorHandler;
```

### Usage Examples

```typescript
import { errorHandler } from '@/js/error-handler';
import { ParseError } from '@/js/errors';

try {
  parseOBJ(invalidContent);
} catch (error) {
  const appError = errorHandler.handle(error);
  const userMessage = errorHandler.getUserMessage(appError);
  showError(userMessage);
  throw appError;
}
```

## Tests

Unit tests verify:

- AppError instances pass through unchanged
- Regular Error objects convert to AppError with INTERNAL_ERROR code
- String values convert to AppError
- Non-error values convert to AppError with original value in context
- Errors are logged to console with code and message
- User messages are formatted appropriately for each error type
- Internal error details are not exposed in user messages
