# Texture Loader Module

## Purpose

Loads images into texture data and provides texture sampling for the fragment stage. Supports nearest-neighbor sampling with repeat and clamp wrap modes.

## How It Works

### Loading Process

1. Create an off-screen canvas at image dimensions
2. Draw the image to the canvas
3. Extract pixel data using `getImageData`
4. Store as RGBA Uint8ClampedArray

### Texture Sampling

1. Apply wrap mode to UV coordinates (repeat or clamp)
2. Convert UV to pixel coordinates (nearest neighbor)
3. Flip V coordinate (UV Y-up → Image Y-down)
4. Read RGBA values and normalize to 0-1 range

### UV Coordinate System

- UV (0,0) = bottom-left of image
- UV (1,1) = top-right of image
- V is flipped during sampling to match standard texture conventions

## I/O Interface

### Types

```typescript
type WrapMode = 'repeat' | 'clamp';

interface Texture {
  width: number;
  height: number;
  data: Uint8ClampedArray; // RGBA
}
```

### Functions

```typescript
loadTexture(image: HTMLImageElement): Texture
createSolidTexture(color: Vec4, size?: number): Texture
sampleTexture(texture: Texture, u: number, v: number, wrapMode?: WrapMode): Vec4
```

### Usage Example

```typescript
import { loadTexture, sampleTexture } from '@/js/texture-loader';

// Load from image element
const image = new Image();
image.onload = () => {
  const texture = loadTexture(image);

  // Sample at UV coordinates
  const color = sampleTexture(texture, fragment.uv.x, fragment.uv.y, 'repeat');
};
image.src = 'texture.png';

// Or create a solid color texture
const white = createSolidTexture(vec4(1, 1, 1, 1));
```

## Tests

Unit tests cover:

- Solid texture creation
- Larger solid texture dimensions
- Sampling corners (bottom-left, top-left, bottom-right)
- Repeat wrap mode
- Clamp wrap mode
- Negative UV coordinates
- Alpha channel preservation
