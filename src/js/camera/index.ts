import type { Vec3, Mat4 } from '@/js/math/index.ts';
import { vec3, mat4LookAt, clamp } from '@/js/math/index.ts';

export interface OrbitalCamera {
  target: Vec3;
  distance: number;
  yaw: number;
  pitch: number;
}

const MIN_DISTANCE = 0.5;
const MAX_DISTANCE = 20;
const MIN_PITCH = -Math.PI / 2 + 0.01;
const MAX_PITCH = Math.PI / 2 - 0.01;

export function createCamera(): OrbitalCamera {
  return {
    target: vec3(0, 0, 0),
    distance: 3,
    yaw: 0,
    pitch: 0.3,
  };
}

export function cameraOrbit(
  camera: OrbitalCamera,
  deltaYaw: number,
  deltaPitch: number
): OrbitalCamera {
  return {
    ...camera,
    yaw: camera.yaw + deltaYaw,
    pitch: clamp(camera.pitch + deltaPitch, MIN_PITCH, MAX_PITCH),
  };
}

export function cameraZoom(
  camera: OrbitalCamera,
  delta: number
): OrbitalCamera {
  return {
    ...camera,
    distance: clamp(camera.distance + delta, MIN_DISTANCE, MAX_DISTANCE),
  };
}

export function cameraGetPosition(camera: OrbitalCamera): Vec3 {
  const { target, distance, yaw, pitch } = camera;

  // Spherical to Cartesian conversion
  const cosPitch = Math.cos(pitch);
  const x = target.x + distance * cosPitch * Math.sin(yaw);
  const y = target.y + distance * Math.sin(pitch);
  const z = target.z + distance * cosPitch * Math.cos(yaw);

  return vec3(x, y, z);
}

export function cameraGetViewMatrix(camera: OrbitalCamera): Mat4 {
  const eye = cameraGetPosition(camera);
  const up = vec3(0, 1, 0);
  return mat4LookAt(eye, camera.target, up);
}
