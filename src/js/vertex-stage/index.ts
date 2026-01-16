import type { Vec2, Vec3, Vec4, Mat4 } from '@/js/math/index.ts';
import { mat4TransformVec4, vec4 } from '@/js/math/index.ts';

export interface Vertex {
  position: Vec3;
  uv: Vec2;
  normal: Vec3;
}

export interface ClipVertex {
  position: Vec4;
  uv: Vec2;
  normal: Vec3;
  worldPosition: Vec3;
}

export function transformVertex(
  vertex: Vertex,
  mvp: Mat4,
  modelMatrix: Mat4
): ClipVertex {
  // Transform to clip space
  const position = mat4TransformVec4(
    mvp,
    vec4(vertex.position.x, vertex.position.y, vertex.position.z, 1)
  );

  // Transform position to world space (for lighting calculations)
  const worldPos = mat4TransformVec4(
    modelMatrix,
    vec4(vertex.position.x, vertex.position.y, vertex.position.z, 1)
  );

  // Transform normal to world space (using model matrix)
  // Note: For proper normal transformation, we should use the inverse transpose
  // of the model matrix, but for uniform scaling this approximation works
  const transformedNormal = mat4TransformVec4(
    modelMatrix,
    vec4(vertex.normal.x, vertex.normal.y, vertex.normal.z, 0)
  );

  return {
    position,
    uv: vertex.uv,
    normal: {
      x: transformedNormal.x,
      y: transformedNormal.y,
      z: transformedNormal.z,
    },
    worldPosition: {
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
    },
  };
}
