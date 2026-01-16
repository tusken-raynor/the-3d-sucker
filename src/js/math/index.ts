// Vector types
export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

// Mat4 stored as column-major Float32Array(16)
export type Mat4 = Float32Array;

// Vector factory functions
export function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

export function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

export function vec4(x: number, y: number, z: number, w: number): Vec4 {
  return { x, y, z, w };
}

// Vec2 operations
export function vec2Add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vec2Sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vec2Scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

// Vec3 operations
export function vec3Add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function vec3Scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function vec3Dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function vec3Length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function vec3Normalize(v: Vec3): Vec3 {
  const len = vec3Length(v);
  if (len === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export function vec3Negate(v: Vec3): Vec3 {
  return { x: -v.x, y: -v.y, z: -v.z };
}

// Vec4 operations
export function vec4Add(a: Vec4, b: Vec4): Vec4 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z, w: a.w + b.w };
}

export function vec4Sub(a: Vec4, b: Vec4): Vec4 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z, w: a.w - b.w };
}

export function vec4Scale(v: Vec4, s: number): Vec4 {
  return { x: v.x * s, y: v.y * s, z: v.z * s, w: v.w * s };
}

// Matrix operations (column-major layout)
// Index mapping: m[col * 4 + row]
// Column 0: indices 0,1,2,3
// Column 1: indices 4,5,6,7
// Column 2: indices 8,9,10,11
// Column 3: indices 12,13,14,15

export function mat4Identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

export function mat4Clone(m: Mat4): Mat4 {
  return new Float32Array(m);
}

export function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[k * 4 + row] * b[col * 4 + k];
      }
      out[col * 4 + row] = sum;
    }
  }

  return out;
}

export function mat4Translate(m: Mat4, v: Vec3): Mat4 {
  const t = mat4Identity();
  t[12] = v.x;
  t[13] = v.y;
  t[14] = v.z;
  return mat4Multiply(m, t);
}

export function mat4RotateX(m: Mat4, radians: number): Mat4 {
  const c = Math.cos(radians);
  const s = Math.sin(radians);

  const r = mat4Identity();
  r[5] = c;
  r[6] = s;
  r[9] = -s;
  r[10] = c;

  return mat4Multiply(m, r);
}

export function mat4RotateY(m: Mat4, radians: number): Mat4 {
  const c = Math.cos(radians);
  const s = Math.sin(radians);

  const r = mat4Identity();
  r[0] = c;
  r[2] = -s;
  r[8] = s;
  r[10] = c;

  return mat4Multiply(m, r);
}

export function mat4RotateZ(m: Mat4, radians: number): Mat4 {
  const c = Math.cos(radians);
  const s = Math.sin(radians);

  const r = mat4Identity();
  r[0] = c;
  r[1] = s;
  r[4] = -s;
  r[5] = c;

  return mat4Multiply(m, r);
}

export function mat4Scale(m: Mat4, v: Vec3): Mat4 {
  const s = mat4Identity();
  s[0] = v.x;
  s[5] = v.y;
  s[10] = v.z;
  return mat4Multiply(m, s);
}

export function mat4Perspective(
  fovY: number,
  aspect: number,
  near: number,
  far: number
): Mat4 {
  const f = 1.0 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);

  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

export function mat4LookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const zAxis = vec3Normalize(vec3Sub(eye, target));
  const xAxis = vec3Normalize(vec3Cross(up, zAxis));
  const yAxis = vec3Cross(zAxis, xAxis);

  const out = new Float32Array(16);

  out[0] = xAxis.x;
  out[1] = yAxis.x;
  out[2] = zAxis.x;
  out[3] = 0;

  out[4] = xAxis.y;
  out[5] = yAxis.y;
  out[6] = zAxis.y;
  out[7] = 0;

  out[8] = xAxis.z;
  out[9] = yAxis.z;
  out[10] = zAxis.z;
  out[11] = 0;

  out[12] = -vec3Dot(xAxis, eye);
  out[13] = -vec3Dot(yAxis, eye);
  out[14] = -vec3Dot(zAxis, eye);
  out[15] = 1;

  return out;
}

export function mat4TransformVec4(m: Mat4, v: Vec4): Vec4 {
  return {
    x: m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12] * v.w,
    y: m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13] * v.w,
    z: m[2] * v.x + m[6] * v.y + m[10] * v.z + m[14] * v.w,
    w: m[3] * v.x + m[7] * v.y + m[11] * v.z + m[15] * v.w,
  };
}

// Utility functions
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
