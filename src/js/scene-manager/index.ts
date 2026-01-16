import type { Mat4 } from '@/js/math/index.ts';
import {
  mat4Identity,
  mat4Multiply,
  mat4Perspective,
  vec4,
} from '@/js/math/index.ts';
import type { Model } from '@/js/model-parser/index.ts';
import type { Texture } from '@/js/texture-loader/index.ts';
import type { OrbitalCamera } from '@/js/camera/index.ts';
import { createCamera, cameraGetViewMatrix } from '@/js/camera/index.ts';
import type { Light } from '@/js/fragment-stage/index.ts';
import {
  createDefaultLight,
  shadeFragment,
} from '@/js/fragment-stage/index.ts';
import { transformVertex } from '@/js/vertex-stage/index.ts';
import { rasterizeTriangle } from '@/js/rasterizer/index.ts';
import type { Framebuffer } from '@/js/framebuffer/index.ts';
import { clearFramebuffer, setPixel } from '@/js/framebuffer/index.ts';

export interface Scene {
  model: Model | null;
  texture: Texture | null;
  camera: OrbitalCamera;
  light: Light;
  modelMatrix: Mat4;
}

export function createScene(): Scene {
  return {
    model: null,
    texture: null,
    camera: createCamera(),
    light: createDefaultLight(),
    modelMatrix: mat4Identity(),
  };
}

export function renderScene(scene: Scene, framebuffer: Framebuffer): void {
  const clearColor = vec4(0.1, 0.1, 0.15, 1);
  clearFramebuffer(framebuffer, clearColor);

  if (!scene.model) {
    return;
  }

  const { width, height } = framebuffer;
  const aspect = width / height;
  const fov = Math.PI / 4;
  const near = 0.1;
  const far = 100;

  const projection = mat4Perspective(fov, aspect, near, far);
  const view = cameraGetViewMatrix(scene.camera);
  const mvp = mat4Multiply(mat4Multiply(projection, view), scene.modelMatrix);

  for (const triangle of scene.model.triangles) {
    const cv0 = transformVertex(triangle.v0, mvp, scene.modelMatrix);
    const cv1 = transformVertex(triangle.v1, mvp, scene.modelMatrix);
    const cv2 = transformVertex(triangle.v2, mvp, scene.modelMatrix);

    const fragments = rasterizeTriangle(cv0, cv1, cv2, width, height, true);

    for (const fragment of fragments) {
      const color = shadeFragment(fragment, scene.texture, scene.light);
      setPixel(framebuffer, fragment.x, fragment.y, color, fragment.depth);
    }
  }
}

export function setSceneModel(scene: Scene, model: Model | null): Scene {
  return { ...scene, model };
}

export function setSceneTexture(scene: Scene, texture: Texture | null): Scene {
  return { ...scene, texture };
}

export function setSceneCamera(scene: Scene, camera: OrbitalCamera): Scene {
  return { ...scene, camera };
}

export function setSceneLight(scene: Scene, light: Light): Scene {
  return { ...scene, light };
}

export function setSceneModelMatrix(scene: Scene, modelMatrix: Mat4): Scene {
  return { ...scene, modelMatrix };
}
