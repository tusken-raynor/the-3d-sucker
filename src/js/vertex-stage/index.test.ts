import { describe, it, expect } from 'vitest';
import { transformVertex, type Vertex } from './index.ts';
import {
  vec2,
  vec3,
  mat4Identity,
  mat4Translate,
  mat4Scale,
  mat4Perspective,
  mat4Multiply,
} from '@/js/math/index.ts';

describe('transformVertex', () => {
  it('should pass through vertex with identity matrices', () => {
    const vertex: Vertex = {
      position: vec3(1, 2, 3),
      uv: vec2(0.5, 0.5),
      normal: vec3(0, 1, 0),
    };

    const mvp = mat4Identity();
    const model = mat4Identity();

    const result = transformVertex(vertex, mvp, model);

    expect(result.position.x).toBe(1);
    expect(result.position.y).toBe(2);
    expect(result.position.z).toBe(3);
    expect(result.position.w).toBe(1);
    expect(result.uv.x).toBe(0.5);
    expect(result.uv.y).toBe(0.5);
  });

  it('should transform position to clip space', () => {
    const vertex: Vertex = {
      position: vec3(1, 0, 0),
      uv: vec2(0, 0),
      normal: vec3(0, 0, 1),
    };

    const mvp = mat4Translate(mat4Identity(), vec3(5, 0, 0));
    const model = mat4Identity();

    const result = transformVertex(vertex, mvp, model);

    expect(result.position.x).toBe(6);
    expect(result.position.y).toBe(0);
    expect(result.position.z).toBe(0);
  });

  it('should compute world position from model matrix', () => {
    const vertex: Vertex = {
      position: vec3(1, 0, 0),
      uv: vec2(0, 0),
      normal: vec3(0, 0, 1),
    };

    const model = mat4Translate(mat4Identity(), vec3(10, 20, 30));
    const mvp = model; // Using same for simplicity

    const result = transformVertex(vertex, mvp, model);

    expect(result.worldPosition.x).toBe(11);
    expect(result.worldPosition.y).toBe(20);
    expect(result.worldPosition.z).toBe(30);
  });

  it('should transform normal to world space', () => {
    const vertex: Vertex = {
      position: vec3(0, 0, 0),
      uv: vec2(0, 0),
      normal: vec3(0, 1, 0),
    };

    // Scale by 2 in all directions
    const model = mat4Scale(mat4Identity(), vec3(2, 2, 2));
    const mvp = model;

    const result = transformVertex(vertex, mvp, model);

    // Normal should be scaled (not normalized in this function)
    expect(result.normal.x).toBe(0);
    expect(result.normal.y).toBe(2);
    expect(result.normal.z).toBe(0);
  });

  it('should preserve UV coordinates', () => {
    const vertex: Vertex = {
      position: vec3(0, 0, 0),
      uv: vec2(0.25, 0.75),
      normal: vec3(0, 0, 1),
    };

    const mvp = mat4Translate(mat4Identity(), vec3(100, 100, 100));
    const model = mat4Identity();

    const result = transformVertex(vertex, mvp, model);

    expect(result.uv.x).toBe(0.25);
    expect(result.uv.y).toBe(0.75);
  });

  it('should work with perspective projection', () => {
    const vertex: Vertex = {
      position: vec3(0, 0, -5),
      uv: vec2(0, 0),
      normal: vec3(0, 0, 1),
    };

    const projection = mat4Perspective(Math.PI / 4, 1, 0.1, 100);
    const model = mat4Identity();

    const result = transformVertex(vertex, projection, model);

    // With perspective, w should not be 1
    expect(result.position.w).not.toBe(1);
  });

  it('should handle combined MVP matrix', () => {
    const vertex: Vertex = {
      position: vec3(1, 0, 0),
      uv: vec2(0, 0),
      normal: vec3(1, 0, 0),
    };

    const model = mat4Translate(mat4Identity(), vec3(0, 0, -5));
    const view = mat4Identity();
    const projection = mat4Perspective(Math.PI / 4, 1, 0.1, 100);
    const mvp = mat4Multiply(mat4Multiply(projection, view), model);

    const result = transformVertex(vertex, mvp, model);

    // Should produce valid clip space coordinates
    expect(isFinite(result.position.x)).toBe(true);
    expect(isFinite(result.position.y)).toBe(true);
    expect(isFinite(result.position.z)).toBe(true);
    expect(isFinite(result.position.w)).toBe(true);
  });
});
