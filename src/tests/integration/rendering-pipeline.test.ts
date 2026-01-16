import { describe, it, expect } from 'vitest';
import { transformVertex, type Vertex } from '@/js/vertex-stage/index.ts';
import { rasterizeTriangle } from '@/js/rasterizer/index.ts';
import {
  shadeFragment,
  createDefaultLight,
} from '@/js/fragment-stage/index.ts';
import {
  createFramebuffer,
  clearFramebuffer,
  setPixel,
} from '@/js/framebuffer/index.ts';
import {
  vec2,
  vec3,
  vec4,
  mat4Identity,
  mat4Perspective,
  mat4Translate,
  mat4Multiply,
} from '@/js/math/index.ts';
import { createSolidTexture } from '@/js/texture-loader/index.ts';

describe('Rendering Pipeline Integration', () => {
  describe('Vertex Transformation', () => {
    it('should transform vertex through MVP matrix to clip space', () => {
      const vertex: Vertex = {
        position: vec3(0, 0, -3),
        uv: vec2(0.5, 0.5),
        normal: vec3(0, 0, 1),
      };

      const projection = mat4Perspective(Math.PI / 4, 1, 0.1, 100);
      const model = mat4Identity();
      const mvp = mat4Multiply(projection, model);

      const clipVertex = transformVertex(vertex, mvp, model);

      // Should have valid clip space coordinates
      expect(isFinite(clipVertex.position.x)).toBe(true);
      expect(isFinite(clipVertex.position.y)).toBe(true);
      expect(isFinite(clipVertex.position.z)).toBe(true);
      expect(isFinite(clipVertex.position.w)).toBe(true);
      expect(clipVertex.position.w).not.toBe(0);
    });

    it('should preserve world position from model matrix', () => {
      const vertex: Vertex = {
        position: vec3(1, 0, 0),
        uv: vec2(0, 0),
        normal: vec3(0, 0, 1),
      };

      const model = mat4Translate(mat4Identity(), vec3(5, 10, 15));
      const projection = mat4Perspective(Math.PI / 4, 1, 0.1, 100);
      const mvp = mat4Multiply(projection, model);

      const clipVertex = transformVertex(vertex, mvp, model);

      expect(clipVertex.worldPosition.x).toBeCloseTo(6);
      expect(clipVertex.worldPosition.y).toBeCloseTo(10);
      expect(clipVertex.worldPosition.z).toBeCloseTo(15);
    });
  });

  describe('Rasterization', () => {
    it('should produce fragments for visible triangle', () => {
      const v0 = {
        position: vec4(0, 0.5, 0.5, 1),
        uv: vec2(0.5, 0),
        normal: vec3(0, 0, 1),
        worldPosition: vec3(0, 0.5, 0),
      };
      const v1 = {
        position: vec4(-0.5, -0.5, 0.5, 1),
        uv: vec2(0, 1),
        normal: vec3(0, 0, 1),
        worldPosition: vec3(-0.5, -0.5, 0),
      };
      const v2 = {
        position: vec4(0.5, -0.5, 0.5, 1),
        uv: vec2(1, 1),
        normal: vec3(0, 0, 1),
        worldPosition: vec3(0.5, -0.5, 0),
      };

      const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, true);

      expect(fragments.length).toBeGreaterThan(0);

      // All fragments should be within bounds
      for (const frag of fragments) {
        expect(frag.x).toBeGreaterThanOrEqual(0);
        expect(frag.x).toBeLessThan(100);
        expect(frag.y).toBeGreaterThanOrEqual(0);
        expect(frag.y).toBeLessThan(100);
      }
    });

    it('should interpolate UVs across fragments', () => {
      const v0 = {
        position: vec4(0, 0.5, 0.5, 1),
        uv: vec2(0.5, 0),
        normal: vec3(0, 0, 1),
        worldPosition: vec3(0, 0, 0),
      };
      const v1 = {
        position: vec4(-0.5, -0.5, 0.5, 1),
        uv: vec2(0, 1),
        normal: vec3(0, 0, 1),
        worldPosition: vec3(0, 0, 0),
      };
      const v2 = {
        position: vec4(0.5, -0.5, 0.5, 1),
        uv: vec2(1, 1),
        normal: vec3(0, 0, 1),
        worldPosition: vec3(0, 0, 0),
      };

      const fragments = rasterizeTriangle(v0, v1, v2, 100, 100, true);

      // UVs should be within 0-1 range (interpolated from vertex UVs)
      for (const frag of fragments) {
        expect(frag.uv.x).toBeGreaterThanOrEqual(0);
        expect(frag.uv.x).toBeLessThanOrEqual(1);
        expect(frag.uv.y).toBeGreaterThanOrEqual(0);
        expect(frag.uv.y).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Fragment Shading', () => {
    it('should shade fragment with texture and lighting', () => {
      const fragment = {
        x: 50,
        y: 50,
        depth: 0.5,
        uv: vec2(0.5, 0.5),
        normal: vec3(0, 0, 1),
        worldPosition: vec3(0, 0, 0),
      };

      const texture = createSolidTexture(vec4(1, 0, 0, 1));
      const light = createDefaultLight();

      const color = shadeFragment(fragment, texture, light);

      // Should have some red component from texture
      expect(color.x).toBeGreaterThan(0);
      // Should have full alpha
      expect(color.w).toBe(1);
    });

    it('should apply diffuse lighting based on normal', () => {
      const fragmentFacing = {
        x: 50,
        y: 50,
        depth: 0.5,
        uv: vec2(0.5, 0.5),
        normal: vec3(0, 0, 1),
        worldPosition: vec3(0, 0, 0),
      };

      const fragmentAway = {
        x: 50,
        y: 50,
        depth: 0.5,
        uv: vec2(0.5, 0.5),
        normal: vec3(0, 0, -1),
        worldPosition: vec3(0, 0, 0),
      };

      const light = {
        direction: vec3(0, 0, 1),
        color: vec3(1, 1, 1),
        intensity: 1,
      };

      const colorFacing = shadeFragment(fragmentFacing, null, light);
      const colorAway = shadeFragment(fragmentAway, null, light);

      // Fragment facing light should be brighter
      expect(colorFacing.x).toBeGreaterThan(colorAway.x);
    });
  });

  describe('Framebuffer Integration', () => {
    it('should write shaded fragments to framebuffer with depth testing', () => {
      const fb = createFramebuffer(100, 100);
      clearFramebuffer(fb, vec4(0, 0, 0, 1));

      // Write a far pixel
      const farColor = vec4(1, 0, 0, 1);
      setPixel(fb, 50, 50, farColor, 0.9);

      // Write a near pixel at same location - should overwrite
      const nearColor = vec4(0, 1, 0, 1);
      const written = setPixel(fb, 50, 50, nearColor, 0.1);

      expect(written).toBe(true);

      // Check that near color was written
      const idx = (50 * 100 + 50) * 4;
      expect(fb.colorBuffer[idx]).toBe(0); // R
      expect(fb.colorBuffer[idx + 1]).toBe(255); // G
    });

    it('should reject pixels behind existing depth', () => {
      const fb = createFramebuffer(100, 100);
      clearFramebuffer(fb, vec4(0, 0, 0, 1));

      // Write a near pixel
      setPixel(fb, 50, 50, vec4(1, 0, 0, 1), 0.1);

      // Try to write a far pixel - should be rejected
      const written = setPixel(fb, 50, 50, vec4(0, 1, 0, 1), 0.9);

      expect(written).toBe(false);
    });
  });

  describe('Full Pipeline', () => {
    it('should render triangle through complete pipeline', () => {
      // Create triangle vertices
      const vertices: Vertex[] = [
        { position: vec3(0, 0.5, -3), uv: vec2(0.5, 0), normal: vec3(0, 0, 1) },
        {
          position: vec3(-0.5, -0.5, -3),
          uv: vec2(0, 1),
          normal: vec3(0, 0, 1),
        },
        {
          position: vec3(0.5, -0.5, -3),
          uv: vec2(1, 1),
          normal: vec3(0, 0, 1),
        },
      ];

      // Create MVP matrix
      const projection = mat4Perspective(Math.PI / 4, 1, 0.1, 100);
      const model = mat4Identity();
      const mvp = mat4Multiply(projection, model);

      // Transform vertices
      const clipVertices = vertices.map((v) => transformVertex(v, mvp, model));

      // Rasterize
      const fragments = rasterizeTriangle(
        clipVertices[0],
        clipVertices[1],
        clipVertices[2],
        100,
        100,
        true
      );

      // Shade and write to framebuffer
      const fb = createFramebuffer(100, 100);
      clearFramebuffer(fb, vec4(0.1, 0.1, 0.15, 1));

      const texture = createSolidTexture(vec4(1, 0.5, 0.25, 1));
      const light = createDefaultLight();

      let pixelsWritten = 0;
      for (const fragment of fragments) {
        const color = shadeFragment(fragment, texture, light);
        if (setPixel(fb, fragment.x, fragment.y, color, fragment.depth)) {
          pixelsWritten++;
        }
      }

      // Should have written some pixels
      expect(pixelsWritten).toBeGreaterThan(0);
    });
  });
});
