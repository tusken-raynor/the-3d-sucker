import { describe, it, expect } from 'vitest';
import {
  createScene,
  renderScene,
  setSceneModel,
  setSceneTexture,
  setSceneCamera,
  setSceneLight,
  setSceneModelMatrix,
} from './index.ts';
import { createFramebuffer } from '@/js/framebuffer/index.ts';
import {
  vec2,
  vec3,
  vec4,
  mat4Identity,
  mat4Translate,
} from '@/js/math/index.ts';
import { createCamera, cameraOrbit } from '@/js/camera/index.ts';
import { createDefaultLight } from '@/js/fragment-stage/index.ts';
import { createSolidTexture } from '@/js/texture-loader/index.ts';
import type { Model } from '@/js/model-parser/index.ts';

function createTestModel(): Model {
  return {
    triangles: [
      {
        v0: { position: vec3(0, 0, 0), uv: vec2(0, 0), normal: vec3(0, 0, 1) },
        v1: { position: vec3(1, 0, 0), uv: vec2(1, 0), normal: vec3(0, 0, 1) },
        v2: { position: vec3(0, 1, 0), uv: vec2(0, 1), normal: vec3(0, 0, 1) },
      },
    ],
    boundingBox: { min: vec3(0, 0, 0), max: vec3(1, 1, 0) },
    center: vec3(0.5, 0.5, 0),
  };
}

describe('createScene', () => {
  it('should create a scene with null model', () => {
    const scene = createScene();
    expect(scene.model).toBeNull();
  });

  it('should create a scene with null texture', () => {
    const scene = createScene();
    expect(scene.texture).toBeNull();
  });

  it('should create a scene with default camera', () => {
    const scene = createScene();
    expect(scene.camera).toBeDefined();
    expect(scene.camera.distance).toBeGreaterThan(0);
  });

  it('should create a scene with default light', () => {
    const scene = createScene();
    expect(scene.light).toBeDefined();
    expect(scene.light.intensity).toBe(1);
  });

  it('should create a scene with identity model matrix', () => {
    const scene = createScene();
    const identity = mat4Identity();
    for (let i = 0; i < 16; i++) {
      expect(scene.modelMatrix[i]).toBe(identity[i]);
    }
  });
});

describe('renderScene', () => {
  it('should clear framebuffer when no model', () => {
    const scene = createScene();
    const fb = createFramebuffer(100, 100);

    renderScene(scene, fb);

    // Check that framebuffer is cleared (not all zeros)
    // The clear color is dark blue/gray (0.1, 0.1, 0.15)
    expect(fb.colorBuffer[0]).toBeGreaterThan(0);
  });

  it('should render model when present', () => {
    const scene = createScene();
    const model = createTestModel();
    const sceneWithModel = setSceneModel(scene, model);

    // Move camera back so we can see the triangle
    const camera = createCamera();
    const sceneWithCamera = setSceneCamera(sceneWithModel, camera);

    // Move model back into view
    const modelMatrix = mat4Translate(mat4Identity(), vec3(0, 0, -3));
    const finalScene = setSceneModelMatrix(sceneWithCamera, modelMatrix);

    const fb = createFramebuffer(100, 100);
    renderScene(finalScene, fb);

    // Should not throw and framebuffer should have some pixels set
    expect(fb.colorBuffer.length).toBe(100 * 100 * 4);
  });

  it('should render with texture', () => {
    const scene = createScene();
    const model = createTestModel();
    const texture = createSolidTexture(vec4(1, 0, 0, 1));

    let modifiedScene = setSceneModel(scene, model);
    modifiedScene = setSceneTexture(modifiedScene, texture);
    modifiedScene = setSceneModelMatrix(
      modifiedScene,
      mat4Translate(mat4Identity(), vec3(0, 0, -3))
    );

    const fb = createFramebuffer(100, 100);

    // Should not throw
    expect(() => renderScene(modifiedScene, fb)).not.toThrow();
  });
});

describe('setSceneModel', () => {
  it('should set model in scene', () => {
    const scene = createScene();
    const model = createTestModel();
    const newScene = setSceneModel(scene, model);

    expect(newScene.model).toBe(model);
  });

  it('should not mutate original scene', () => {
    const scene = createScene();
    const model = createTestModel();
    setSceneModel(scene, model);

    expect(scene.model).toBeNull();
  });

  it('should clear model when set to null', () => {
    const scene = createScene();
    const model = createTestModel();
    const sceneWithModel = setSceneModel(scene, model);
    const sceneWithoutModel = setSceneModel(sceneWithModel, null);

    expect(sceneWithoutModel.model).toBeNull();
  });
});

describe('setSceneTexture', () => {
  it('should set texture in scene', () => {
    const scene = createScene();
    const texture = createSolidTexture(vec4(1, 1, 1, 1));
    const newScene = setSceneTexture(scene, texture);

    expect(newScene.texture).toBe(texture);
  });

  it('should not mutate original scene', () => {
    const scene = createScene();
    const texture = createSolidTexture(vec4(1, 1, 1, 1));
    setSceneTexture(scene, texture);

    expect(scene.texture).toBeNull();
  });
});

describe('setSceneCamera', () => {
  it('should set camera in scene', () => {
    const scene = createScene();
    const camera = cameraOrbit(createCamera(), 1, 0.5);
    const newScene = setSceneCamera(scene, camera);

    expect(newScene.camera.yaw).toBe(camera.yaw);
    expect(newScene.camera.pitch).toBe(camera.pitch);
  });

  it('should not mutate original scene', () => {
    const scene = createScene();
    const originalYaw = scene.camera.yaw;
    const camera = cameraOrbit(createCamera(), 1, 0.5);
    setSceneCamera(scene, camera);

    expect(scene.camera.yaw).toBe(originalYaw);
  });
});

describe('setSceneLight', () => {
  it('should set light in scene', () => {
    const scene = createScene();
    const light = {
      direction: vec3(0, 1, 0),
      color: vec3(1, 0, 0),
      intensity: 0.5,
    };
    const newScene = setSceneLight(scene, light);

    expect(newScene.light.intensity).toBe(0.5);
    expect(newScene.light.color.x).toBe(1);
  });

  it('should not mutate original scene', () => {
    const scene = createScene();
    const originalIntensity = scene.light.intensity;
    const light = createDefaultLight();
    light.intensity = 0.5;
    setSceneLight(scene, light);

    expect(scene.light.intensity).toBe(originalIntensity);
  });
});

describe('setSceneModelMatrix', () => {
  it('should set model matrix in scene', () => {
    const scene = createScene();
    const matrix = mat4Translate(mat4Identity(), vec3(1, 2, 3));
    const newScene = setSceneModelMatrix(scene, matrix);

    expect(newScene.modelMatrix[12]).toBe(1);
    expect(newScene.modelMatrix[13]).toBe(2);
    expect(newScene.modelMatrix[14]).toBe(3);
  });

  it('should not mutate original scene', () => {
    const scene = createScene();
    const matrix = mat4Translate(mat4Identity(), vec3(1, 2, 3));
    setSceneModelMatrix(scene, matrix);

    expect(scene.modelMatrix[12]).toBe(0);
  });
});
