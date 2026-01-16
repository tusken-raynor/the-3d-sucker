# Full SDD workflow

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Workflow Steps

### [x] Step: Requirements
<!-- chat-id: 595aa6cb-b029-4584-84b5-26dab8d31036 -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification
<!-- chat-id: b7723e0f-51b1-4aac-a8fe-c5b9037e1fac -->

Create a technical specification based on the PRD in `{@artifacts_path}/requirements.md`.

1. Review existing codebase architecture and identify reusable components
2. Define the implementation approach

Save to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach referencing existing code patterns
- Source code structure changes
- Data model / API / interface changes
- Delivery phases (incremental, testable milestones)
- Verification approach using project lint/test commands

### [x] Step: Planning
<!-- chat-id: d6e48775-a534-4367-9724-0eaf01107285 -->

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

1. Break down the work into concrete tasks
2. Each task should reference relevant contracts and include verification steps
3. Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function) or too broad (entire feature).

If the feature is trivial and doesn't warrant full specification, update this workflow to remove unnecessary steps and explain the reasoning to the user.

Save to `{@artifacts_path}/plan.md`.

---


### [x] Step: Build
<!-- chat-id: 20e67a9b-6c5b-4aa7-8540-260561554877 -->
<!-- agent: CLAUDE_CODE -->

Now build the app according to the developed plan
## Implementation Plan

Based on the technical specification, the implementation is divided into 9 phases. Each phase builds on the previous and includes verification steps.

---

### Phase 1: Foundation & Math Primitives

#### [ ] Step 1.1: Set up testing infrastructure and test goals
- Install dev dependencies: `vitest`, `@vitest/coverage-v8`, `playwright`, `@playwright/test`, `prettier`, `eslint`
- Add test scripts to `package.json`:
  - `test`, `test:unit`, `test:integration`, `test:e2e`, `test:coverage`
  - `type-check`, `lint`, `format`, `format:check`, `validate`
- Create vitest config if needed
- Create playwright config
- Create ESLint config for TypeScript
- Create test directories and define test goals:
  - `src/tests/integration/docs.md` with integration test goals
  - `src/tests/e2e/docs.md` with E2E test goals
- **Verification**: `npm run test:unit` runs (even if no tests yet), `npm run lint` runs

#### [ ] Step 1.2: Configure path alias
- Update `tsconfig.json` with `baseUrl` and `paths` for `@/*` alias
- Create `vite.config.ts` with resolve alias configuration
- **Verification**: TypeScript and Vite resolve `@/` imports correctly

#### [ ] Step 1.3: Implement errors module
- Create `src/js/errors/index.ts` with:
  - `ErrorCode` enum (VALIDATION_ERROR, PARSE_ERROR, LOAD_ERROR, RENDER_ERROR, INTERNAL_ERROR)
  - `AppError` base class
  - `ValidationError`, `ParseError`, `LoadError`, `RenderError` subclasses
- Create `src/js/errors/index.test.ts` with unit tests
- Create `src/js/errors/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 1.4: Implement error-handler module
- Create `src/js/error-handler/index.ts` with centralized error handling
- Create `src/js/error-handler/index.test.ts` with unit tests
- Create `src/js/error-handler/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 1.5: Implement math module
- Create `src/js/math/index.ts` with:
  - `Vec2`, `Vec3`, `Vec4` interfaces and factory functions
  - `Mat4` type (Float32Array) and operations: identity, multiply, translate, rotateX/Y/Z, scale, perspective, lookAt, transformVec4
  - Vector operations: add, sub, scale, dot, cross, normalize, length
  - Utility functions: lerp, clamp
- Create `src/js/math/index.test.ts` with comprehensive tests (target 100% coverage)
- Create `src/js/math/docs.md`
- **Verification**: `npm run test:unit` passes, `npm run test:coverage` shows 100% on math module

---

### Phase 2: Framebuffer & Canvas Output

#### [ ] Step 2.1: Implement framebuffer module
- Create `src/js/framebuffer/index.ts` with:
  - `Framebuffer` interface (width, height, colorBuffer, depthBuffer)
  - `createFramebuffer(width, height)`: allocate buffers
  - `clearFramebuffer(fb, clearColor)`: reset color/depth
  - `setPixel(fb, x, y, color, depth)`: write with depth test
  - `getImageData(fb)`: create ImageData for canvas
- Create `src/js/framebuffer/index.test.ts`
- Create `src/js/framebuffer/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 2.2: Set up canvas and basic rendering
- Update `index.html` with basic structure (canvas element)
- Update `src/main.ts` to:
  - Create canvas and get 2D context
  - Create framebuffer at 800x600
  - Clear with solid color
  - Transfer to canvas
- Remove template boilerplate (`counter.ts`, SVG files)
- **Verification**: Browser shows solid colored canvas

---

### Phase 3: Triangle Rasterization

#### [ ] Step 3.1: Implement rasterizer module
- Create `src/js/rasterizer/index.ts` with:
  - `Fragment` interface (x, y, depth, uv, normal, worldPosition)
  - `rasterizeTriangle()`: edge function algorithm
  - Barycentric coordinate calculation
  - Perspective-correct interpolation for attributes
  - Back-face culling support
  - Near-plane clipping (clip triangles intersecting the near plane)
  - Viewport transform (NDC → screen coordinates)
  - Screen bounds clipping (scissoring)
- Create `src/js/rasterizer/index.test.ts`
- Create `src/js/rasterizer/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 3.2: Visual verification - colored triangle
- Update `src/main.ts` to render a hardcoded triangle using rasterizer
- Assign vertex colors and interpolate via barycentric coords
- **Verification**: Browser shows colored triangle with smooth gradient

---

### Phase 4: Vertex Transforms & Camera

#### [ ] Step 4.1: Implement vertex-stage module
- Create `src/js/vertex-stage/index.ts` with:
  - `ClipVertex` interface (position, uv, normal, worldPosition)
  - `transformVertex(vertex, mvp, modelMatrix)`: apply transforms
- Create `src/js/vertex-stage/index.test.ts`
- Create `src/js/vertex-stage/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 4.2: Implement camera module
- Create `src/js/camera/index.ts` with:
  - `OrbitalCamera` interface (target, distance, yaw, pitch)
  - `createCamera()`: default camera state
  - `cameraOrbit(camera, deltaYaw, deltaPitch)`: rotate (with pitch clamping)
  - `cameraZoom(camera, delta)`: adjust distance (with min/max clamping)
  - `cameraGetViewMatrix(camera)`: compute lookAt matrix
  - `cameraGetPosition(camera)`: compute eye position from spherical coords
- Create `src/js/camera/index.test.ts`
- Create `src/js/camera/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 4.3: Implement render-loop module
- Create `src/js/render-loop/index.ts` with:
  - `RenderLoop` class or functions for requestAnimationFrame management
  - Start/stop controls
  - Frame callback with delta time
- Create `src/js/render-loop/index.test.ts`
- Create `src/js/render-loop/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 4.4: Visual verification - rotating cube
- Create hardcoded cube geometry (8 vertices, 12 triangles)
- Integrate vertex-stage, camera, rasterizer
- Add depth buffer testing
- Animate rotation in render loop
- **Verification**: Browser shows rotating cube with correct perspective and depth

---

### Phase 5: Model Loading

#### [ ] Step 5.1: Implement model-parser module
- Create `src/js/model-parser/index.ts` with:
  - `Vertex`, `Triangle`, `Model` interfaces
  - `parseOBJ(objText)`: parse v, vt, vn, f lines
  - Handle various face formats (v, v/vt, v/vt/vn, v//vn)
  - Triangulate quads (split into 2 triangles)
  - Compute bounding box and center
  - Normalize model to unit scale
- Create `src/js/model-parser/index.test.ts` with tests for:
  - Basic OBJ parsing
  - Various face formats
  - Quad triangulation
  - Empty/malformed input handling
- Create `src/js/model-parser/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 5.2: Visual verification - OBJ rendering
- Update main.ts to load a test OBJ file (e.g., cube.obj)
- Replace hardcoded geometry with parsed model
- **Verification**: Browser renders loaded OBJ model

---

### Phase 6: Texturing

#### [ ] Step 6.1: Implement texture-loader module
- Create `src/js/texture-loader/index.ts` with:
  - `WrapMode` type ('repeat' | 'clamp')
  - `Texture` interface (width, height, data)
  - `loadTexture(image)`: extract pixel data from HTMLImageElement
  - `sampleTexture(texture, u, v, wrapMode)`: nearest-neighbor sampling
  - Note: Bilinear filtering is an optional future enhancement (not in MVP)
- Create `src/js/texture-loader/index.test.ts`
- Create `src/js/texture-loader/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 6.2: Implement fragment-stage module
- Create `src/js/fragment-stage/index.ts` with:
  - `Light` interface (direction, color, intensity)
  - `shadeFragment(fragment, texture, light)`: sample texture and return color
  - For now, just texture sampling (lighting added in Phase 7)
- Create `src/js/fragment-stage/index.test.ts`
- Create `src/js/fragment-stage/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 6.3: Integrate texturing into pipeline
- Update rasterizer to pass perspective-correct UVs
- Wire fragment stage into rendering
- **Verification**: Browser shows textured model

---

### Phase 7: Lighting

#### [ ] Step 7.1: Add diffuse lighting to fragment stage
- Update `src/js/fragment-stage/index.ts` with:
  - Diffuse lighting calculation: `max(0, dot(normal, lightDir))`
  - Final color: `textureColor × diffuseIntensity × lightColor`
- Update `src/js/fragment-stage/index.test.ts` with lighting tests
- Update `src/js/fragment-stage/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 7.2: Visual verification - lit model
- Configure default light in scene
- **Verification**: Browser shows model with diffuse shading

---

### Phase 8: User Controls & UI

#### [ ] Step 8.1: Implement input-handler module
- Create `src/js/input-handler/index.ts` with:
  - Mouse drag detection for camera orbit
  - Scroll wheel detection for zoom
  - Event listener setup/cleanup
- Create `src/js/input-handler/index.test.ts`
- Create `src/js/input-handler/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 8.2: Implement scene-manager module
- Create `src/js/scene-manager/index.ts` with:
  - `Scene` interface (model, texture, camera, light, modelMatrix)
  - `createScene()`: default scene state
  - `renderScene(scene, framebuffer)`: orchestrate full pipeline
- Create `src/js/scene-manager/index.test.ts`
- Create `src/js/scene-manager/docs.md`
- **Verification**: `npm run test:unit` passes

#### [ ] Step 8.3: Build file upload UI
- Update `index.html` with file input controls (OBJ and texture)
- Update `src/style.css` with BEM-style CSS (no Tailwind)
- Wire up file inputs to load model/texture
- **Verification**: Files can be loaded via UI

#### [ ] Step 8.4: Wire up mouse controls
- Connect input-handler to camera
- Mouse drag orbits camera
- Scroll wheel zooms
- **Verification**: Camera responds to mouse input

#### [ ] Step 8.5: Integration tests
- Update `src/tests/integration/docs.md`: replace test goals with actual test documentation
- Create integration tests for file loading workflow
- **Verification**: `npm run test:integration` passes

---

### Phase 9: Polish & Error Handling

#### [ ] Step 9.1: Add loading states
- Add status display element
- Show loading indicator during file processing
- **Verification**: UI shows loading feedback

#### [ ] Step 9.2: Add error handling
- Handle invalid OBJ files gracefully (show user-friendly error)
- Handle invalid texture files gracefully
- Handle edge cases (empty files, malformed data)
- **Verification**: Errors displayed clearly, app doesn't crash

#### [ ] Step 9.3: E2E tests
- Update `src/tests/e2e/docs.md`: replace test goals with actual test documentation
- Create E2E tests for complete user workflow:
  - Load model file
  - Load texture file
  - Interact with camera
- **Verification**: `npm run test:e2e` passes

#### [ ] Step 9.4: Documentation and cleanup
- Create/update project-level `docs.md`
- Ensure all module `docs.md` files are complete
- Remove any unused code/files
- **Verification**: All documentation present, `npm run validate` passes

---

## Final Verification

Run full validation:
```bash
npm run validate
```

Expected results:
- Format check passes
- Lint check passes
- Type check passes
- All unit tests pass
- All integration tests pass
- All E2E tests pass
