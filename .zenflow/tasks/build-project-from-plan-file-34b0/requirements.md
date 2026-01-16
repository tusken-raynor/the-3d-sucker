# Product Requirements Document: Web-Based 3D Software Renderer

## Overview

A browser-based 3D model viewer that implements a complete software rendering pipeline in JavaScript/TypeScript. Users can load OBJ model files with textures, view them in 3D with perspective projection, and interact via orbital camera controls.

## Target Users

- Developers learning about 3D graphics pipelines
- Users wanting a simple browser-based 3D model viewer
- Anyone needing to preview OBJ files without installing software

## Functional Requirements

### FR-1: Model Loading

**FR-1.1**: The system shall accept Wavefront OBJ files via file upload
- Parse vertex positions (v)
- Parse texture coordinates (vt)
- Parse vertex normals (vn)
- Parse face definitions (f) with support for position/UV/normal indices

**FR-1.2**: The system shall triangulate quad faces when encountered in OBJ files

**FR-1.3**: The system shall normalize/center loaded models for consistent initial display

### FR-2: Texture Loading

**FR-2.1**: The system shall accept image files (PNG, JPG) as textures via file upload

**FR-2.2**: The system shall sample textures at UV coordinates with UV wrapping support
- Repeat mode
- Clamp mode

**FR-2.3**: The system shall support texture filtering
- Nearest-neighbor (default for simplicity)
- Bilinear (optional enhancement)

### FR-3: Rendering Pipeline

**FR-3.1**: Vertex Stage
- Transform vertices through model, view, and projection matrices (MVP)
- Output vertices in clip space (4D homogeneous coordinates)
- Pass through vertex attributes (UVs, normals) for interpolation

**FR-3.2**: Rasterization Stage
- Perform perspective divide (clip space → NDC)
- Apply viewport transform (NDC → screen coordinates)
- Rasterize triangles to fragments via barycentric coordinates
- Apply perspective-correct interpolation for attributes
- Support back-face culling via winding order
- Perform near-plane clipping

**FR-3.3**: Fragment Stage
- Sample texture at interpolated UV coordinates
- Apply basic diffuse lighting (Lambertian)
- Output final RGBA color

**FR-3.4**: Framebuffer
- Maintain color buffer (RGBA per pixel)
- Maintain depth buffer (Z-buffer)
- Perform depth testing (write only if closer)
- Clear buffers between frames

### FR-4: Camera System

**FR-4.1**: The system shall implement orbital (arcball-style) camera controls
- Look-at target point (typically model center)
- Distance from target (zoom level)
- Yaw angle (horizontal orbit)
- Pitch angle (vertical orbit)

**FR-4.2**: Camera constraints
- Clamp pitch to ±89° to avoid gimbal lock
- Clamp distance to reasonable min/max range

**FR-4.3**: Generate view matrix using lookAt calculation from camera state

### FR-5: User Interaction

**FR-5.1**: Mouse drag shall rotate the camera around the model

**FR-5.2**: Scroll wheel shall zoom the camera in/out

**FR-5.3**: File selection UI shall allow loading:
- OBJ model files
- Texture image files

### FR-6: Rendering Output

**FR-6.1**: The system shall render to an HTML canvas element

**FR-6.2**: The system shall maintain a consistent render loop via requestAnimationFrame

**FR-6.3**: The system shall transfer framebuffer contents to canvas each frame

### FR-7: Lighting

**FR-7.1**: The system shall implement basic diffuse lighting with a single directional light

**FR-7.2**: Lighting calculation: `intensity = max(0, dot(normal, lightDir))`

**FR-7.3**: Final color: `textureColor × diffuseIntensity`

## Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1**: The renderer should maintain interactive frame rates (target 30+ FPS) for models with reasonable polygon counts (up to ~10,000 triangles)

**NFR-1.2**: The system should be responsive during asset loading

### NFR-2: Compatibility

**NFR-2.1**: The application shall work in modern browsers supporting ES2022

**NFR-2.2**: No external 3D libraries (Three.js, Babylon.js) - pure software rendering

### NFR-3: Code Quality

**NFR-3.1**: TypeScript with strict mode enabled

**NFR-3.2**: Modular architecture following project spec (modules in `src/js/module-name/`)

**NFR-3.3**: Unit tests for all modules per testing standards

**NFR-3.4**: Documentation per spec requirements (`docs.md` for each module)

## Technical Decisions

Based on the plan.md design decisions section, the following choices are made:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rasterization approach | Edge function method | Simpler to implement, good parallelization potential |
| Clipping strategy | Near-plane only + screen scissoring | Sufficient for viewer use case, reduces complexity |
| Texture filtering | Nearest-neighbor (default) | Fast and acceptable for initial implementation |
| Shading model | Phong (per-pixel) | Best visual quality, interpolate normals per fragment |
| Performance target | 30 FPS at 10k triangles | Reasonable for software renderer |

## Module Architecture

Based on plan.md, the following modules will be implemented:

| Module | Location | Purpose |
|--------|----------|---------|
| math | `src/js/math/` | Vector/matrix operations, transforms, interpolation |
| model-parser | `src/js/model-parser/` | OBJ file parsing |
| texture-loader | `src/js/texture-loader/` | Image loading and sampling |
| framebuffer | `src/js/framebuffer/` | Color/depth buffer management |
| vertex-stage | `src/js/vertex-stage/` | MVP transforms |
| rasterizer | `src/js/rasterizer/` | Triangle rasterization |
| fragment-stage | `src/js/fragment-stage/` | Texture sampling and lighting |
| camera | `src/js/camera/` | Orbital camera system |
| scene-manager | `src/js/scene-manager/` | Scene state and render orchestration |
| input-handler | `src/js/input-handler/` | Mouse/keyboard event handling |
| render-loop | `src/js/render-loop/` | Animation frame management |
| errors | `src/js/errors/` | Error class hierarchy |
| error-handler | `src/js/error-handler/` | Centralized error handling |

## User Interface Requirements

### UI-1: Canvas Display
- Full viewport or fixed-size canvas for 3D rendering
- Clear visual feedback during rendering

### UI-2: File Upload Controls
- Button/dropzone for OBJ file upload
- Button/dropzone for texture file upload
- Visual feedback on successful/failed loads

### UI-3: Loading States
- Indicate when model/texture is loading
- Display errors clearly to users

## Implementation Phases

Per plan.md, implementation proceeds in phases:

1. **Phase 1**: Math primitives - vector/matrix operations with tests
2. **Phase 2**: Framebuffer + canvas output - draw pixels to screen
3. **Phase 3**: Triangle rasterization - render a hardcoded colored triangle
4. **Phase 4**: Vertex transforms + camera - render a rotating cube with perspective
5. **Phase 5**: Model parsing - load and display OBJ files
6. **Phase 6**: Texturing - UV mapping and texture sampling
7. **Phase 7**: Lighting - basic diffuse shading
8. **Phase 8**: User controls - orbital camera + file upload UI
9. **Phase 9**: Polish - error handling, loading states, edge cases

## Out of Scope

- Hardware-accelerated rendering (WebGL/WebGPU)
- Multiple light sources
- Shadow mapping
- Normal mapping
- Animation/skeletal meshes
- Material files (.mtl) parsing
- Multiple models in scene
- Export functionality

## Acceptance Criteria

1. User can load an OBJ file and see it rendered in 3D
2. User can load a texture and see it applied to the model
3. User can rotate the view by dragging the mouse
4. User can zoom in/out with the scroll wheel
5. Rendering is visually correct with proper perspective and depth
6. Application works in modern browsers without plugins
7. All modules have unit tests and documentation
