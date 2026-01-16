import { describe, it, expect } from 'vitest';
import {
  vec2,
  vec3,
  vec4,
  vec2Add,
  vec2Sub,
  vec2Scale,
  vec3Add,
  vec3Sub,
  vec3Scale,
  vec3Dot,
  vec3Cross,
  vec3Length,
  vec3Normalize,
  vec3Negate,
  vec4Add,
  vec4Sub,
  vec4Scale,
  mat4Identity,
  mat4Clone,
  mat4Multiply,
  mat4Translate,
  mat4RotateX,
  mat4RotateY,
  mat4RotateZ,
  mat4Scale,
  mat4Perspective,
  mat4LookAt,
  mat4TransformVec4,
  lerp,
  clamp,
} from './index.ts';

const EPSILON = 0.0001;

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThan(EPSILON);
}

describe('vec2', () => {
  it('should create a 2D vector', () => {
    const v = vec2(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);
  });
});

describe('vec2Add', () => {
  it('should add two vectors', () => {
    const a = vec2(1, 2);
    const b = vec2(3, 4);
    const result = vec2Add(a, b);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });
});

describe('vec2Sub', () => {
  it('should subtract two vectors', () => {
    const a = vec2(5, 7);
    const b = vec2(2, 3);
    const result = vec2Sub(a, b);
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
  });
});

describe('vec2Scale', () => {
  it('should scale a vector', () => {
    const v = vec2(2, 3);
    const result = vec2Scale(v, 2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });
});

describe('vec3', () => {
  it('should create a 3D vector', () => {
    const v = vec3(1, 2, 3);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
  });
});

describe('vec3Add', () => {
  it('should add two vectors', () => {
    const a = vec3(1, 2, 3);
    const b = vec3(4, 5, 6);
    const result = vec3Add(a, b);
    expect(result.x).toBe(5);
    expect(result.y).toBe(7);
    expect(result.z).toBe(9);
  });
});

describe('vec3Sub', () => {
  it('should subtract two vectors', () => {
    const a = vec3(5, 7, 9);
    const b = vec3(1, 2, 3);
    const result = vec3Sub(a, b);
    expect(result.x).toBe(4);
    expect(result.y).toBe(5);
    expect(result.z).toBe(6);
  });
});

describe('vec3Scale', () => {
  it('should scale a vector', () => {
    const v = vec3(1, 2, 3);
    const result = vec3Scale(v, 3);
    expect(result.x).toBe(3);
    expect(result.y).toBe(6);
    expect(result.z).toBe(9);
  });

  it('should handle negative scale', () => {
    const v = vec3(1, 2, 3);
    const result = vec3Scale(v, -1);
    expect(result.x).toBe(-1);
    expect(result.y).toBe(-2);
    expect(result.z).toBe(-3);
  });
});

describe('vec3Dot', () => {
  it('should compute dot product', () => {
    const a = vec3(1, 2, 3);
    const b = vec3(4, 5, 6);
    expect(vec3Dot(a, b)).toBe(32); // 1*4 + 2*5 + 3*6
  });

  it('should return 0 for perpendicular vectors', () => {
    const a = vec3(1, 0, 0);
    const b = vec3(0, 1, 0);
    expect(vec3Dot(a, b)).toBe(0);
  });
});

describe('vec3Cross', () => {
  it('should compute cross product', () => {
    const a = vec3(1, 0, 0);
    const b = vec3(0, 1, 0);
    const result = vec3Cross(a, b);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(1);
  });

  it('should be anti-commutative', () => {
    const a = vec3(1, 2, 3);
    const b = vec3(4, 5, 6);
    const ab = vec3Cross(a, b);
    const ba = vec3Cross(b, a);
    expect(ab.x).toBe(-ba.x);
    expect(ab.y).toBe(-ba.y);
    expect(ab.z).toBe(-ba.z);
  });
});

describe('vec3Length', () => {
  it('should compute vector length', () => {
    const v = vec3(3, 4, 0);
    expect(vec3Length(v)).toBe(5);
  });

  it('should return 0 for zero vector', () => {
    const v = vec3(0, 0, 0);
    expect(vec3Length(v)).toBe(0);
  });
});

describe('vec3Normalize', () => {
  it('should normalize a vector', () => {
    const v = vec3(3, 4, 0);
    const result = vec3Normalize(v);
    expectClose(result.x, 0.6);
    expectClose(result.y, 0.8);
    expectClose(result.z, 0);
    expectClose(vec3Length(result), 1);
  });

  it('should handle zero vector', () => {
    const v = vec3(0, 0, 0);
    const result = vec3Normalize(v);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(0);
  });
});

describe('vec3Negate', () => {
  it('should negate a vector', () => {
    const v = vec3(1, -2, 3);
    const result = vec3Negate(v);
    expect(result.x).toBe(-1);
    expect(result.y).toBe(2);
    expect(result.z).toBe(-3);
  });
});

describe('vec4', () => {
  it('should create a 4D vector', () => {
    const v = vec4(1, 2, 3, 4);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
    expect(v.w).toBe(4);
  });
});

describe('vec4Add', () => {
  it('should add two vectors', () => {
    const a = vec4(1, 2, 3, 4);
    const b = vec4(5, 6, 7, 8);
    const result = vec4Add(a, b);
    expect(result.x).toBe(6);
    expect(result.y).toBe(8);
    expect(result.z).toBe(10);
    expect(result.w).toBe(12);
  });
});

describe('vec4Sub', () => {
  it('should subtract two vectors', () => {
    const a = vec4(5, 6, 7, 8);
    const b = vec4(1, 2, 3, 4);
    const result = vec4Sub(a, b);
    expect(result.x).toBe(4);
    expect(result.y).toBe(4);
    expect(result.z).toBe(4);
    expect(result.w).toBe(4);
  });
});

describe('vec4Scale', () => {
  it('should scale a vector', () => {
    const v = vec4(1, 2, 3, 4);
    const result = vec4Scale(v, 2);
    expect(result.x).toBe(2);
    expect(result.y).toBe(4);
    expect(result.z).toBe(6);
    expect(result.w).toBe(8);
  });
});

describe('mat4Identity', () => {
  it('should create identity matrix', () => {
    const m = mat4Identity();
    expect(m[0]).toBe(1);
    expect(m[5]).toBe(1);
    expect(m[10]).toBe(1);
    expect(m[15]).toBe(1);
    expect(m[1]).toBe(0);
    expect(m[4]).toBe(0);
  });
});

describe('mat4Clone', () => {
  it('should create a copy of matrix', () => {
    const m = mat4Identity();
    m[0] = 2;
    const clone = mat4Clone(m);
    expect(clone[0]).toBe(2);
    clone[0] = 3;
    expect(m[0]).toBe(2); // Original unchanged
  });
});

describe('mat4Multiply', () => {
  it('should multiply identity by identity', () => {
    const a = mat4Identity();
    const b = mat4Identity();
    const result = mat4Multiply(a, b);
    expect(result[0]).toBe(1);
    expect(result[5]).toBe(1);
    expect(result[10]).toBe(1);
    expect(result[15]).toBe(1);
  });

  it('should multiply correctly', () => {
    const a = mat4Identity();
    a[12] = 1; // translate x by 1
    const b = mat4Identity();
    b[12] = 2; // translate x by 2
    const result = mat4Multiply(a, b);
    expect(result[12]).toBe(3); // combined translation
  });
});

describe('mat4Translate', () => {
  it('should translate a matrix', () => {
    const m = mat4Identity();
    const result = mat4Translate(m, vec3(1, 2, 3));
    expect(result[12]).toBe(1);
    expect(result[13]).toBe(2);
    expect(result[14]).toBe(3);
  });

  it('should transform a point correctly', () => {
    const m = mat4Translate(mat4Identity(), vec3(5, 10, 15));
    const p = vec4(0, 0, 0, 1);
    const result = mat4TransformVec4(m, p);
    expect(result.x).toBe(5);
    expect(result.y).toBe(10);
    expect(result.z).toBe(15);
  });
});

describe('mat4RotateX', () => {
  it('should rotate around X axis', () => {
    const m = mat4Identity();
    const result = mat4RotateX(m, Math.PI / 2);
    const p = vec4(0, 1, 0, 1);
    const rotated = mat4TransformVec4(result, p);
    expectClose(rotated.x, 0);
    expectClose(rotated.y, 0);
    expectClose(rotated.z, 1);
  });
});

describe('mat4RotateY', () => {
  it('should rotate around Y axis', () => {
    const m = mat4Identity();
    const result = mat4RotateY(m, Math.PI / 2);
    const p = vec4(1, 0, 0, 1);
    const rotated = mat4TransformVec4(result, p);
    expectClose(rotated.x, 0);
    expectClose(rotated.y, 0);
    expectClose(rotated.z, -1);
  });
});

describe('mat4RotateZ', () => {
  it('should rotate around Z axis', () => {
    const m = mat4Identity();
    const result = mat4RotateZ(m, Math.PI / 2);
    const p = vec4(1, 0, 0, 1);
    const rotated = mat4TransformVec4(result, p);
    expectClose(rotated.x, 0);
    expectClose(rotated.y, 1);
    expectClose(rotated.z, 0);
  });
});

describe('mat4Scale', () => {
  it('should scale a matrix', () => {
    const m = mat4Identity();
    const result = mat4Scale(m, vec3(2, 3, 4));
    const p = vec4(1, 1, 1, 1);
    const scaled = mat4TransformVec4(result, p);
    expect(scaled.x).toBe(2);
    expect(scaled.y).toBe(3);
    expect(scaled.z).toBe(4);
  });
});

describe('mat4Perspective', () => {
  it('should create perspective matrix', () => {
    const fovY = Math.PI / 4;
    const aspect = 16 / 9;
    const near = 0.1;
    const far = 100;
    const m = mat4Perspective(fovY, aspect, near, far);

    // Test that w component depends on z (perspective divide)
    const p = vec4(0, 0, -10, 1);
    const result = mat4TransformVec4(m, p);
    expect(result.w).toBeGreaterThan(0);
  });

  it('should map near plane correctly', () => {
    const m = mat4Perspective(Math.PI / 2, 1, 1, 100);
    const p = vec4(0, 0, -1, 1);
    const result = mat4TransformVec4(m, p);
    // After perspective divide, z should be at -1 (near plane in NDC)
    expectClose(result.z / result.w, -1);
  });
});

describe('mat4LookAt', () => {
  it('should create view matrix looking down -Z', () => {
    const eye = vec3(0, 0, 5);
    const target = vec3(0, 0, 0);
    const up = vec3(0, 1, 0);
    const m = mat4LookAt(eye, target, up);

    // Transform origin - should be at (0, 0, -5) in view space
    const p = vec4(0, 0, 0, 1);
    const result = mat4TransformVec4(m, p);
    expectClose(result.x, 0);
    expectClose(result.y, 0);
    expectClose(result.z, -5);
  });

  it('should transform eye position to origin', () => {
    const eye = vec3(3, 4, 5);
    const target = vec3(0, 0, 0);
    const up = vec3(0, 1, 0);
    const m = mat4LookAt(eye, target, up);

    const p = vec4(eye.x, eye.y, eye.z, 1);
    const result = mat4TransformVec4(m, p);
    expectClose(result.x, 0);
    expectClose(result.y, 0);
    expectClose(result.z, 0);
  });
});

describe('mat4TransformVec4', () => {
  it('should transform vector by identity', () => {
    const m = mat4Identity();
    const v = vec4(1, 2, 3, 1);
    const result = mat4TransformVec4(m, v);
    expect(result.x).toBe(1);
    expect(result.y).toBe(2);
    expect(result.z).toBe(3);
    expect(result.w).toBe(1);
  });

  it('should apply translation only to points (w=1)', () => {
    const m = mat4Translate(mat4Identity(), vec3(10, 20, 30));
    const point = vec4(1, 2, 3, 1);
    const direction = vec4(1, 2, 3, 0);

    const transformedPoint = mat4TransformVec4(m, point);
    const transformedDir = mat4TransformVec4(m, direction);

    expect(transformedPoint.x).toBe(11);
    expect(transformedPoint.y).toBe(22);
    expect(transformedPoint.z).toBe(33);

    expect(transformedDir.x).toBe(1);
    expect(transformedDir.y).toBe(2);
    expect(transformedDir.z).toBe(3);
  });
});

describe('lerp', () => {
  it('should interpolate between values', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it('should handle extrapolation', () => {
    expect(lerp(0, 10, 2)).toBe(20);
    expect(lerp(0, 10, -1)).toBe(-10);
  });
});

describe('clamp', () => {
  it('should clamp value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should handle edge cases', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});
