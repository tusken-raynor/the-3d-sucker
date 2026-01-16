# Vertex Stage Module

## Purpose

Transforms vertices from model space through the graphics pipeline to clip space. Computes world-space positions and normals needed for lighting calculations.

## How It Works

For each vertex:

1. **Clip space position**: Multiply model-space position by MVP (Model-View-Projection) matrix
2. **World position**: Multiply model-space position by model matrix only
3. **World normal**: Multiply model-space normal by model matrix (w=0 to ignore translation)
4. **UV passthrough**: Texture coordinates are unchanged

### Transform Pipeline

```
Model Space → (Model Matrix) → World Space → (View Matrix) → View Space → (Projection Matrix) → Clip Space
```

The MVP matrix combines all three transforms. World position and normal are computed separately using just the model matrix for lighting calculations.

## I/O Interface

### Types

```typescript
interface Vertex {
  position: Vec3; // Model-space position
  uv: Vec2; // Texture coordinates
  normal: Vec3; // Model-space normal
}

interface ClipVertex {
  position: Vec4; // Clip-space position (homogeneous)
  uv: Vec2; // Texture coordinates (unchanged)
  normal: Vec3; // World-space normal
  worldPosition: Vec3; // World-space position
}
```

### Functions

```typescript
transformVertex(vertex: Vertex, mvp: Mat4, modelMatrix: Mat4): ClipVertex
```

### Usage Example

```typescript
import { transformVertex } from '@/js/vertex-stage';
import { mat4Multiply, mat4Perspective, mat4LookAt } from '@/js/math';

const model = mat4Identity();
const view = mat4LookAt(eye, target, up);
const projection = mat4Perspective(fovY, aspect, near, far);
const mvp = mat4Multiply(mat4Multiply(projection, view), model);

const clipVertex = transformVertex(modelVertex, mvp, model);
```

## Tests

Unit tests cover:

- Identity matrices pass vertex through unchanged
- Position transforms correctly to clip space
- World position computed from model matrix
- Normal transforms to world space
- UV coordinates preserved
- Perspective projection produces non-unit w
- Combined MVP matrix works correctly
