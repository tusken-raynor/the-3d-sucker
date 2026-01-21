# Input Handler Module

## Purpose

Handles mouse input for camera controls. Provides drag detection for camera orbiting and scroll wheel detection for zooming.

## How It Works

### Input Detection

1. **Mouse drag**: Left mouse button down on canvas + move anywhere triggers orbit callbacks
2. **Scroll wheel**: Wheel events on canvas trigger zoom callbacks
3. **Release detection**: Mouseup anywhere stops dragging (tracked globally on document)

### Sensitivity

- **Orbit sensitivity**: Configurable (default 0.005) - converts pixel movement to radians
- **Zoom sensitivity**: Fixed at 0.01 - converts wheel delta to zoom amount

## I/O Interface

### Types

```typescript
interface InputState {
  isDragging: boolean;
  lastX: number;
  lastY: number;
}

interface InputCallbacks {
  onOrbit: (deltaYaw: number, deltaPitch: number) => void;
  onZoom: (delta: number) => void;
}
```

### Functions

```typescript
createInputState(): InputState
createInputHandler(element: HTMLElement, callbacks: InputCallbacks, sensitivity?: number): { state: InputState; cleanup: () => void }
```

### Usage Example

```typescript
import { createInputHandler } from '@/js/input-handler';
import { cameraOrbit, cameraZoom } from '@/js/camera';

let camera = createCamera();

const { cleanup } = createInputHandler(canvas, {
  onOrbit: (deltaYaw, deltaPitch) => {
    camera = cameraOrbit(camera, deltaYaw, deltaPitch);
  },
  onZoom: (delta) => {
    camera = cameraZoom(camera, delta);
  },
});

// Call cleanup() when done to remove event listeners
```

## Tests

Unit tests cover:

- Initial state creation
- Drag start on left mouse button
- Right click does not start drag
- Drag stop on mouseup (global)
- Drag continues when mouse leaves element bounds
- Mouse movement tracked on document during drag
- Mouseup on document stops dragging
- Orbit callback during drag
- No orbit callback when not dragging
- Delta calculation for orbit
- Sensitivity application
- Zoom callback on wheel
- Zoom sensitivity
- State updates during drag
- Event listener cleanup (element and document listeners)
