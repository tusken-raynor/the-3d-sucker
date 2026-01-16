import { AppError, ErrorCode } from '@/js/errors/index.ts';

export interface ErrorHandler {
  handle(error: unknown): AppError;
  getUserMessage(error: AppError): string;
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, ErrorCode.INTERNAL_ERROR, {
      originalName: error.name,
      stack: error.stack,
    });
  }

  return new AppError(String(error), ErrorCode.INTERNAL_ERROR, {
    originalValue: error,
  });
}

function getUserMessage(error: AppError): string {
  switch (error.code) {
    case ErrorCode.VALIDATION_ERROR:
      return `Invalid input: ${error.message}`;
    case ErrorCode.PARSE_ERROR:
      return `Failed to parse file: ${error.message}`;
    case ErrorCode.LOAD_ERROR:
      return `Failed to load resource: ${error.message}`;
    case ErrorCode.RENDER_ERROR:
      return 'A rendering error occurred. Please try again.';
    case ErrorCode.INTERNAL_ERROR:
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

function handle(error: unknown): AppError {
  const appError = toAppError(error);
  console.error(`[${appError.code}] ${appError.message}`, appError.context);
  return appError;
}

export const errorHandler: ErrorHandler = {
  handle,
  getUserMessage,
};
