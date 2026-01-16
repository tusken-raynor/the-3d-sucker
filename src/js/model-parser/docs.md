# Model Parser Module

## Purpose

Parses OBJ (Wavefront) 3D model files into a format suitable for rendering. Supports vertex positions, texture coordinates, normals, and handles various face formats including quads.

## How It Works

### Parsing Process

1. **Vertex data**: Parse `v`, `vt`, `vn` lines into position, UV, and normal arrays
2. **Face handling**: Parse `f` lines with various formats (v, v/vt, v/vt/vn, v//vn)
3. **Triangulation**: Split quads and polygons into triangles using fan triangulation
4. **Normal computation**: Calculate normals from cross product if not provided
5. **Bounding box**: Compute min/max bounds and center point

### Supported OBJ Commands

- `v x y z` - Vertex position
- `vt u v` - Texture coordinate
- `vn x y z` - Vertex normal
- `f v1 v2 v3 [v4...]` - Face (triangles, quads, polygons)

### Ignored Commands

- `mtllib`, `usemtl` - Material references
- `o`, `g` - Object/group names
- `s` - Smoothing groups
- `#` - Comments

## I/O Interface

### Types

```typescript
interface Vertex {
  position: Vec3;
  uv: Vec2;
  normal: Vec3;
}

interface Triangle {
  v0: Vertex;
  v1: Vertex;
  v2: Vertex;
}

interface Model {
  triangles: Triangle[];
  boundingBox: { min: Vec3; max: Vec3 };
  center: Vec3;
}
```

### Functions

```typescript
parseOBJ(objText: string): Model
normalizeModel(model: Model): Model
```

### Usage Example

```typescript
import { parseOBJ, normalizeModel } from '@/js/model-parser';

const objText = await file.text();
const model = parseOBJ(objText);
const normalized = normalizeModel(model);

// Render triangles
for (const tri of normalized.triangles) {
  renderTriangle(tri.v0, tri.v1, tri.v2);
}
```

## Error Handling

Throws `ParseError` for:

- Empty files or files with no faces
- Invalid vertex coordinates (not enough values, NaN)
- Invalid face definitions (less than 3 vertices)
- Invalid position indices

## Tests

Unit tests cover:

- Simple triangle parsing
- UV coordinate parsing
- Vertex normal parsing
- Quad triangulation
- Cube parsing (multiple faces)
- Bounding box computation
- Center computation
- Empty file handling
- Invalid vertex handling
- Invalid face handling
- Normal computation when not provided
- Various face format handling
- Ignoring unsupported commands
- Model normalization (centering, scaling)
- UV and normal preservation during normalization
