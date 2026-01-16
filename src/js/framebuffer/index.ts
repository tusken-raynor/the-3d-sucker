import type { Vec4 } from '@/js/math/index.ts';

export interface Framebuffer {
  width: number;
  height: number;
  colorBuffer: Uint8ClampedArray;
  depthBuffer: Float32Array;
}

export function createFramebuffer(width: number, height: number): Framebuffer {
  const pixelCount = width * height;
  return {
    width,
    height,
    colorBuffer: new Uint8ClampedArray(pixelCount * 4),
    depthBuffer: new Float32Array(pixelCount).fill(Infinity),
  };
}

export function clearFramebuffer(fb: Framebuffer, clearColor: Vec4): void {
  const { colorBuffer, depthBuffer, width, height } = fb;
  const pixelCount = width * height;

  const r = Math.round(clearColor.x * 255);
  const g = Math.round(clearColor.y * 255);
  const b = Math.round(clearColor.z * 255);
  const a = Math.round(clearColor.w * 255);

  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    colorBuffer[idx] = r;
    colorBuffer[idx + 1] = g;
    colorBuffer[idx + 2] = b;
    colorBuffer[idx + 3] = a;
    depthBuffer[i] = Infinity;
  }
}

export function setPixel(
  fb: Framebuffer,
  x: number,
  y: number,
  color: Vec4,
  depth: number
): boolean {
  const { width, height, colorBuffer, depthBuffer } = fb;

  const ix = Math.floor(x);
  const iy = Math.floor(y);

  if (ix < 0 || ix >= width || iy < 0 || iy >= height) {
    return false;
  }

  const pixelIndex = iy * width + ix;

  if (depth >= depthBuffer[pixelIndex]) {
    return false;
  }

  depthBuffer[pixelIndex] = depth;

  const colorIndex = pixelIndex * 4;
  colorBuffer[colorIndex] = Math.round(color.x * 255);
  colorBuffer[colorIndex + 1] = Math.round(color.y * 255);
  colorBuffer[colorIndex + 2] = Math.round(color.z * 255);
  colorBuffer[colorIndex + 3] = Math.round(color.w * 255);

  return true;
}

export function getImageData(fb: Framebuffer): ImageData {
  // Create a copy to ensure we have a proper ArrayBuffer (not SharedArrayBuffer)
  const data = new Uint8ClampedArray(fb.colorBuffer);
  return new ImageData(data, fb.width, fb.height);
}
