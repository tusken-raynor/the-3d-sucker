# 3D Model Viewer - Project Documentation

## Overview

A pure JavaScript/TypeScript software 3D renderer for viewing OBJ models in the browser. No WebGL or WebGPU - renders entirely on the CPU using 2D canvas.

## Features

- Load and render OBJ models with UV coordinates and normals
- Apply textures from image files
- Orbital camera controls (drag to orbit, scroll to zoom)
- Diffuse lighting with directional light
- Depth buffer (Z-buffer) for correct visibility
- Near-plane clipping and back-face culling

## Architecture

### Rendering Pipeline

```
OBJ File → Model Parser → Triangles
                              ↓
Texture File → Texture Loader → Texture Data
                              ↓
Camera → View Matrix → MVP Transform (Vertex Stage)
                              ↓
                         Clip Space Vertices
                              ↓
                    Rasterizer (Triangle Fill)
                              ↓
                    Fragment Stage (Texture + Lighting)
                              ↓
                    Framebuffer (Color + Depth)
                              ↓
                    Canvas (ImageData transfer)
```

### Module Overview

| Module         | Purpose                                   |
| -------------- | ----------------------------------------- |
| math           | Vector and matrix operations              |
| model-parser   | OBJ file parsing                          |
| texture-loader | Texture loading and sampling              |
| framebuffer    | Color and depth buffer management         |
| vertex-stage   | MVP transformation                        |
| rasterizer     | Triangle rasterization with interpolation |
| fragment-stage | Texture sampling and lighting             |
| camera         | Orbital camera implementation             |
| scene-manager  | Scene orchestration                       |
| input-handler  | Mouse input for camera controls           |
| render-loop    | Animation loop management                 |
| errors         | Custom error types                        |
| error-handler  | Centralized error handling                |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run all tests
npm run test

# Run validation (format, lint, type-check, tests)
npm run validate
```

## Usage

1. Open the application in a browser
2. Click "Load OBJ" to load a 3D model file
3. Optionally click "Load Texture" to apply a texture
4. Drag on the canvas to orbit the camera
5. Scroll to zoom in/out

## Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Technical Details

### Supported OBJ Features

- Vertex positions (`v x y z`)
- Texture coordinates (`vt u v`)
- Vertex normals (`vn x y z`)
- Faces with various formats (`f v`, `f v/vt`, `f v/vt/vn`, `f v//vn`)
- Quads (triangulated automatically)

### Rendering

- Edge function rasterization algorithm
- Perspective-correct interpolation
- Nearest-neighbor texture sampling
- Lambertian diffuse lighting
- Column-major 4x4 matrices (Mat4 as Float32Array)

### Limitations

- No WebGL/WebGPU acceleration
- Single directional light only
- No shadows or normal mapping
- No skeletal animation
- Mouse-only controls (no touch support)

## Module Documentation

Each module has its own `docs.md` file with detailed information:

- `src/js/math/docs.md`
- `src/js/model-parser/docs.md`
- `src/js/texture-loader/docs.md`
- `src/js/framebuffer/docs.md`
- `src/js/vertex-stage/docs.md`
- `src/js/rasterizer/docs.md`
- `src/js/fragment-stage/docs.md`
- `src/js/camera/docs.md`
- `src/js/scene-manager/docs.md`
- `src/js/input-handler/docs.md`
- `src/js/render-loop/docs.md`
- `src/js/errors/docs.md`
- `src/js/error-handler/docs.md`

Test documentation:

- `src/tests/integration/docs.md`
- `src/tests/e2e/docs.md`
