import { describe, it, expect } from 'vitest';
import { createSolidTexture, sampleTexture, type Texture } from './index.ts';
import { vec4 } from '@/js/math/index.ts';

function createTestTexture(): Texture {
  // 2x2 texture: red, green, blue, white
  const data = new Uint8ClampedArray([
    255,
    0,
    0,
    255, // (0,0) red
    0,
    255,
    0,
    255, // (1,0) green
    0,
    0,
    255,
    255, // (0,1) blue
    255,
    255,
    255,
    255, // (1,1) white
  ]);
  return { width: 2, height: 2, data };
}

describe('createSolidTexture', () => {
  it('should create texture with single color', () => {
    const texture = createSolidTexture(vec4(1, 0.5, 0.25, 1));

    expect(texture.width).toBe(1);
    expect(texture.height).toBe(1);
    expect(texture.data[0]).toBe(255);
    expect(texture.data[1]).toBe(128);
    expect(texture.data[2]).toBe(64);
    expect(texture.data[3]).toBe(255);
  });

  it('should create larger solid texture', () => {
    const texture = createSolidTexture(vec4(1, 1, 1, 1), 4);

    expect(texture.width).toBe(4);
    expect(texture.height).toBe(4);
    expect(texture.data.length).toBe(4 * 4 * 4);
  });
});

describe('sampleTexture', () => {
  it('should sample bottom-left corner', () => {
    const texture = createTestTexture();
    // UV (0,0) maps to image (0, height-1) which is blue
    const color = sampleTexture(texture, 0, 0, 'clamp');

    expect(color.z).toBeGreaterThan(0.9); // Blue
    expect(color.x).toBeLessThan(0.1);
    expect(color.y).toBeLessThan(0.1);
  });

  it('should sample top-left corner', () => {
    const texture = createTestTexture();
    // UV (0,1) maps to image (0, 0) which is red
    const color = sampleTexture(texture, 0, 1, 'clamp');

    expect(color.x).toBeGreaterThan(0.9); // Red
    expect(color.y).toBeLessThan(0.1);
    expect(color.z).toBeLessThan(0.1);
  });

  it('should sample bottom-right corner', () => {
    const texture = createTestTexture();
    // UV (1,0) maps to image (1, height-1) which is white
    const color = sampleTexture(texture, 1, 0, 'clamp');

    expect(color.x).toBeGreaterThan(0.9);
    expect(color.y).toBeGreaterThan(0.9);
    expect(color.z).toBeGreaterThan(0.9);
  });

  it('should handle repeat wrap mode', () => {
    const texture = createSolidTexture(vec4(1, 0, 0, 1));
    const color = sampleTexture(texture, 1.5, 1.5, 'repeat');

    expect(color.x).toBeGreaterThan(0.9);
    expect(color.y).toBeLessThan(0.1);
  });

  it('should handle clamp wrap mode', () => {
    const texture = createSolidTexture(vec4(0, 1, 0, 1));
    const color = sampleTexture(texture, 2, -1, 'clamp');

    expect(color.y).toBeGreaterThan(0.9);
  });

  it('should handle negative UV coordinates with repeat', () => {
    const texture = createSolidTexture(vec4(0, 0, 1, 1));
    const color = sampleTexture(texture, -0.5, -0.5, 'repeat');

    expect(color.z).toBeGreaterThan(0.9);
  });

  it('should return alpha channel', () => {
    const texture = createSolidTexture(vec4(1, 1, 1, 0.5));
    const color = sampleTexture(texture, 0.5, 0.5, 'clamp');

    expect(color.w).toBeCloseTo(0.5, 1);
  });
});
