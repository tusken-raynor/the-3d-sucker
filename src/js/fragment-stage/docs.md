# Fragment Stage Module

## Purpose

Computes the final color for each fragment by combining texture sampling with diffuse lighting. This is the final stage of the rendering pipeline before pixels are written to the framebuffer.

## How It Works

### Shading Process

1. **Texture sampling**: Sample texture at fragment UV coordinates (or use white if no texture)
2. **Normal preparation**: Normalize the interpolated normal
3. **Diffuse calculation**: `max(0, dot(normal, lightDirection))`
4. **Final color**: `textureColor × (ambient + diffuse × intensity) × lightColor`

### Lighting Model

Uses a simple Lambertian (diffuse) lighting model:

- **Ambient**: Constant minimum light (0.2) to prevent completely black surfaces
- **Diffuse**: Brightness based on angle between surface normal and light direction
- **Light color**: Multiplied with surface color

## I/O Interface

### Types

```typescript
interface Light {
  direction: Vec3; // Normalized direction TO the light
  color: Vec3; // RGB color (0-1)
  intensity: number;
}
```

### Functions

```typescript
shadeFragment(fragment: Fragment, texture: Texture | null, light: Light): Vec4
createDefaultLight(): Light
```

### Usage Example

```typescript
import { shadeFragment, createDefaultLight } from '@/js/fragment-stage';

const light = createDefaultLight();

for (const fragment of fragments) {
  const color = shadeFragment(fragment, texture, light);
  setPixel(fb, fragment.x, fragment.y, color, fragment.depth);
}
```

## Tests

Unit tests cover:

- White output when no texture and facing light
- Texture color application
- Darker output when facing away from light
- Minimum ambient light preserved
- Light color applied to output
- Alpha channel preserved from texture
- Non-unit normals handled (normalized internally)
- Default light has normalized direction
- Default light has white color
- Default light has intensity of 1
