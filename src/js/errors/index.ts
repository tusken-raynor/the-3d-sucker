export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  LOAD_ERROR: 'LOAD_ERROR',
  RENDER_ERROR: 'RENDER_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly context: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode,
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, ErrorCode.VALIDATION_ERROR, context);
    this.name = 'ValidationError';
  }
}

export class ParseError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, ErrorCode.PARSE_ERROR, context);
    this.name = 'ParseError';
  }
}

export class LoadError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, ErrorCode.LOAD_ERROR, context);
    this.name = 'LoadError';
  }
}

export class RenderError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, ErrorCode.RENDER_ERROR, context);
    this.name = 'RenderError';
  }
}
