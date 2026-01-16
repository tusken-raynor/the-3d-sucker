import { describe, it, expect } from 'vitest';
import { parseOBJ, normalizeModel } from '@/js/model-parser/index.ts';
import {
  createSolidTexture,
  sampleTexture,
} from '@/js/texture-loader/index.ts';
import { vec4 } from '@/js/math/index.ts';
import { ParseError } from '@/js/errors/index.ts';

describe('File Loading Integration', () => {
  describe('OBJ Loading', () => {
    it('should load valid OBJ file and produce renderable triangles', () => {
      const objText = `
        v 0 0 0
        v 1 0 0
        v 0 1 0
        v 1 1 0
        f 1 2 3
        f 2 4 3
      `;

      const model = parseOBJ(objText);

      expect(model.triangles).toHaveLength(2);
      expect(model.boundingBox).toBeDefined();
      expect(model.center).toBeDefined();
    });

    it('should normalize model to unit scale', () => {
      const objText = `
        v 0 0 0
        v 10 0 0
        v 5 10 0
        f 1 2 3
      `;

      const model = parseOBJ(objText);
      const normalized = normalizeModel(model);

      // After normalization, bounding box should be within -0.5 to 0.5
      for (const tri of normalized.triangles) {
        expect(Math.abs(tri.v0.position.x)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(tri.v0.position.y)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(tri.v1.position.x)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(tri.v1.position.y)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(tri.v2.position.x)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(tri.v2.position.y)).toBeLessThanOrEqual(0.5);
      }
    });

    it('should handle OBJ with UVs and normals', () => {
      const objText = `
        v 0 0 0
        v 1 0 0
        v 0 1 0
        vt 0 0
        vt 1 0
        vt 0 1
        vn 0 0 1
        f 1/1/1 2/2/1 3/3/1
      `;

      const model = parseOBJ(objText);

      expect(model.triangles).toHaveLength(1);
      expect(model.triangles[0].v0.uv.x).toBe(0);
      expect(model.triangles[0].v1.uv.x).toBe(1);
      expect(model.triangles[0].v0.normal.z).toBeCloseTo(1);
    });

    it('should reject invalid OBJ gracefully', () => {
      const invalidOBJ = `
        v invalid data
        f 1 2 3
      `;

      expect(() => parseOBJ(invalidOBJ)).toThrow(ParseError);
    });

    it('should reject empty OBJ files', () => {
      expect(() => parseOBJ('')).toThrow(ParseError);
      expect(() => parseOBJ('# just a comment')).toThrow(ParseError);
    });
  });

  describe('Texture Integration', () => {
    it('should create solid texture and sample it correctly', () => {
      const color = vec4(1, 0, 0, 1);
      const texture = createSolidTexture(color);

      const sampled = sampleTexture(texture, 0.5, 0.5, 'repeat');

      expect(sampled.x).toBeCloseTo(1);
      expect(sampled.y).toBeCloseTo(0);
      expect(sampled.z).toBeCloseTo(0);
      expect(sampled.w).toBeCloseTo(1);
    });

    it('should sample texture with repeat wrap mode', () => {
      const color = vec4(0, 1, 0, 1);
      const texture = createSolidTexture(color);

      // UV outside 0-1 range should wrap
      const sampled = sampleTexture(texture, 1.5, 1.5, 'repeat');

      expect(sampled.y).toBeCloseTo(1);
    });

    it('should sample texture with clamp wrap mode', () => {
      const color = vec4(0, 0, 1, 1);
      const texture = createSolidTexture(color);

      // UV outside 0-1 range should clamp
      const sampled = sampleTexture(texture, 2.0, 2.0, 'clamp');

      expect(sampled.z).toBeCloseTo(1);
    });
  });

  describe('Model and Texture Integration', () => {
    it('should preserve UVs through normalization for texture mapping', () => {
      const objText = `
        v 0 0 0
        v 100 0 0
        v 50 100 0
        vt 0 0
        vt 1 0
        vt 0.5 1
        f 1/1 2/2 3/3
      `;

      const model = parseOBJ(objText);
      const normalized = normalizeModel(model);

      // UVs should be preserved even after normalization
      expect(normalized.triangles[0].v0.uv.x).toBe(0);
      expect(normalized.triangles[0].v0.uv.y).toBe(0);
      expect(normalized.triangles[0].v1.uv.x).toBe(1);
      expect(normalized.triangles[0].v2.uv.y).toBe(1);
    });
  });
});
