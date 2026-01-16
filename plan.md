# Project Plan: Web-Based JavaScript Software Renderer

## System Overview

A browser-based 3D renderer that processes model and texture data through a classic graphics pipeline, outputting to an HTML canvas. Users can interact via orbital camera controls.

---

## Data Flow

```
User Files (OBJ + Texture)
         │
         ▼
    ┌─────────┐
    │ Parsing │ ──► Mesh Data + Texture Data
    └─────────┘
         │
         ▼
    ┌─────────────────┐
    │  Vertex Stage   │ ──► Transformed vertices (clip space)
    │  (MVP transform)│
    └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │  Rasterization  │ ──► Fragments with interpolated attributes
    │  (triangle fill)│
    └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Fragment Stage  │ ──► Final pixel colors
    │ (texture/shade) │
    └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │  Framebuffer    │ ──► Pixel array + depth buffer
    └─────────────────┘
         │
         ▼
    Canvas Output
```

---

## Module Descriptions

### 1. Math Library

Provides all vector and matrix operations needed for 3D transformations.

**Capabilities:**

- 3D vector operations: addition, subtraction, scaling, dot product, cross product, normalization
- 4D vector operations for homogeneous coordinates, including perspective divide
- 4×4 matrix operations: multiplication, transpose, inverse
- Transform builders: translation, rotation (per-axis and arbitrary axis), scaling
- View matrix construction (lookAt)
- Projection matrix construction (perspective and orthographic)
- Interpolation utilities: linear interpolation, barycentric coordinate calculation

**Key Consideration:** Barycentric coordinates are critical for the rasterizer—this math must be solid.

---

### 2. Model Parser

Reads Wavefront OBJ format and produces structured mesh data.

**Input:** Raw OBJ file text

**Output:**

- Vertex positions (array of 3D points)
- Texture coordinates (array of 2D UV pairs)
- Vertex normals (array of 3D directions)
- Face definitions (triangles referencing position/UV/normal indices)

**Considerations:**

- Must handle faces with separate indices for position, UV, and normal
- Should triangulate quads if encountered (OBJ allows n-gons)
- Normalize or center the model for consistent initial display

---

### 3. Texture Loader

Loads image files and provides texture sampling.

**Input:** Image file (PNG, JPG)

**Output:** Texture object with sampling capability

**Capabilities:**

- Load image into raw pixel data
- Sample color at UV coordinates (0-1 range)
- Handle UV wrapping (repeat, clamp)
- Filtering mode: nearest-neighbor (simpler) or bilinear (smoother)

---

### 4. Framebuffer

Manages the rendering target—both color and depth information.

**State:**

- Color buffer (RGBA per pixel)
- Depth buffer (Z value per pixel)
- Dimensions (width × height)

**Operations:**

- Clear buffers to default values
- Write pixel with depth test (only write if closer than existing)
- Read back final image data for canvas display

---

### 5. Vertex Stage

Transforms mesh vertices through the coordinate pipeline.

**Input:**

- Mesh vertex positions
- Model matrix (object space → world space)
- View matrix (world space → camera space)
- Projection matrix (camera space → clip space)

**Output:** Vertices in clip space (4D homogeneous coordinates)

**Process:**

1. Combine matrices into MVP matrix
2. Transform each vertex position by MVP
3. Pass through vertex attributes (UVs, normals) for later interpolation

---

### 6. Rasterization Stage

Converts triangles into fragments (potential pixels).

**Input:**

- Three vertices in clip space with associated attributes
- Framebuffer dimensions

**Output:** Stream of fragments, each containing:

- Screen position (x, y)
- Interpolated depth
- Interpolated UV coordinates
- Interpolated normal

**Process:**

1. Perspective divide (clip space → NDC)
2. Viewport transform (NDC → screen coordinates)
3. Compute triangle bounding box
4. For each pixel in bounding box:
   - Calculate barycentric coordinates
   - Reject if outside triangle
   - Interpolate all attributes (with perspective correction)
   - Emit fragment

**Key Considerations:**

- Perspective-correct interpolation is essential for correct texturing
- Back-face culling can be done here via winding order
- Near-plane clipping prevents artifacts from behind-camera geometry

---

### 7. Fragment Stage

Computes final color for each fragment.

**Input:**

- Fragment with interpolated attributes (UV, normal, depth)
- Texture data
- Lighting parameters

**Output:** RGBA color value

**Process:**

1. Sample texture at interpolated UV
2. Apply lighting calculation (e.g., diffuse from directional light)
3. Return final color

**Lighting Model (basic):**

- Single directional light
- Lambertian diffuse: `intensity = max(0, dot(normal, lightDir))`
- Final color = texture color × diffuse intensity

---

### 8. Camera System

Manages viewpoint with orbital (arcball-style) controls.

**State:**

- Target point (what the camera looks at)
- Distance from target
- Yaw angle (horizontal orbit)
- Pitch angle (vertical orbit)

**Operations:**

- Rotate: adjust yaw/pitch from input deltas
- Zoom: adjust distance
- Compute position from spherical coordinates
- Generate view matrix via lookAt

**Constraints:**

- Clamp pitch to avoid gimbal issues (e.g., ±89°)
- Clamp distance to reasonable min/max range

---

### 9. Scene Manager

Holds all renderable state and coordinates the pipeline.

**Contents:**

- Current mesh data
- Current texture
- Model transform (rotation for user manipulation)
- Camera instance
- Rendering settings (viewport size, FOV, near/far planes)

**Responsibilities:**

- Orchestrate render passes
- Update model rotation based on user input
- Manage asset loading/replacement

---

### 10. Input Handler

Captures user interaction and translates to scene changes.

**Events Handled:**

- Mouse drag → camera rotation
- Scroll wheel → camera zoom
- File selection → trigger asset loading

**Output:** Deltas and commands sent to Camera and Scene Manager

---

### 11. Render Loop Controller

Manages the animation frame cycle.

**Responsibilities:**

- Request animation frames
- Call scene render on each frame
- Transfer framebuffer to canvas
- Track frame timing if needed

---

## Key Algorithms to Implement

| Algorithm | Purpose | Location |
|-----------|---------|----------|
| Barycentric coordinates | Determine if point is in triangle + interpolation weights | Math Library |
| Perspective-correct interpolation | Correct texture/attribute distortion | Rasterizer |
| Sutherland-Hodgman clipping | Clip triangles against near plane | Rasterizer or separate |
| Spherical-to-Cartesian | Compute camera position from angles | Camera System |
| LookAt matrix | Build view matrix from position/target/up | Math Library |

---

## Design Decisions Required

### 1. Rasterization Approach

- Edge function method (test all pixels in bbox)
- Scanline method (horizontal spans)

### 2. Clipping Strategy

- Full 6-plane frustum clipping
- Near-plane only + screen scissoring
- Guard-band clipping

### 3. Texture Filtering

- Nearest-neighbor (fast, pixelated)
- Bilinear (smooth, more computation)

### 4. Shading Model

- Flat (one normal per face)
- Gouraud (interpolate colors)
- Phong (interpolate normals, shade per-pixel)

### 5. Performance Targets

- Acceptable frame rate
- Maximum polygon count
- Whether to use Web Workers

---

## Implementation Phases

| Phase | Focus | Milestone |
|-------|-------|-----------|
| 1 | Math primitives | All vector/matrix operations working with tests |
| 2 | Framebuffer + canvas output | Can draw individual pixels to screen |
| 3 | Triangle rasterization | Render a hardcoded colored triangle |
| 4 | Vertex transforms + camera | Render a rotating cube with perspective |
| 5 | Model parsing | Load and display OBJ files |
| 6 | Texturing | UV mapping and texture sampling working |
| 7 | Lighting | Basic diffuse shading |
| 8 | User controls | Orbital camera + file upload UI |
| 9 | Polish | Error handling, loading states, edge cases |
