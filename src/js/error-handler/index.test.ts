import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from './index.ts';
import {
  AppError,
  ErrorCode,
  ValidationError,
  ParseError,
  LoadError,
  RenderError,
} from '@/js/errors/index.ts';

describe('errorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('handle', () => {
    it('should return AppError unchanged', () => {
      const error = new ValidationError('Invalid input', { field: 'name' });
      const result = errorHandler.handle(error);

      expect(result).toBe(error);
      expect(result.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('should convert regular Error to AppError', () => {
      const error = new Error('Something went wrong');
      const result = errorHandler.handle(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(result.message).toBe('Something went wrong');
      expect(result.context).toHaveProperty('originalName', 'Error');
    });

    it('should convert string to AppError', () => {
      const result = errorHandler.handle('String error');

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(result.message).toBe('String error');
    });

    it('should convert non-error values to AppError', () => {
      const result = errorHandler.handle(42);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('42');
      expect(result.context).toHaveProperty('originalValue', 42);
    });

    it('should log error to console', () => {
      const error = new ParseError('Bad format');
      errorHandler.handle(error);

      expect(console.error).toHaveBeenCalledWith(
        '[PARSE_ERROR] Bad format',
        {}
      );
    });
  });

  describe('getUserMessage', () => {
    it('should format validation error message', () => {
      const error = new ValidationError('field is required');
      const message = errorHandler.getUserMessage(error);

      expect(message).toBe('Invalid input: field is required');
    });

    it('should format parse error message', () => {
      const error = new ParseError('invalid syntax');
      const message = errorHandler.getUserMessage(error);

      expect(message).toBe('Failed to parse file: invalid syntax');
    });

    it('should format load error message', () => {
      const error = new LoadError('file not found');
      const message = errorHandler.getUserMessage(error);

      expect(message).toBe('Failed to load resource: file not found');
    });

    it('should provide generic message for render error', () => {
      const error = new RenderError('depth buffer overflow');
      const message = errorHandler.getUserMessage(error);

      expect(message).toBe('A rendering error occurred. Please try again.');
    });

    it('should provide generic message for internal error', () => {
      const error = new AppError('unknown issue', ErrorCode.INTERNAL_ERROR);
      const message = errorHandler.getUserMessage(error);

      expect(message).toBe('An unexpected error occurred. Please try again.');
    });
  });
});
