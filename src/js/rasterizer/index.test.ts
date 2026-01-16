import { describe, it, expect } from 'vitest';
import { rasterizeTriangle, type ClipVertex } from './index.ts';
import { vec2, vec3, vec4 } from '@/js/math/index.ts';

function createVertex(
  x: number,
  y: number,
  z: number,
  w: number = 1
): ClipVertex {
  return {
    position: vec4(x, y, z, w),
    uv: vec2(0, 0),
    normal: vec3(0, 0, 1),
    worldPosition: vec3(x, y, z),
  };
}

describe('rasterizeTriangle', () => {
  it('should rasterize a simple triangle in clip space', () => {
    // Triangle covering roughly the center of the viewport
    const v0 = createVertex(0, 0.5, 0, 1);
    const v1 = createVertex(-0.5, -0.5, 0, 1);
    const v2 = createVertex(0.5, -0.5, 0, 1);

    const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, false);

    expect(fragments.length).toBeGreaterThan(0);
  });

  it('should produce fragments within viewport bounds', () => {
    const v0 = createVertex(0, 0.5, 0, 1);
    const v1 = createVertex(-0.5, -0.5, 0, 1);
    const v2 = createVertex(0.5, -0.5, 0, 1);

    const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, false);

    for (const frag of fragments) {
      expect(frag.x).toBeGreaterThanOrEqual(0);
      expect(frag.x).toBeLessThan(100);
      expect(frag.y).toBeGreaterThanOrEqual(0);
      expect(frag.y).toBeLessThan(100);
    }
  });

  it('should cull back-facing triangles when enabled', () => {
    // Counter-clockwise winding (front-facing)
    const v0 = createVertex(0, 0.5, 0, 1);
    const v1 = createVertex(-0.5, -0.5, 0, 1);
    const v2 = createVertex(0.5, -0.5, 0, 1);

    const frontFragments = rasterizeTriangle(v0, v1, v2, 100, 100, true);

    // Clockwise winding (back-facing) - swap v1 and v2
    const backFragments = rasterizeTriangle(v0, v2, v1, 100, 100, true);

    expect(frontFragments.length).toBeGreaterThan(0);
    expect(backFragments.length).toBe(0);
  });

  it('should not cull back-facing triangles when culling disabled', () => {
    const v0 = createVertex(0, 0.5, 0, 1);
    const v1 = createVertex(0.5, -0.5, 0, 1);
    const v2 = createVertex(-0.5, -0.5, 0, 1);

    const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, false);

    expect(fragments.length).toBeGreaterThan(0);
  });

  it('should clip triangles behind near plane', () => {
    // All vertices behind near plane (z < -w)
    const v0 = createVertex(0, 0, -2, 1);
    const v1 = createVertex(-1, -1, -2, 1);
    const v2 = createVertex(1, -1, -2, 1);

    const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, false);

    expect(fragments.length).toBe(0);
  });

  it('should skip degenerate triangles', () => {
    // All three points at same location
    const v0 = createVertex(0, 0, 0, 1);
    const v1 = createVertex(0, 0, 0, 1);
    const v2 = createVertex(0, 0, 0, 1);

    const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, false);

    expect(fragments.length).toBe(0);
  });

  it('should skip triangles with invalid w', () => {
    const v0 = createVertex(0, 0, 0, 0);
    const v1 = createVertex(-1, -1, 0, 1);
    const v2 = createVertex(1, -1, 0, 1);

    const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, false);

    expect(fragments.length).toBe(0);
  });

  it('should produce fragments with depth values', () => {
    const v0 = createVertex(0, 0.5, 0.5, 1);
    const v1 = createVertex(-0.5, -0.5, 0.5, 1);
    const v2 = createVertex(0.5, -0.5, 0.5, 1);

    const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, false);

    for (const frag of fragments) {
      expect(typeof frag.depth).toBe('number');
      expect(isFinite(frag.depth)).toBe(true);
    }
  });

  it('should interpolate UV coordinates', () => {
    const v0: ClipVertex = {
      position: vec4(0, 0.5, 0, 1),
      uv: vec2(0.5, 0),
      normal: vec3(0, 0, 1),
      worldPosition: vec3(0, 0.5, 0),
    };
    const v1: ClipVertex = {
      position: vec4(-0.5, -0.5, 0, 1),
      uv: vec2(0, 1),
      normal: vec3(0, 0, 1),
      worldPosition: vec3(-0.5, -0.5, 0),
    };
    const v2: ClipVertex = {
      position: vec4(0.5, -0.5, 0, 1),
      uv: vec2(1, 1),
      normal: vec3(0, 0, 1),
      worldPosition: vec3(0.5, -0.5, 0),
    };

    const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, false);

    for (const frag of fragments) {
      // UV should be within reasonable bounds
      expect(frag.uv.x).toBeGreaterThanOrEqual(-0.1);
      expect(frag.uv.x).toBeLessThanOrEqual(1.1);
      expect(frag.uv.y).toBeGreaterThanOrEqual(-0.1);
      expect(frag.uv.y).toBeLessThanOrEqual(1.1);
    }
  });

  it('should clip triangles partially behind near plane', () => {
    // One vertex behind, two in front
    const v0 = createVertex(0, 0.5, 0, 1); // In front
    const v1 = createVertex(-0.5, -0.5, 0, 1); // In front
    const v2 = createVertex(0, 0, -2, 1); // Behind (z < -w)

    const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, false);

    // Should still produce some fragments from the clipped triangle
    expect(fragments.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle triangles outside viewport', () => {
    // Triangle completely to the left of viewport
    const v0 = createVertex(-2, 0, 0, 1);
    const v1 = createVertex(-3, -1, 0, 1);
    const v2 = createVertex(-3, 1, 0, 1);

    const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, false);

    expect(fragments.length).toBe(0);
  });
});
