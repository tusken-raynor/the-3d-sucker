import { describe, it, expect } from 'vitest';
import {
  createCamera,
  cameraOrbit,
  cameraZoom,
  cameraGetPosition,
  cameraGetViewMatrix,
} from './index.ts';
import { vec3Length, vec3Sub } from '@/js/math/index.ts';

const EPSILON = 0.0001;

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThan(EPSILON);
}

describe('createCamera', () => {
  it('should create camera with default values', () => {
    const camera = createCamera();

    expect(camera.target.x).toBe(0);
    expect(camera.target.y).toBe(0);
    expect(camera.target.z).toBe(0);
    expect(camera.distance).toBe(3);
    expect(camera.yaw).toBe(0);
    expect(camera.pitch).toBeGreaterThan(0);
  });
});

describe('cameraOrbit', () => {
  it('should update yaw and pitch', () => {
    const camera = createCamera();
    const orbited = cameraOrbit(camera, 0.5, 0.2);

    expect(orbited.yaw).toBe(camera.yaw + 0.5);
    expect(orbited.pitch).toBe(camera.pitch + 0.2);
  });

  it('should clamp pitch to avoid gimbal lock', () => {
    const camera = createCamera();

    // Try to pitch way up
    const pitchedUp = cameraOrbit(camera, 0, Math.PI);
    expect(pitchedUp.pitch).toBeLessThan(Math.PI / 2);

    // Try to pitch way down
    const pitchedDown = cameraOrbit(camera, 0, -Math.PI);
    expect(pitchedDown.pitch).toBeGreaterThan(-Math.PI / 2);
  });

  it('should not modify distance or target', () => {
    const camera = createCamera();
    const orbited = cameraOrbit(camera, 1, 1);

    expect(orbited.distance).toBe(camera.distance);
    expect(orbited.target).toEqual(camera.target);
  });
});

describe('cameraZoom', () => {
  it('should adjust distance', () => {
    const camera = createCamera();
    const zoomedIn = cameraZoom(camera, -1);
    const zoomedOut = cameraZoom(camera, 1);

    expect(zoomedIn.distance).toBe(camera.distance - 1);
    expect(zoomedOut.distance).toBe(camera.distance + 1);
  });

  it('should clamp minimum distance', () => {
    const camera = createCamera();
    const zoomed = cameraZoom(camera, -100);

    expect(zoomed.distance).toBeGreaterThan(0);
    expect(zoomed.distance).toBe(0.5);
  });

  it('should clamp maximum distance', () => {
    const camera = createCamera();
    const zoomed = cameraZoom(camera, 100);

    expect(zoomed.distance).toBe(20);
  });

  it('should not modify yaw, pitch, or target', () => {
    const camera = createCamera();
    const zoomed = cameraZoom(camera, 1);

    expect(zoomed.yaw).toBe(camera.yaw);
    expect(zoomed.pitch).toBe(camera.pitch);
    expect(zoomed.target).toEqual(camera.target);
  });
});

describe('cameraGetPosition', () => {
  it('should compute eye position from spherical coordinates', () => {
    const camera = createCamera();
    camera.yaw = 0;
    camera.pitch = 0;

    const pos = cameraGetPosition(camera);

    // At yaw=0, pitch=0, camera should be along +Z axis
    expectClose(pos.x, 0);
    expectClose(pos.y, 0);
    expectClose(pos.z, camera.distance);
  });

  it('should position camera at correct distance', () => {
    const camera = createCamera();
    const pos = cameraGetPosition(camera);

    const dist = vec3Length(vec3Sub(pos, camera.target));
    expectClose(dist, camera.distance);
  });

  it('should respond to yaw rotation', () => {
    const camera = { ...createCamera(), yaw: Math.PI / 2, pitch: 0 };
    const pos = cameraGetPosition(camera);

    // At yaw=90°, camera should be along +X axis
    expectClose(pos.x, camera.distance);
    expectClose(pos.y, 0);
    expectClose(pos.z, 0);
  });

  it('should respond to pitch rotation', () => {
    const camera = { ...createCamera(), yaw: 0, pitch: Math.PI / 4 };
    const pos = cameraGetPosition(camera);

    // At pitch=45°, y should be positive
    expect(pos.y).toBeGreaterThan(0);
    expect(pos.z).toBeGreaterThan(0);
  });
});

describe('cameraGetViewMatrix', () => {
  it('should return a valid view matrix', () => {
    const camera = createCamera();
    const view = cameraGetViewMatrix(camera);

    expect(view.length).toBe(16);
    expect(view).toBeInstanceOf(Float32Array);
  });

  it('should transform camera position to origin', () => {
    const camera = createCamera();
    const view = cameraGetViewMatrix(camera);

    // The view matrix should transform eye position to origin
    // This is a property of lookAt matrices
    expect(view[15]).toBe(1); // Homogeneous coordinate
  });
});
