# Technical Specification: Web-Based 3D Software Renderer

## Technical Context

### Technology Stack
- **Language**: TypeScript (strict mode enabled)
- **Build Tool**: Vite 7.2.4
- **Target**: ES2022, modern browsers
- **No external 3D libraries** - pure software rendering

### Existing Codebase
- Vite template with TypeScript configured
- Entry point: `src/main.ts`
- HTML canvas will be rendered to `#app` div in `index.html`
- tsconfig.json already has strict mode, ES2022 target, DOM types

### Path Alias Configuration

Add `@/` path alias for clean imports. This requires changes to both `tsconfig.json` and `vite.config.ts`.

**tsconfig.json additions:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**vite.config.ts** (create this file):
```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Usage example:**
```typescript
// Instead of relative imports:
import { vec3 } from '../../js/math';

// Use alias imports:
import { vec3 } from '@/js/math';
```

### Dependencies to Add
- **vitest**: Unit and integration testing
- **@vitest/coverage-v8**: Coverage reporting
- **playwright**: E2E testing

---

## Implementation Approach

### Architecture Overview

The renderer implements a classic software rendering pipeline:

```
OBJ File → Model Parser → Vertices/UVs/Normals
                              ↓
Texture File → Texture Loader → Texture Data
                              ↓
Camera State → View Matrix → MVP Transform (Vertex Stage)
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

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rasterization | Edge function method | Simpler, naturally handles perspective-correct interpolation |
| Clipping | Near-plane only + scissoring | Sufficient for viewer, reduces complexity |
| Texture filtering | Nearest-neighbor | Fast, acceptable quality for initial version |
| Shading | Per-pixel (Phong-style diffuse) | Best quality, interpolate normals |
| Matrix storage | Column-major Float32Array | Standard GL convention, efficient |
| Vector/Matrix ops | Immutable returns | Predictable, easier to test |

---

## Source Code Structure

### Module Organization

```
src/
├── js/
│   ├── math/
│   │   ├── index.ts          # Vec2, Vec3, Vec4, Mat4, utilities
│   │   ├── index.test.ts     # Unit tests
│   │   └── docs.md
│   │
│   ├── model-parser/
│   │   ├── index.ts          # OBJ parsing
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   ├── texture-loader/
│   │   ├── index.ts          # Image loading, sampling
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   ├── framebuffer/
│   │   ├── index.ts          # Color/depth buffers
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   ├── vertex-stage/
│   │   ├── index.ts          # MVP transforms
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   ├── rasterizer/
│   │   ├── index.ts          # Triangle rasterization
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   ├── fragment-stage/
│   │   ├── index.ts          # Texture sampling, lighting
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   ├── camera/
│   │   ├── index.ts          # Orbital camera
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   ├── scene-manager/
│   │   ├── index.ts          # Scene state, render orchestration
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   ├── input-handler/
│   │   ├── index.ts          # Mouse/keyboard events
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   ├── render-loop/
│   │   ├── index.ts          # requestAnimationFrame management
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   ├── errors/
│   │   ├── index.ts          # AppError, ValidationError, etc.
│   │   ├── index.test.ts
│   │   └── docs.md
│   │
│   └── error-handler/
│       ├── index.ts          # Centralized error handling
│       ├── index.test.ts
│       └── docs.md
│
├── tests/
│   ├── integration/
│   │   └── docs.md           # Integration test goals/documentation
│   └── e2e/
│       └── docs.md           # E2E test goals/documentation
│
├── main.ts                   # Application entry point
└── style.css                 # Application styles
```

---

## Data Models / Interfaces

### Math Types

```typescript
// src/js/math/index.ts

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

// Mat4 stored as column-major Float32Array(16)
type Mat4 = Float32Array;

// Utility functions
function vec2(x: number, y: number): Vec2;
function vec3(x: number, y: number, z: number): Vec3;
function vec4(x: number, y: number, z: number, w: number): Vec4;
function mat4Identity(): Mat4;
function mat4Multiply(a: Mat4, b: Mat4): Mat4;
function mat4Translate(m: Mat4, v: Vec3): Mat4;
function mat4RotateX(m: Mat4, radians: number): Mat4;
function mat4RotateY(m: Mat4, radians: number): Mat4;
function mat4RotateZ(m: Mat4, radians: number): Mat4;
function mat4Scale(m: Mat4, v: Vec3): Mat4;
function mat4Perspective(fovY: number, aspect: number, near: number, far: number): Mat4;
function mat4LookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4;
function mat4TransformVec4(m: Mat4, v: Vec4): Vec4;

function vec3Add(a: Vec3, b: Vec3): Vec3;
function vec3Sub(a: Vec3, b: Vec3): Vec3;
function vec3Scale(v: Vec3, s: number): Vec3;
function vec3Dot(a: Vec3, b: Vec3): number;
function vec3Cross(a: Vec3, b: Vec3): Vec3;
function vec3Normalize(v: Vec3): Vec3;
function vec3Length(v: Vec3): number;

function lerp(a: number, b: number, t: number): number;
function clamp(value: number, min: number, max: number): number;
```

### Model Types

```typescript
// src/js/model-parser/index.ts

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

function parseOBJ(objText: string): Model;
```

### Texture Types

```typescript
// src/js/texture-loader/index.ts

type WrapMode = 'repeat' | 'clamp';

interface Texture {
  width: number;
  height: number;
  data: Uint8ClampedArray; // RGBA
}

function loadTexture(image: HTMLImageElement): Texture;
function sampleTexture(texture: Texture, u: number, v: number, wrapMode: WrapMode): Vec4;
```

### Framebuffer Types

```typescript
// src/js/framebuffer/index.ts

interface Framebuffer {
  width: number;
  height: number;
  colorBuffer: Uint8ClampedArray; // RGBA
  depthBuffer: Float32Array;
}

function createFramebuffer(width: number, height: number): Framebuffer;
function clearFramebuffer(fb: Framebuffer, clearColor: Vec4): void;
function setPixel(fb: Framebuffer, x: number, y: number, color: Vec4, depth: number): boolean;
function getImageData(fb: Framebuffer): ImageData;
```

### Camera Types

```typescript
// src/js/camera/index.ts

interface OrbitalCamera {
  target: Vec3;      // Look-at point
  distance: number;  // Distance from target
  yaw: number;       // Horizontal angle (radians)
  pitch: number;     // Vertical angle (radians)
}

function createCamera(): OrbitalCamera;
function cameraOrbit(camera: OrbitalCamera, deltaYaw: number, deltaPitch: number): OrbitalCamera;
function cameraZoom(camera: OrbitalCamera, delta: number): OrbitalCamera;
function cameraGetViewMatrix(camera: OrbitalCamera): Mat4;
function cameraGetPosition(camera: OrbitalCamera): Vec3;
```

### Rendering Pipeline Types

```typescript
// src/js/vertex-stage/index.ts

interface ClipVertex {
  position: Vec4;    // Clip space position
  uv: Vec2;
  normal: Vec3;
  worldPosition: Vec3;
}

function transformVertex(vertex: Vertex, mvp: Mat4, modelMatrix: Mat4): ClipVertex;

// src/js/rasterizer/index.ts

interface Fragment {
  x: number;
  y: number;
  depth: number;
  uv: Vec2;
  normal: Vec3;
  worldPosition: Vec3;
}

function rasterizeTriangle(
  v0: ClipVertex,
  v1: ClipVertex,
  v2: ClipVertex,
  viewportWidth: number,
  viewportHeight: number,
  cullBackFaces: boolean
): Fragment[];

// src/js/fragment-stage/index.ts

interface Light {
  direction: Vec3;   // Normalized direction TO light
  color: Vec3;       // RGB 0-1
  intensity: number;
}

function shadeFragment(
  fragment: Fragment,
  texture: Texture | null,
  light: Light
): Vec4;
```

### Scene Types

```typescript
// src/js/scene-manager/index.ts

interface Scene {
  model: Model | null;
  texture: Texture | null;
  camera: OrbitalCamera;
  light: Light;
  modelMatrix: Mat4;
}

function createScene(): Scene;
function renderScene(scene: Scene, framebuffer: Framebuffer): void;
```

### Error Types

```typescript
// src/js/errors/index.ts

enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  LOAD_ERROR = 'LOAD_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

class AppError extends Error {
  code: ErrorCode;
  context: Record<string, unknown>;
}

class ParseError extends AppError { }
class LoadError extends AppError { }
class RenderError extends AppError { }
```

---

## Delivery Phases

### Phase 1: Foundation & Math Primitives
**Goal**: Core math utilities with comprehensive tests

**Tasks**:
1. Set up testing infrastructure (vitest, coverage)
2. Add path alias (`@/`) to tsconfig for clean imports
3. Implement `src/js/errors/` module
4. Implement `src/js/error-handler/` module
5. Implement `src/js/math/` module with all vector/matrix operations
6. Unit tests for all math functions
7. Documentation for math module

**Verification**: `npm run test:unit` passes, 100% coverage on math module

### Phase 2: Framebuffer & Canvas Output
**Goal**: Draw pixels to screen

**Tasks**:
1. Implement `src/js/framebuffer/` module
2. Create basic canvas setup in main.ts
3. Transfer framebuffer to canvas
4. Unit tests for framebuffer operations
5. Visual verification: fill screen with solid color

**Verification**: Canvas displays solid color, unit tests pass

### Phase 3: Triangle Rasterization
**Goal**: Render a hardcoded colored triangle

**Tasks**:
1. Implement `src/js/rasterizer/` - edge function algorithm
2. Implement barycentric coordinate calculation
3. Basic fragment output (no texturing yet)
4. Unit tests for rasterization
5. Visual verification: colored triangle on screen

**Verification**: Triangle renders with correct fill, tests pass

### Phase 4: Vertex Transforms & Camera
**Goal**: Render a rotating cube with perspective

**Tasks**:
1. Implement `src/js/vertex-stage/` - MVP transforms
2. Implement `src/js/camera/` - orbital camera
3. Add perspective projection
4. Add depth buffer testing to framebuffer
5. Create hardcoded cube geometry
6. Implement `src/js/render-loop/` for animation
7. Unit tests for vertex stage and camera
8. Visual verification: rotating cube with depth

**Verification**: Cube rotates with correct perspective and depth, tests pass

### Phase 5: Model Loading
**Goal**: Load and display OBJ files

**Tasks**:
1. Implement `src/js/model-parser/` - OBJ parsing
2. Handle vertex positions, UVs, normals, faces
3. Implement quad triangulation
4. Implement model centering/normalization
5. Unit tests for OBJ parsing (various OBJ formats)
6. Visual verification: load and display test OBJ

**Verification**: OBJ files load and render correctly, tests pass

### Phase 6: Texturing
**Goal**: UV mapping and texture sampling

**Tasks**:
1. Implement `src/js/texture-loader/` - image loading
2. Implement texture sampling with wrap modes
3. Implement perspective-correct UV interpolation in rasterizer
4. Implement `src/js/fragment-stage/` - basic texture sampling
5. Unit tests for texture operations
6. Visual verification: textured model

**Verification**: Textures map correctly to model, tests pass

### Phase 7: Lighting
**Goal**: Basic diffuse shading

**Tasks**:
1. Add diffuse lighting to fragment stage
2. Implement normal interpolation
3. Add light configuration to scene
4. Unit tests for lighting calculations
5. Visual verification: lit model with shading

**Verification**: Model displays correct diffuse shading, tests pass

### Phase 8: User Controls & UI
**Goal**: Orbital camera controls and file upload

**Tasks**:
1. Implement `src/js/input-handler/` - mouse events
2. Wire up mouse drag for camera orbit
3. Wire up scroll wheel for zoom
4. Implement `src/js/scene-manager/` - scene orchestration
5. Create file upload UI (OBJ and texture)
6. Style the application (CSS, no Tailwind)
7. Unit tests for input handling
8. Integration tests for file loading workflow

**Verification**: Mouse controls work, files load via UI, tests pass

### Phase 9: Polish & Error Handling
**Goal**: Robust error handling and edge cases

**Tasks**:
1. Add loading state indicators
2. Handle invalid OBJ files gracefully
3. Handle invalid texture files gracefully
4. Handle edge cases (empty files, malformed data)
5. E2E tests for complete user workflow
6. Update project-level documentation
7. Final verification and cleanup

**Verification**: All tests pass, error states handled, documentation complete

---

## Verification Approach

### Test Commands

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "vitest run src/js",
    "test:integration": "vitest run src/tests/integration",
    "test:e2e": "playwright test src/tests/e2e",
    "test:coverage": "vitest run --coverage src/js",
    "type-check": "tsc --noEmit",
    "format": "prettier --write src",
    "format:check": "prettier --check src",
    "validate": "npm run format:check && npm run type-check && npm run test"
  }
}
```

**Script explanations:**
- `test:unit`: Runs vitest on the `src/js` directory (vitest finds `*.test.ts` files automatically)
- `test:integration`: Runs integration tests in `src/tests/integration`
- `test:e2e`: Runs Playwright E2E tests
- `test:coverage`: Runs unit tests with coverage reporting
- `type-check`: Runs TypeScript compiler to check for type errors (no emit)
- `format`: Formats all source files with Prettier
- `format:check`: Checks formatting without modifying files (for CI)
- `validate`: Full validation pipeline (format check, type check, all tests)

### Test Coverage Goals
- **Math module**: 100% coverage (critical foundation)
- **All other modules**: 80%+ coverage
- **Integration tests**: Cover file loading and rendering pipeline
- **E2E tests**: Cover complete user workflow (load model, load texture, interact)

### Visual Verification Checkpoints
Each phase includes visual verification to catch rendering issues that tests might miss:
- Phase 2: Solid color fill
- Phase 3: Colored triangle
- Phase 4: Rotating cube with depth
- Phase 5: OBJ model display
- Phase 6: Textured model
- Phase 7: Lit model with shading
- Phase 8: Interactive controls

---

## Performance Considerations

### Target Performance
- 30+ FPS for models up to 10,000 triangles
- 800x600 canvas resolution (configurable)

### Optimization Strategies (if needed)
1. **Typed arrays**: Use Float32Array/Uint8ClampedArray throughout
2. **Object pooling**: Reuse fragment objects during rasterization
3. **Early rejection**: Skip triangles outside view frustum
4. **Bounding box tests**: Skip triangles outside screen bounds
5. **Web Workers**: Move rasterization to worker thread (future enhancement)

### Profiling Points
- Frame time breakdown (vertex stage, rasterization, fragment stage)
- Triangle count per frame
- Memory allocation patterns

---

## API Changes

### HTML Structure

```html
<!-- index.html -->
<div id="app">
  <div class="renderer">
    <canvas id="render-canvas"></canvas>
    <div class="controls">
      <div class="file-controls">
        <label class="file-input">
          <input type="file" id="obj-input" accept=".obj">
          Load OBJ
        </label>
        <label class="file-input">
          <input type="file" id="texture-input" accept="image/*">
          Load Texture
        </label>
      </div>
      <div class="status" id="status"></div>
    </div>
  </div>
</div>
```

### CSS Classes (BEM)

```css
.renderer { }
.renderer__canvas { }
.controls { }
.controls__file-input { }
.controls__status { }
.controls__status--loading { }
.controls__status--error { }
```

---

## Dependencies

### Production Dependencies
None - pure software rendering

### Development Dependencies
```json
{
  "devDependencies": {
    "typescript": "~5.9.3",
    "vite": "^7.2.4",
    "vitest": "^3.0.0",
    "@vitest/coverage-v8": "^3.0.0",
    "playwright": "^1.50.0",
    "@playwright/test": "^1.50.0",
    "prettier": "^3.4.0"
  }
}
```

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance below target | User experience | Profile early, optimize hot paths, consider lower resolution |
| Complex OBJ files fail | Limited compatibility | Document supported OBJ subset, provide clear error messages |
| Browser compatibility | Reduced reach | Target ES2022, test in major browsers |
| Numerical precision issues | Visual artifacts | Use typed arrays, test edge cases thoroughly |

---

## Out of Scope (Confirmed)

- WebGL/WebGPU acceleration
- Multiple lights
- Shadows
- Normal/bump mapping
- Skeletal animation
- MTL file parsing
- Multiple models
- Export functionality
- Mobile touch controls (mouse only)
