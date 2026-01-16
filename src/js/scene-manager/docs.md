# Scene Manager Module

## Purpose

Orchestrates the complete rendering pipeline. Manages scene state (model, texture, camera, light) and coordinates rendering from vertex transformation through fragment shading to framebuffer output.

## How It Works

### Scene State

The Scene holds all data needed for rendering:

- **model**: The 3D model (triangles with vertices, UVs, normals)
- **texture**: Optional texture for surface color
- **camera**: Orbital camera for view transformation
- **light**: Directional light for diffuse shading
- **modelMatrix**: Model-to-world transformation

### Rendering Pipeline

1. **Clear**: Fill framebuffer with background color
2. **MVP calculation**: Combine projection, view, and model matrices
3. **Vertex stage**: Transform each triangle vertex to clip space
4. **Rasterization**: Generate fragments from triangles
5. **Fragment stage**: Shade each fragment with texture and lighting
6. **Framebuffer write**: Write pixels with depth testing

## I/O Interface

### Types

```typescript
interface Scene {
  model: Model | null;
  texture: Texture | null;
  camera: OrbitalCamera;
  light: Light;
  modelMatrix: Mat4;
}
```

### Functions

```typescript
createScene(): Scene
renderScene(scene: Scene, framebuffer: Framebuffer): void
setSceneModel(scene: Scene, model: Model | null): Scene
setSceneTexture(scene: Scene, texture: Texture | null): Scene
setSceneCamera(scene: Scene, camera: OrbitalCamera): Scene
setSceneLight(scene: Scene, light: Light): Scene
setSceneModelMatrix(scene: Scene, modelMatrix: Mat4): Scene
```

### Usage Example

```typescript
import {
  createScene,
  renderScene,
  setSceneModel,
  setSceneCamera,
} from '@/js/scene-manager';
import { createFramebuffer, getImageData } from '@/js/framebuffer';

let scene = createScene();
scene = setSceneModel(scene, loadedModel);

const fb = createFramebuffer(800, 600);

function render() {
  renderScene(scene, fb);
  ctx.putImageData(getImageData(fb), 0, 0);
  requestAnimationFrame(render);
}

// Update camera on input
scene = setSceneCamera(scene, updatedCamera);
```

## Tests

Unit tests cover:

- Scene creation with default values
- Null model and texture handling
- Rendering with no model (just clears)
- Rendering with model
- Rendering with texture
- Immutable scene updates (setSceneModel, setSceneTexture, etc.)
- Model matrix application
- Camera and light updates
