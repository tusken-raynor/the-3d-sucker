import type { Vec4 } from '@/js/math/index.ts';
import { vec4, clamp } from '@/js/math/index.ts';

export type WrapMode = 'repeat' | 'clamp';

export interface Texture {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export function loadTexture(image: HTMLImageElement): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context for texture loading');
  }

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);

  return {
    width: image.width,
    height: image.height,
    data: imageData.data,
  };
}

export function createSolidTexture(color: Vec4, size: number = 1): Texture {
  const data = new Uint8ClampedArray(size * size * 4);
  const r = Math.round(color.x * 255);
  const g = Math.round(color.y * 255);
  const b = Math.round(color.z * 255);
  const a = Math.round(color.w * 255);

  for (let i = 0; i < size * size; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = a;
  }

  return { width: size, height: size, data };
}

function wrapCoordinate(value: number, wrapMode: WrapMode): number {
  if (wrapMode === 'clamp') {
    return clamp(value, 0, 1);
  }
  // repeat mode
  let wrapped = value % 1;
  if (wrapped < 0) wrapped += 1;
  return wrapped;
}

export function sampleTexture(
  texture: Texture,
  u: number,
  v: number,
  wrapMode: WrapMode = 'repeat'
): Vec4 {
  const { width, height, data } = texture;

  // Apply wrap mode
  const wrappedU = wrapCoordinate(u, wrapMode);
  const wrappedV = wrapCoordinate(v, wrapMode);

  // Convert to pixel coordinates (nearest neighbor)
  // Note: V is flipped because image Y goes down but UV Y goes up
  const px = Math.floor(wrappedU * (width - 1));
  const py = Math.floor((1 - wrappedV) * (height - 1));

  const clampedX = clamp(px, 0, width - 1);
  const clampedY = clamp(py, 0, height - 1);

  const index = (clampedY * width + clampedX) * 4;

  return vec4(
    data[index] / 255,
    data[index + 1] / 255,
    data[index + 2] / 255,
    data[index + 3] / 255
  );
}
