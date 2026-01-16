import { describe, it, expect } from 'vitest';
import {
  createFramebuffer,
  clearFramebuffer,
  setPixel,
  getImageData,
} from './index.ts';
import { vec4 } from '@/js/math/index.ts';

describe('createFramebuffer', () => {
  it('should create framebuffer with correct dimensions', () => {
    const fb = createFramebuffer(100, 50);
    expect(fb.width).toBe(100);
    expect(fb.height).toBe(50);
  });

  it('should allocate color buffer with RGBA', () => {
    const fb = createFramebuffer(10, 10);
    expect(fb.colorBuffer.length).toBe(10 * 10 * 4);
  });

  it('should allocate depth buffer', () => {
    const fb = createFramebuffer(10, 10);
    expect(fb.depthBuffer.length).toBe(10 * 10);
  });

  it('should initialize depth buffer to Infinity', () => {
    const fb = createFramebuffer(10, 10);
    expect(fb.depthBuffer[0]).toBe(Infinity);
    expect(fb.depthBuffer[50]).toBe(Infinity);
  });
});

describe('clearFramebuffer', () => {
  it('should clear color buffer to specified color', () => {
    const fb = createFramebuffer(10, 10);
    const clearColor = vec4(1, 0.5, 0.25, 1);
    clearFramebuffer(fb, clearColor);

    expect(fb.colorBuffer[0]).toBe(255);
    expect(fb.colorBuffer[1]).toBe(128);
    expect(fb.colorBuffer[2]).toBe(64);
    expect(fb.colorBuffer[3]).toBe(255);
  });

  it('should reset depth buffer to Infinity', () => {
    const fb = createFramebuffer(10, 10);
    fb.depthBuffer[0] = 5;
    fb.depthBuffer[50] = 10;

    clearFramebuffer(fb, vec4(0, 0, 0, 1));

    expect(fb.depthBuffer[0]).toBe(Infinity);
    expect(fb.depthBuffer[50]).toBe(Infinity);
  });

  it('should clear all pixels', () => {
    const fb = createFramebuffer(10, 10);
    clearFramebuffer(fb, vec4(1, 1, 1, 1));

    for (let i = 0; i < fb.colorBuffer.length; i += 4) {
      expect(fb.colorBuffer[i]).toBe(255);
      expect(fb.colorBuffer[i + 1]).toBe(255);
      expect(fb.colorBuffer[i + 2]).toBe(255);
      expect(fb.colorBuffer[i + 3]).toBe(255);
    }
  });
});

describe('setPixel', () => {
  it('should set pixel color at valid coordinates', () => {
    const fb = createFramebuffer(10, 10);
    const color = vec4(1, 0, 0, 1);
    const result = setPixel(fb, 5, 3, color, 0.5);

    expect(result).toBe(true);

    const idx = (3 * 10 + 5) * 4;
    expect(fb.colorBuffer[idx]).toBe(255);
    expect(fb.colorBuffer[idx + 1]).toBe(0);
    expect(fb.colorBuffer[idx + 2]).toBe(0);
    expect(fb.colorBuffer[idx + 3]).toBe(255);
  });

  it('should set depth value', () => {
    const fb = createFramebuffer(10, 10);
    setPixel(fb, 5, 3, vec4(1, 0, 0, 1), 0.5);

    const depthIdx = 3 * 10 + 5;
    expect(fb.depthBuffer[depthIdx]).toBe(0.5);
  });

  it('should reject pixels outside left boundary', () => {
    const fb = createFramebuffer(10, 10);
    const result = setPixel(fb, -1, 5, vec4(1, 0, 0, 1), 0.5);
    expect(result).toBe(false);
  });

  it('should reject pixels outside right boundary', () => {
    const fb = createFramebuffer(10, 10);
    const result = setPixel(fb, 10, 5, vec4(1, 0, 0, 1), 0.5);
    expect(result).toBe(false);
  });

  it('should reject pixels outside top boundary', () => {
    const fb = createFramebuffer(10, 10);
    const result = setPixel(fb, 5, -1, vec4(1, 0, 0, 1), 0.5);
    expect(result).toBe(false);
  });

  it('should reject pixels outside bottom boundary', () => {
    const fb = createFramebuffer(10, 10);
    const result = setPixel(fb, 5, 10, vec4(1, 0, 0, 1), 0.5);
    expect(result).toBe(false);
  });

  it('should reject pixels behind existing depth', () => {
    const fb = createFramebuffer(10, 10);
    setPixel(fb, 5, 5, vec4(1, 0, 0, 1), 0.5);
    const result = setPixel(fb, 5, 5, vec4(0, 1, 0, 1), 0.6);

    expect(result).toBe(false);
    // Original color should remain
    const idx = (5 * 10 + 5) * 4;
    expect(fb.colorBuffer[idx]).toBe(255);
    expect(fb.colorBuffer[idx + 1]).toBe(0);
  });

  it('should accept pixels in front of existing depth', () => {
    const fb = createFramebuffer(10, 10);
    setPixel(fb, 5, 5, vec4(1, 0, 0, 1), 0.5);
    const result = setPixel(fb, 5, 5, vec4(0, 1, 0, 1), 0.3);

    expect(result).toBe(true);
    // New color should be written
    const idx = (5 * 10 + 5) * 4;
    expect(fb.colorBuffer[idx]).toBe(0);
    expect(fb.colorBuffer[idx + 1]).toBe(255);
  });

  it('should handle fractional coordinates by flooring', () => {
    const fb = createFramebuffer(10, 10);
    setPixel(fb, 5.9, 3.7, vec4(1, 0, 0, 1), 0.5);

    const idx = (3 * 10 + 5) * 4;
    expect(fb.colorBuffer[idx]).toBe(255);
  });
});

describe('getImageData', () => {
  it('should create ImageData from framebuffer', () => {
    const fb = createFramebuffer(100, 50);
    clearFramebuffer(fb, vec4(1, 0, 0, 1));

    const imageData = getImageData(fb);

    expect(imageData.width).toBe(100);
    expect(imageData.height).toBe(50);
    expect(imageData.data[0]).toBe(255);
    expect(imageData.data[1]).toBe(0);
    expect(imageData.data[2]).toBe(0);
    expect(imageData.data[3]).toBe(255);
  });
});
