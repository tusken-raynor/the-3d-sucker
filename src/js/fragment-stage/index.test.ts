import { describe, it, expect } from 'vitest';
import { shadeFragment, createDefaultLight, type Light } from './index.ts';
import { createSolidTexture } from '@/js/texture-loader/index.ts';
import { vec2, vec3, vec4 } from '@/js/math/index.ts';
import type { Fragment } from '@/js/rasterizer/index.ts';

function createTestFragment(normal: {
  x: number;
  y: number;
  z: number;
}): Fragment {
  return {
    x: 0,
    y: 0,
    depth: 0,
    uv: vec2(0.5, 0.5),
    normal: vec3(normal.x, normal.y, normal.z),
    worldPosition: vec3(0, 0, 0),
  };
}

function createTestLight(): Light {
  return {
    direction: vec3(0, 0, 1),
    color: vec3(1, 1, 1),
    intensity: 1,
  };
}

describe('shadeFragment', () => {
  it('should return white when no texture and facing light', () => {
    const fragment = createTestFragment({ x: 0, y: 0, z: 1 });
    const light = createTestLight();

    const color = shadeFragment(fragment, null, light);

    // Should be bright (ambient + diffuse)
    expect(color.x).toBeGreaterThan(0.8);
    expect(color.y).toBeGreaterThan(0.8);
    expect(color.z).toBeGreaterThan(0.8);
    expect(color.w).toBe(1);
  });

  it('should apply texture color', () => {
    const fragment = createTestFragment({ x: 0, y: 0, z: 1 });
    const light = createTestLight();
    const texture = createSolidTexture(vec4(1, 0, 0, 1));

    const color = shadeFragment(fragment, texture, light);

    // Should be reddish
    expect(color.x).toBeGreaterThan(color.y);
    expect(color.x).toBeGreaterThan(color.z);
  });

  it('should be darker when facing away from light', () => {
    const fragmentFacing = createTestFragment({ x: 0, y: 0, z: 1 });
    const fragmentAway = createTestFragment({ x: 0, y: 0, z: -1 });
    const light = createTestLight();

    const colorFacing = shadeFragment(fragmentFacing, null, light);
    const colorAway = shadeFragment(fragmentAway, null, light);

    expect(colorFacing.x).toBeGreaterThan(colorAway.x);
  });

  it('should have minimum ambient light', () => {
    // Normal facing completely away from light
    const fragment = createTestFragment({ x: 0, y: 0, z: -1 });
    const light = createTestLight();

    const color = shadeFragment(fragment, null, light);

    // Should still have some ambient light
    expect(color.x).toBeGreaterThan(0.1);
  });

  it('should apply light color', () => {
    const fragment = createTestFragment({ x: 0, y: 0, z: 1 });
    const light: Light = {
      direction: vec3(0, 0, 1),
      color: vec3(1, 0, 0), // Red light
      intensity: 1,
    };

    const color = shadeFragment(fragment, null, light);

    expect(color.x).toBeGreaterThan(color.y);
    expect(color.x).toBeGreaterThan(color.z);
  });

  it('should preserve alpha from texture', () => {
    const fragment = createTestFragment({ x: 0, y: 0, z: 1 });
    const light = createTestLight();
    const texture = createSolidTexture(vec4(1, 1, 1, 0.5));

    const color = shadeFragment(fragment, texture, light);

    expect(color.w).toBeCloseTo(0.5, 1);
  });

  it('should handle non-unit normals', () => {
    const fragment = createTestFragment({ x: 0, y: 0, z: 2 }); // Not normalized
    const light = createTestLight();

    const color = shadeFragment(fragment, null, light);

    // Should still work correctly
    expect(color.x).toBeGreaterThan(0.8);
  });
});

describe('createDefaultLight', () => {
  it('should create a light with normalized direction', () => {
    const light = createDefaultLight();

    const length = Math.sqrt(
      light.direction.x ** 2 + light.direction.y ** 2 + light.direction.z ** 2
    );

    expect(length).toBeCloseTo(1, 5);
  });

  it('should have white color', () => {
    const light = createDefaultLight();

    expect(light.color.x).toBe(1);
    expect(light.color.y).toBe(1);
    expect(light.color.z).toBe(1);
  });

  it('should have intensity of 1', () => {
    const light = createDefaultLight();
    expect(light.intensity).toBe(1);
  });
});
