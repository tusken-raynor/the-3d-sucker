# Framebuffer Module

## Purpose

Manages the render target for the software renderer. Contains a color buffer (RGBA) and depth buffer (Z-buffer) for proper depth testing during rasterization.

## How It Works

The framebuffer stores:

1. **Color buffer**: Uint8ClampedArray with RGBA values (0-255)
2. **Depth buffer**: Float32Array with depth values (smaller = closer)

When writing pixels:

- Coordinates are floored to integer pixel positions
- Out-of-bounds pixels are rejected
- Depth test: only pixels closer than existing depth are written
- Color values are converted from 0-1 float to 0-255 integer

## I/O Interface

### Types

```typescript
interface Framebuffer {
  width: number;
  height: number;
  colorBuffer: Uint8ClampedArray; // RGBA, length = width * height * 4
  depthBuffer: Float32Array; // length = width * height
}
```

### Functions

```typescript
createFramebuffer(width: number, height: number): Framebuffer
clearFramebuffer(fb: Framebuffer, clearColor: Vec4): void
setPixel(fb: Framebuffer, x: number, y: number, color: Vec4, depth: number): boolean
getImageData(fb: Framebuffer): ImageData
```

### Usage Example

```typescript
import {
  createFramebuffer,
  clearFramebuffer,
  setPixel,
  getImageData,
} from '@/js/framebuffer';
import { vec4 } from '@/js/math';

const fb = createFramebuffer(800, 600);
clearFramebuffer(fb, vec4(0.1, 0.1, 0.1, 1)); // Dark gray background

// Draw a red pixel at (100, 200) with depth 0.5
setPixel(fb, 100, 200, vec4(1, 0, 0, 1), 0.5);

// Transfer to canvas
const imageData = getImageData(fb);
ctx.putImageData(imageData, 0, 0);
```

## Tests

Unit tests cover:

- Framebuffer creation with correct dimensions
- Color buffer allocation (4 bytes per pixel)
- Depth buffer allocation and initialization to Infinity
- Clear operation sets all pixels to specified color
- Clear operation resets depth buffer
- setPixel writes correct color values
- setPixel performs depth test (reject if behind)
- setPixel rejects out-of-bounds coordinates
- setPixel handles fractional coordinates
- getImageData creates proper ImageData object
