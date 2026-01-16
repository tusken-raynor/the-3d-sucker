# Camera Module

## Purpose

Implements an orbital camera that rotates around a target point. Provides intuitive controls for 3D model viewing with mouse drag for orbit and scroll for zoom.

## How It Works

The camera uses spherical coordinates relative to a target point:

- **Distance**: How far from the target
- **Yaw**: Horizontal rotation angle (radians)
- **Pitch**: Vertical rotation angle (radians, clamped to avoid gimbal lock)
- **Target**: The point the camera looks at

### Spherical to Cartesian Conversion

```
x = target.x + distance * cos(pitch) * sin(yaw)
y = target.y + distance * sin(pitch)
z = target.z + distance * cos(pitch) * cos(yaw)
```

### Constraints

- Distance: clamped between 0.5 and 20
- Pitch: clamped to ±89° to avoid gimbal lock at poles

## I/O Interface

### Types

```typescript
interface OrbitalCamera {
  target: Vec3; // Look-at point
  distance: number; // Distance from target
  yaw: number; // Horizontal angle (radians)
  pitch: number; // Vertical angle (radians)
}
```

### Functions

```typescript
createCamera(): OrbitalCamera
cameraOrbit(camera: OrbitalCamera, deltaYaw: number, deltaPitch: number): OrbitalCamera
cameraZoom(camera: OrbitalCamera, delta: number): OrbitalCamera
cameraGetPosition(camera: OrbitalCamera): Vec3
cameraGetViewMatrix(camera: OrbitalCamera): Mat4
```

### Usage Example

```typescript
import {
  createCamera,
  cameraOrbit,
  cameraZoom,
  cameraGetViewMatrix,
} from '@/js/camera';

let camera = createCamera();

// Orbit on mouse drag
canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    camera = cameraOrbit(camera, e.movementX * 0.01, -e.movementY * 0.01);
  }
});

// Zoom on scroll
canvas.addEventListener('wheel', (e) => {
  camera = cameraZoom(camera, e.deltaY * 0.01);
});

// Get view matrix for rendering
const view = cameraGetViewMatrix(camera);
```

## Tests

Unit tests cover:

- Camera creation with default values
- Orbit updates yaw and pitch
- Pitch clamping prevents gimbal lock
- Orbit preserves distance and target
- Zoom adjusts distance correctly
- Zoom clamps to min/max distance
- Zoom preserves other camera properties
- Position computed correctly from spherical coords
- Position at correct distance from target
- Position responds to yaw and pitch changes
- View matrix is valid Mat4
