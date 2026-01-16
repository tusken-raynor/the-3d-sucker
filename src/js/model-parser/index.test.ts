import { describe, it, expect } from 'vitest';
import { parseOBJ, normalizeModel } from './index.ts';
import { ParseError } from '@/js/errors/index.ts';

const SIMPLE_TRIANGLE = `
# Simple triangle
v 0 0 0
v 1 0 0
v 0 1 0
f 1 2 3
`;

const TRIANGLE_WITH_UVS = `
v 0 0 0
v 1 0 0
v 0 1 0
vt 0 0
vt 1 0
vt 0 1
f 1/1 2/2 3/3
`;

const TRIANGLE_WITH_NORMALS = `
v 0 0 0
v 1 0 0
v 0 1 0
vn 0 0 1
f 1//1 2//1 3//1
`;

const QUAD = `
v -1 -1 0
v 1 -1 0
v 1 1 0
v -1 1 0
f 1 2 3 4
`;

const CUBE_OBJ = `
# Cube
v -0.5 -0.5 0.5
v 0.5 -0.5 0.5
v 0.5 0.5 0.5
v -0.5 0.5 0.5
v -0.5 -0.5 -0.5
v 0.5 -0.5 -0.5
v 0.5 0.5 -0.5
v -0.5 0.5 -0.5
f 1 2 3 4
f 5 8 7 6
f 1 5 6 2
f 2 6 7 3
f 3 7 8 4
f 4 8 5 1
`;

describe('parseOBJ', () => {
  it('should parse a simple triangle', () => {
    const model = parseOBJ(SIMPLE_TRIANGLE);

    expect(model.triangles.length).toBe(1);
    expect(model.triangles[0].v0.position.x).toBe(0);
    expect(model.triangles[0].v1.position.x).toBe(1);
    expect(model.triangles[0].v2.position.y).toBe(1);
  });

  it('should parse UV coordinates', () => {
    const model = parseOBJ(TRIANGLE_WITH_UVS);

    expect(model.triangles[0].v0.uv.x).toBe(0);
    expect(model.triangles[0].v0.uv.y).toBe(0);
    expect(model.triangles[0].v1.uv.x).toBe(1);
    expect(model.triangles[0].v2.uv.y).toBe(1);
  });

  it('should parse vertex normals', () => {
    const model = parseOBJ(TRIANGLE_WITH_NORMALS);

    expect(model.triangles[0].v0.normal.z).toBeCloseTo(1);
    expect(model.triangles[0].v1.normal.z).toBeCloseTo(1);
    expect(model.triangles[0].v2.normal.z).toBeCloseTo(1);
  });

  it('should triangulate quads', () => {
    const model = parseOBJ(QUAD);

    expect(model.triangles.length).toBe(2);
  });

  it('should parse a cube', () => {
    const model = parseOBJ(CUBE_OBJ);

    // 6 faces * 2 triangles = 12 triangles
    expect(model.triangles.length).toBe(12);
  });

  it('should compute bounding box', () => {
    const model = parseOBJ(CUBE_OBJ);

    expect(model.boundingBox.min.x).toBe(-0.5);
    expect(model.boundingBox.max.x).toBe(0.5);
    expect(model.boundingBox.min.y).toBe(-0.5);
    expect(model.boundingBox.max.y).toBe(0.5);
  });

  it('should compute center', () => {
    const model = parseOBJ(CUBE_OBJ);

    expect(model.center.x).toBeCloseTo(0);
    expect(model.center.y).toBeCloseTo(0);
    expect(model.center.z).toBeCloseTo(0);
  });

  it('should throw on empty file', () => {
    expect(() => parseOBJ('')).toThrow(ParseError);
    expect(() => parseOBJ('# Just a comment')).toThrow(ParseError);
  });

  it('should throw on invalid vertex', () => {
    expect(() => parseOBJ('v 1 2')).toThrow(ParseError);
  });

  it('should throw on invalid face', () => {
    expect(() => parseOBJ('v 0 0 0\nf 1')).toThrow(ParseError);
  });

  it('should compute normals when not provided', () => {
    const model = parseOBJ(SIMPLE_TRIANGLE);

    // Normal should be computed from cross product
    // For triangle in XY plane, normal should be along Z
    expect(Math.abs(model.triangles[0].v0.normal.z)).toBeGreaterThan(0.9);
  });

  it('should handle various face formats', () => {
    const obj = `
v 0 0 0
v 1 0 0
v 0 1 0
v 1 1 0
vt 0 0
vt 1 0
vn 0 0 1
f 1 2 3
f 1/1 2/1 4/2
f 1//1 3//1 4//1
f 1/1/1 2/1/1 3/1/1
`;
    const model = parseOBJ(obj);
    expect(model.triangles.length).toBe(4);
  });

  it('should ignore unsupported commands', () => {
    const obj = `
mtllib material.mtl
o MyObject
g Group1
usemtl Material1
s off
v 0 0 0
v 1 0 0
v 0 1 0
f 1 2 3
`;
    const model = parseOBJ(obj);
    expect(model.triangles.length).toBe(1);
  });
});

describe('normalizeModel', () => {
  it('should center the model', () => {
    const obj = `
v 10 20 30
v 12 20 30
v 10 22 30
f 1 2 3
`;
    const model = parseOBJ(obj);
    const normalized = normalizeModel(model);

    expect(normalized.center.x).toBe(0);
    expect(normalized.center.y).toBe(0);
    expect(normalized.center.z).toBe(0);
  });

  it('should scale model to unit size', () => {
    const obj = `
v 0 0 0
v 10 0 0
v 0 10 0
f 1 2 3
`;
    const model = parseOBJ(obj);
    const normalized = normalizeModel(model);

    // Model should fit in [-0.5, 0.5]
    for (const tri of normalized.triangles) {
      expect(tri.v0.position.x).toBeGreaterThanOrEqual(-0.5);
      expect(tri.v0.position.x).toBeLessThanOrEqual(0.5);
    }
  });

  it('should preserve UVs', () => {
    const obj = `
v 0 0 0
v 10 0 0
v 0 10 0
vt 0.5 0.5
vt 1 0
vt 0 1
f 1/1 2/2 3/3
`;
    const model = parseOBJ(obj);
    const normalized = normalizeModel(model);

    expect(normalized.triangles[0].v0.uv.x).toBe(0.5);
    expect(normalized.triangles[0].v0.uv.y).toBe(0.5);
  });

  it('should preserve normals', () => {
    const obj = `
v 0 0 0
v 10 0 0
v 0 10 0
vn 0 0 1
f 1//1 2//1 3//1
`;
    const model = parseOBJ(obj);
    const normalized = normalizeModel(model);

    expect(normalized.triangles[0].v0.normal.z).toBeCloseTo(1);
  });
});
