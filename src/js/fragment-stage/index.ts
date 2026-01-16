import type { Vec3, Vec4 } from '@/js/math/index.ts';
import { vec4, vec3Normalize, vec3Dot } from '@/js/math/index.ts';
import type { Texture } from '@/js/texture-loader/index.ts';
import { sampleTexture } from '@/js/texture-loader/index.ts';
import type { Fragment } from '@/js/rasterizer/index.ts';

export interface Light {
  direction: Vec3;
  color: Vec3;
  intensity: number;
}

export function shadeFragment(
  fragment: Fragment,
  texture: Texture | null,
  light: Light
): Vec4 {
  // Sample texture or use white
  let baseColor: Vec4;
  if (texture) {
    baseColor = sampleTexture(texture, fragment.uv.x, fragment.uv.y, 'repeat');
  } else {
    baseColor = vec4(1, 1, 1, 1);
  }

  // Diffuse lighting calculation
  const normal = vec3Normalize(fragment.normal);
  const diffuseFactor = Math.max(0, vec3Dot(normal, light.direction));

  // Combine ambient and diffuse
  const ambient = 0.2;
  const diffuse = diffuseFactor * light.intensity;
  const brightness = ambient + diffuse * 0.8;

  // Apply lighting to texture color
  return vec4(
    baseColor.x * brightness * light.color.x,
    baseColor.y * brightness * light.color.y,
    baseColor.z * brightness * light.color.z,
    baseColor.w
  );
}

export function createDefaultLight(): Light {
  return {
    direction: vec3Normalize({ x: 0.5, y: 1, z: 0.8 }),
    color: { x: 1, y: 1, z: 1 },
    intensity: 1,
  };
}
