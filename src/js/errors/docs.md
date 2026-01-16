# Errors Module

## Purpose

Provides a standardized error hierarchy for the 3D renderer application. All application-specific errors extend from `AppError`, which includes an error code and optional context for debugging.

## How It Works

The module defines:

1. **ErrorCode enum**: Categorizes errors by type (validation, parsing, loading, rendering, internal)
2. **AppError base class**: Extends native Error with code and context properties
3. **Specialized error classes**: ValidationError, ParseError, LoadError, RenderError

Each error class automatically sets its code based on type, simplifying error creation and handling.

## I/O Interface

### Exports

```typescript
// Error codes
enum ErrorCode {
  VALIDATION_ERROR
  PARSE_ERROR
  LOAD_ERROR
  RENDER_ERROR
  INTERNAL_ERROR
}

// Base error class
class AppError extends Error {
  code: ErrorCode
  context: Record<string, unknown>
}

// Specialized errors
class ValidationError extends AppError
class ParseError extends AppError
class LoadError extends AppError
class RenderError extends AppError
```

### Usage Examples

```typescript
import { ParseError, LoadError } from '@/js/errors';

// Throw a parse error with context
throw new ParseError('Invalid face format', { line: 42, content: 'f 1/2/3' });

// Throw a load error
throw new LoadError('File not found', { filename: 'model.obj' });
```

## Tests

Unit tests verify:

- All error codes exist and have correct values
- AppError stores message, code, and context correctly
- Each specialized error sets the correct code and name
- All errors are instances of both Error and AppError
- Context defaults to empty object when not provided
