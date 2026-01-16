# Rasterizer Module

## Purpose

Converts triangles in clip space to fragments (pixels) for rendering. Implements the core rasterization algorithm using the edge function method with perspective-correct interpolation.

## How It Works

### Pipeline Steps

1. **Near-plane clipping**: Triangles intersecting the near plane are clipped to produce valid triangles
2. **Perspective divide**: Convert from clip space (homogeneous) to NDC (normalized device coordinates)
3. **Viewport transform**: Convert NDC to screen coordinates
4. **Back-face culling**: Optionally reject triangles facing away from camera
5. **Bounding box**: Compute screen-space bounds to limit rasterization
6. **Edge function rasterization**: Test each pixel against triangle edges using signed area
7. **Perspective-correct interpolation**: Interpolate vertex attributes with 1/w correction

### Edge Function Algorithm

The edge function `E(a, b, c) = (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)` determines which side of an edge a point lies on. A point is inside the triangle if it passes all three edge tests.

### Perspective-Correct Interpolation

For correct attribute interpolation in perspective projection:

```
attr = (b0 * attr0/w0 + b1 * attr1/w1 + b2 * attr2/w2) / (b0/w0 + b1/w1 + b2/w2)
```

## I/O Interface

### Types

```typescript
interface ClipVertex {
  position: Vec4; // Clip space position (x, y, z, w)
  uv: Vec2; // Texture coordinates
  normal: Vec3; // Normal vector (world space)
  worldPosition: Vec3; // World space position
}

interface Fragment {
  x: number; // Screen X coordinate
  y: number; // Screen Y coordinate
  depth: number; // Depth value for Z-buffer
  uv: Vec2; // Interpolated texture coordinates
  normal: Vec3; // Interpolated normal
  worldPosition: Vec3; // Interpolated world position
}
```

### Functions

```typescript
rasterizeTriangle(
  v0: ClipVertex,
  v1: ClipVertex,
  v2: ClipVertex,
  viewportWidth: number,
  viewportHeight: number,
  cullBackFaces: boolean
): Fragment[]
```

### Usage Example

```typescript
import { rasterizeTriangle } from '@/js/rasterizer';

const v0 = { position: vec4(0, 0.5, 0, 1), uv: vec2(0.5, 0), ... };
const v1 = { position: vec4(-0.5, -0.5, 0, 1), uv: vec2(0, 1), ... };
const v2 = { position: vec4(0.5, -0.5, 0, 1), uv: vec2(1, 1), ... };

const fragments = rasterizeTriangle(v0, v1, v2, 800, 600, true);

for (const frag of fragments) {
  const color = shadeFragment(frag, texture, light);
  setPixel(framebuffer, frag.x, frag.y, color, frag.depth);
}
```

## Tests

Unit tests cover:

- Basic triangle rasterization produces fragments
- Fragments stay within viewport bounds
- Back-face culling removes back-facing triangles
- Culling can be disabled
- Triangles behind near plane are clipped
- Degenerate triangles are skipped
- Invalid w values are handled
- Depth values are computed
- UV coordinates are interpolated
- Partial near-plane clipping works
- Off-screen triangles produce no fragments
