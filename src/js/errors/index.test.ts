import { describe, it, expect } from 'vitest';
import {
  ErrorCode,
  AppError,
  ValidationError,
  ParseError,
  LoadError,
  RenderError,
} from './index.ts';

describe('ErrorCode', () => {
  it('should have all expected error codes', () => {
    expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCode.PARSE_ERROR).toBe('PARSE_ERROR');
    expect(ErrorCode.LOAD_ERROR).toBe('LOAD_ERROR');
    expect(ErrorCode.RENDER_ERROR).toBe('RENDER_ERROR');
    expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
  });
});

describe('AppError', () => {
  it('should create error with message and code', () => {
    const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR);

    expect(error.message).toBe('Test error');
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(error.name).toBe('AppError');
    expect(error.context).toEqual({});
  });

  it('should create error with context', () => {
    const context = { userId: '123', resourceId: 'abc' };
    const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR, context);

    expect(error.context).toEqual(context);
  });

  it('should be instance of Error', () => {
    const error = new AppError('Test', ErrorCode.INTERNAL_ERROR);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('ValidationError', () => {
  it('should create validation error with correct code', () => {
    const error = new ValidationError('Invalid input');

    expect(error.message).toBe('Invalid input');
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.name).toBe('ValidationError');
  });

  it('should accept context', () => {
    const error = new ValidationError('Invalid input', { field: 'name' });
    expect(error.context).toEqual({ field: 'name' });
  });

  it('should be instance of AppError', () => {
    const error = new ValidationError('Test');
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('ParseError', () => {
  it('should create parse error with correct code', () => {
    const error = new ParseError('Failed to parse OBJ');

    expect(error.message).toBe('Failed to parse OBJ');
    expect(error.code).toBe(ErrorCode.PARSE_ERROR);
    expect(error.name).toBe('ParseError');
  });

  it('should accept context', () => {
    const error = new ParseError('Parse failed', { line: 42 });
    expect(error.context).toEqual({ line: 42 });
  });

  it('should be instance of AppError', () => {
    const error = new ParseError('Test');
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('LoadError', () => {
  it('should create load error with correct code', () => {
    const error = new LoadError('Failed to load file');

    expect(error.message).toBe('Failed to load file');
    expect(error.code).toBe(ErrorCode.LOAD_ERROR);
    expect(error.name).toBe('LoadError');
  });

  it('should accept context', () => {
    const error = new LoadError('Load failed', { filename: 'test.obj' });
    expect(error.context).toEqual({ filename: 'test.obj' });
  });

  it('should be instance of AppError', () => {
    const error = new LoadError('Test');
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('RenderError', () => {
  it('should create render error with correct code', () => {
    const error = new RenderError('Render failed');

    expect(error.message).toBe('Render failed');
    expect(error.code).toBe(ErrorCode.RENDER_ERROR);
    expect(error.name).toBe('RenderError');
  });

  it('should accept context', () => {
    const error = new RenderError('Render failed', { triangleIndex: 5 });
    expect(error.context).toEqual({ triangleIndex: 5 });
  });

  it('should be instance of AppError', () => {
    const error = new RenderError('Test');
    expect(error).toBeInstanceOf(AppError);
  });
});
