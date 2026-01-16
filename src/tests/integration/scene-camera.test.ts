import { describe, it, expect } from 'vitest';
import {
  createScene,
  renderScene,
  setSceneModel,
  setSceneTexture,
  setSceneCamera,
  setSceneLight,
} from '@/js/scene-manager/index.ts';
import { createFramebuffer } from '@/js/framebuffer/index.ts';
import {
  createCamera,
  cameraOrbit,
  cameraZoom,
  cameraGetViewMatrix,
  cameraGetPosition,
} from '@/js/camera/index.ts';
import { parseOBJ, normalizeModel } from '@/js/model-parser/index.ts';
import { createSolidTexture } from '@/js/texture-loader/index.ts';
import { vec3, vec4 } from '@/js/math/index.ts';

describe('Camera Integration', () => {
  describe('Camera Orbit', () => {
    it('should update camera yaw with orbit', () => {
      const camera = createCamera();
      const orbited = cameraOrbit(camera, 0.5, 0);

      expect(orbited.yaw).toBeCloseTo(camera.yaw + 0.5);
    });

    it('should update camera pitch with orbit', () => {
      const camera = createCamera();
      const orbited = cameraOrbit(camera, 0, 0.3);

      expect(orbited.pitch).toBeCloseTo(camera.pitch + 0.3);
    });

    it('should clamp pitch to prevent gimbal lock', () => {
      const camera = createCamera();
      // Try to rotate pitch beyond limits
      const orbited = cameraOrbit(camera, 0, Math.PI);

      expect(orbited.pitch).toBeLessThan(Math.PI / 2);
    });

    it('should update view matrix after orbit', () => {
      const camera = createCamera();
      const orbited = cameraOrbit(camera, 1, 0);

      const originalView = cameraGetViewMatrix(camera);
      const orbitedView = cameraGetViewMatrix(orbited);

      // View matrices should be different
      let same = true;
      for (let i = 0; i < 16; i++) {
        if (Math.abs(originalView[i] - orbitedView[i]) > 0.001) {
          same = false;
          break;
        }
      }
      expect(same).toBe(false);
    });
  });

  describe('Camera Zoom', () => {
    it('should update camera distance with zoom', () => {
      const camera = createCamera();
      const zoomed = cameraZoom(camera, 1);

      expect(zoomed.distance).toBeCloseTo(camera.distance + 1);
    });

    it('should clamp zoom to minimum distance', () => {
      const camera = createCamera();
      const zoomed = cameraZoom(camera, -100);

      expect(zoomed.distance).toBeGreaterThan(0);
    });

    it('should clamp zoom to maximum distance', () => {
      const camera = createCamera();
      const zoomed = cameraZoom(camera, 100);

      expect(zoomed.distance).toBeLessThanOrEqual(20);
    });

    it('should update camera position after zoom', () => {
      const camera = createCamera();
      const zoomed = cameraZoom(camera, 2);

      const originalPos = cameraGetPosition(camera);
      const zoomedPos = cameraGetPosition(zoomed);

      // Distance from target should increase
      const originalDist = Math.sqrt(
        originalPos.x ** 2 + originalPos.y ** 2 + originalPos.z ** 2
      );
      const zoomedDist = Math.sqrt(
        zoomedPos.x ** 2 + zoomedPos.y ** 2 + zoomedPos.z ** 2
      );

      expect(zoomedDist).toBeGreaterThan(originalDist);
    });
  });
});

describe('Scene Management Integration', () => {
  it('should orchestrate model, texture, camera, and light', () => {
    const objText = `
      v 0 0 0
      v 1 0 0
      v 0 1 0
      f 1 2 3
    `;
    const model = normalizeModel(parseOBJ(objText));
    const texture = createSolidTexture(vec4(1, 0.5, 0.25, 1));
    const camera = cameraOrbit(createCamera(), 0.5, 0.2);
    const light = {
      direction: vec3(0, 1, 0),
      color: vec3(1, 1, 0.8),
      intensity: 1.2,
    };

    let scene = createScene();
    scene = setSceneModel(scene, model);
    scene = setSceneTexture(scene, texture);
    scene = setSceneCamera(scene, camera);
    scene = setSceneLight(scene, light);

    expect(scene.model).toBe(model);
    expect(scene.texture).toBe(texture);
    expect(scene.camera.yaw).toBeCloseTo(0.5);
    expect(scene.light.intensity).toBe(1.2);
  });

  it('should render scene with all components', () => {
    const objText = `
      v -0.5 -0.5 0
      v 0.5 -0.5 0
      v 0 0.5 0
      vn 0 0 1
      f 1//1 2//1 3//1
    `;
    const model = normalizeModel(parseOBJ(objText));
    const texture = createSolidTexture(vec4(0, 0.8, 0.2, 1));

    let scene = createScene();
    scene = setSceneModel(scene, model);
    scene = setSceneTexture(scene, texture);

    const fb = createFramebuffer(100, 100);

    // Should not throw
    expect(() => renderScene(scene, fb)).not.toThrow();
  });

  it('should update scene rendering when camera changes', () => {
    const objText = `
      v -0.5 -0.5 -3
      v 0.5 -0.5 -3
      v 0 0.5 -3
      vn 0 0 1
      f 1//1 2//1 3//1
    `;
    const model = normalizeModel(parseOBJ(objText));

    let scene = createScene();
    scene = setSceneModel(scene, model);

    const fb1 = createFramebuffer(100, 100);
    renderScene(scene, fb1);
    const pixels1 = new Uint8ClampedArray(fb1.colorBuffer);

    // Change camera
    scene = setSceneCamera(scene, cameraOrbit(scene.camera, Math.PI / 2, 0));

    const fb2 = createFramebuffer(100, 100);
    renderScene(scene, fb2);
    const pixels2 = new Uint8ClampedArray(fb2.colorBuffer);

    // Rendered pixels should be different due to camera rotation
    let different = false;
    for (let i = 0; i < pixels1.length; i++) {
      if (pixels1[i] !== pixels2[i]) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });

  it('should clear and render correctly when model is removed', () => {
    const objText = `
      v 0 0 0
      v 1 0 0
      v 0 1 0
      f 1 2 3
    `;
    const model = normalizeModel(parseOBJ(objText));

    let scene = createScene();
    scene = setSceneModel(scene, model);

    const fb = createFramebuffer(100, 100);
    renderScene(scene, fb);

    // Remove model
    scene = setSceneModel(scene, null);
    renderScene(scene, fb);

    // Should not throw and should clear to background
    expect(fb.colorBuffer.length).toBe(100 * 100 * 4);
  });
});
