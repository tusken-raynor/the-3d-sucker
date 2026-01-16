# Render Loop Module

## Purpose

Manages the animation loop using `requestAnimationFrame`. Provides start/stop controls and calculates delta time between frames for smooth animations.

## How It Works

The render loop:

1. Uses `requestAnimationFrame` for browser-synchronized rendering
2. Calculates delta time (seconds) between frames
3. Calls the provided callback with delta time each frame
4. Can be started and stopped dynamically

### Delta Time

- First frame: deltaTime = 0 (no previous frame to compare)
- Subsequent frames: deltaTime = (currentTime - lastTime) / 1000

Delta time in seconds allows frame-rate independent animations:

```typescript
rotation += rotationSpeed * deltaTime;
```

## I/O Interface

### Types

```typescript
interface RenderLoop {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

type FrameCallback = (deltaTime: number) => void;
```

### Functions

```typescript
createRenderLoop(callback: FrameCallback): RenderLoop
```

### Usage Example

```typescript
import { createRenderLoop } from '@/js/render-loop';

let rotation = 0;

const loop = createRenderLoop((deltaTime) => {
  // Update
  rotation += 1.0 * deltaTime; // 1 radian per second

  // Render
  clearFramebuffer(fb, clearColor);
  renderScene(rotation);
  ctx.putImageData(getImageData(fb), 0, 0);
});

// Start rendering
loop.start();

// Stop when needed (e.g., tab hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    loop.stop();
  } else {
    loop.start();
  }
});
```

## Tests

Unit tests cover:

- Render loop creation with required methods
- Initially not running
- Running after start
- Not running after stop
- Callback called on animation frame
- Delta time passed to callback
- First frame has 0 delta time
- Callback stops after stop()
- Multiple start calls handled
- Stop when not running handled
