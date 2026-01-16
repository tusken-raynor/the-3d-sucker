# Math Module

## Purpose

Provides core mathematical types and operations for 3D graphics: vectors (Vec2, Vec3, Vec4), matrices (Mat4), and utility functions. All operations return new values (immutable).

## How It Works

### Vector Types

- `Vec2`: 2D vector with x, y components (used for UV coordinates)
- `Vec3`: 3D vector with x, y, z components (positions, normals, colors)
- `Vec4`: 4D vector with x, y, z, w components (homogeneous coordinates, RGBA colors)

### Matrix Type

- `Mat4`: 4x4 matrix stored as column-major Float32Array(16)
- Column-major layout: `m[col * 4 + row]`
- Compatible with OpenGL/WebGL conventions

### Operations

All operations are pure functions that return new values:

- Vector arithmetic: add, sub, scale, dot, cross
- Vector utilities: length, normalize, negate
- Matrix operations: identity, multiply, translate, rotate, scale
- Projection: perspective, lookAt
- Utilities: lerp, clamp

## I/O Interface

### Vector Types

```typescript
interface Vec2 {
  x: number;
  y: number;
}
interface Vec3 {
  x: number;
  y: number;
  z: number;
}
interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}
type Mat4 = Float32Array; // 16 elements, column-major
```

### Factory Functions

```typescript
vec2(x, y): Vec2
vec3(x, y, z): Vec3
vec4(x, y, z, w): Vec4
mat4Identity(): Mat4
```

### Vector Operations

```typescript
vec3Add(a, b): Vec3
vec3Sub(a, b): Vec3
vec3Scale(v, s): Vec3
vec3Dot(a, b): number
vec3Cross(a, b): Vec3
vec3Length(v): number
vec3Normalize(v): Vec3
vec3Negate(v): Vec3
```

### Matrix Operations

```typescript
mat4Multiply(a, b): Mat4
mat4Translate(m, v): Mat4
mat4RotateX(m, radians): Mat4
mat4RotateY(m, radians): Mat4
mat4RotateZ(m, radians): Mat4
mat4Scale(m, v): Mat4
mat4Perspective(fovY, aspect, near, far): Mat4
mat4LookAt(eye, target, up): Mat4
mat4TransformVec4(m, v): Vec4
```

### Utilities

```typescript
lerp(a, b, t): number
clamp(value, min, max): number
```

## Tests

Unit tests cover:

- All vector factory functions
- All vector arithmetic operations (add, sub, scale)
- Vec3 dot product and cross product
- Vec3 length, normalize, negate
- Matrix identity and clone
- Matrix multiplication
- Matrix transformations (translate, rotate, scale)
- Perspective projection
- LookAt view matrix
- Matrix-vector transformation
- Lerp and clamp utilities

Target: 100% code coverage
