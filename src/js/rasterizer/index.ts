import type { Vec2, Vec3, Vec4 } from '@/js/math/index.ts';
import { vec2, vec3 } from '@/js/math/index.ts';

export interface ClipVertex {
  position: Vec4;
  uv: Vec2;
  normal: Vec3;
  worldPosition: Vec3;
}

export interface Fragment {
  x: number;
  y: number;
  depth: number;
  uv: Vec2;
  normal: Vec3;
  worldPosition: Vec3;
}

function edgeFunction(a: Vec2, b: Vec2, c: Vec2): number {
  return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
}

function clipTriangleToNearPlane(
  v0: ClipVertex,
  v1: ClipVertex,
  v2: ClipVertex,
  nearPlane: number
): ClipVertex[][] {
  const vertices = [v0, v1, v2];
  const inside: ClipVertex[] = [];
  const outside: ClipVertex[] = [];

  for (const v of vertices) {
    if (v.position.z >= -v.position.w * nearPlane) {
      inside.push(v);
    } else {
      outside.push(v);
    }
  }

  if (inside.length === 3) {
    return [[v0, v1, v2]];
  }

  if (inside.length === 0) {
    return [];
  }

  if (inside.length === 1) {
    const i = inside[0];
    const o1 = outside[0];
    const o2 = outside[1];

    const t1 = clipEdge(i, o1, nearPlane);
    const t2 = clipEdge(i, o2, nearPlane);

    return [[i, t1, t2]];
  }

  // inside.length === 2
  const i1 = inside[0];
  const i2 = inside[1];
  const o = outside[0];

  const t1 = clipEdge(i1, o, nearPlane);
  const t2 = clipEdge(i2, o, nearPlane);

  return [
    [i1, i2, t1],
    [i2, t2, t1],
  ];
}

function clipEdge(
  inside: ClipVertex,
  outside: ClipVertex,
  nearPlane: number
): ClipVertex {
  const d1 = inside.position.z + inside.position.w * nearPlane;
  const d2 = outside.position.z + outside.position.w * nearPlane;
  const t = d1 / (d1 - d2);

  return {
    position: {
      x: inside.position.x + t * (outside.position.x - inside.position.x),
      y: inside.position.y + t * (outside.position.y - inside.position.y),
      z: inside.position.z + t * (outside.position.z - inside.position.z),
      w: inside.position.w + t * (outside.position.w - inside.position.w),
    },
    uv: {
      x: inside.uv.x + t * (outside.uv.x - inside.uv.x),
      y: inside.uv.y + t * (outside.uv.y - inside.uv.y),
    },
    normal: {
      x: inside.normal.x + t * (outside.normal.x - inside.normal.x),
      y: inside.normal.y + t * (outside.normal.y - inside.normal.y),
      z: inside.normal.z + t * (outside.normal.z - inside.normal.z),
    },
    worldPosition: {
      x:
        inside.worldPosition.x +
        t * (outside.worldPosition.x - inside.worldPosition.x),
      y:
        inside.worldPosition.y +
        t * (outside.worldPosition.y - inside.worldPosition.y),
      z:
        inside.worldPosition.z +
        t * (outside.worldPosition.z - inside.worldPosition.z),
    },
  };
}

export function rasterizeTriangle(
  v0: ClipVertex,
  v1: ClipVertex,
  v2: ClipVertex,
  viewportWidth: number,
  viewportHeight: number,
  cullBackFaces: boolean
): Fragment[] {
  const fragments: Fragment[] = [];

  // Near plane clipping
  const clippedTriangles = clipTriangleToNearPlane(v0, v1, v2, 1.0);

  for (const [cv0, cv1, cv2] of clippedTriangles) {
    rasterizeClippedTriangle(
      cv0,
      cv1,
      cv2,
      viewportWidth,
      viewportHeight,
      cullBackFaces,
      fragments
    );
  }

  return fragments;
}

function rasterizeClippedTriangle(
  v0: ClipVertex,
  v1: ClipVertex,
  v2: ClipVertex,
  viewportWidth: number,
  viewportHeight: number,
  cullBackFaces: boolean,
  fragments: Fragment[]
): void {
  // Perspective divide to get NDC coordinates
  const w0 = v0.position.w;
  const w1 = v1.position.w;
  const w2 = v2.position.w;

  if (w0 <= 0 || w1 <= 0 || w2 <= 0) {
    return;
  }

  const ndc0 = {
    x: v0.position.x / w0,
    y: v0.position.y / w0,
    z: v0.position.z / w0,
  };
  const ndc1 = {
    x: v1.position.x / w1,
    y: v1.position.y / w1,
    z: v1.position.z / w1,
  };
  const ndc2 = {
    x: v2.position.x / w2,
    y: v2.position.y / w2,
    z: v2.position.z / w2,
  };

  // Convert NDC to screen coordinates
  // NDC x,y are in [-1, 1], map to [0, width] and [0, height]
  // Note: Y is flipped (NDC y+ is up, screen y+ is down)
  const halfWidth = viewportWidth / 2;
  const halfHeight = viewportHeight / 2;

  const screen0 = vec2((ndc0.x + 1) * halfWidth, (1 - ndc0.y) * halfHeight);
  const screen1 = vec2((ndc1.x + 1) * halfWidth, (1 - ndc1.y) * halfHeight);
  const screen2 = vec2((ndc2.x + 1) * halfWidth, (1 - ndc2.y) * halfHeight);

  // Compute triangle area using edge function
  const area = edgeFunction(screen0, screen1, screen2);

  // Back-face culling: negative area means back-facing
  if (cullBackFaces && area <= 0) {
    return;
  }

  // Skip degenerate triangles
  if (Math.abs(area) < 0.5) {
    return;
  }

  // Compute bounding box
  const minX = Math.max(
    0,
    Math.floor(Math.min(screen0.x, screen1.x, screen2.x))
  );
  const maxX = Math.min(
    viewportWidth - 1,
    Math.ceil(Math.max(screen0.x, screen1.x, screen2.x))
  );
  const minY = Math.max(
    0,
    Math.floor(Math.min(screen0.y, screen1.y, screen2.y))
  );
  const maxY = Math.min(
    viewportHeight - 1,
    Math.ceil(Math.max(screen0.y, screen1.y, screen2.y))
  );

  // Precompute 1/w for perspective-correct interpolation
  const invW0 = 1 / w0;
  const invW1 = 1 / w1;
  const invW2 = 1 / w2;

  // Rasterize
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const p = vec2(x + 0.5, y + 0.5);

      // Compute barycentric coordinates
      const w0b = edgeFunction(screen1, screen2, p);
      const w1b = edgeFunction(screen2, screen0, p);
      const w2b = edgeFunction(screen0, screen1, p);

      // Check if point is inside triangle
      if (area > 0) {
        if (w0b < 0 || w1b < 0 || w2b < 0) continue;
      } else {
        if (w0b > 0 || w1b > 0 || w2b > 0) continue;
      }

      // Normalize barycentric coordinates
      const invArea = 1 / area;
      const b0 = w0b * invArea;
      const b1 = w1b * invArea;
      const b2 = w2b * invArea;

      // Perspective-correct interpolation
      const perspCorrect = 1 / (b0 * invW0 + b1 * invW1 + b2 * invW2);

      // Interpolate depth (screen-space is fine for depth)
      const depth = b0 * ndc0.z + b1 * ndc1.z + b2 * ndc2.z;

      // Perspective-correct UV interpolation
      const uv = vec2(
        (b0 * v0.uv.x * invW0 + b1 * v1.uv.x * invW1 + b2 * v2.uv.x * invW2) *
          perspCorrect,
        (b0 * v0.uv.y * invW0 + b1 * v1.uv.y * invW1 + b2 * v2.uv.y * invW2) *
          perspCorrect
      );

      // Perspective-correct normal interpolation
      const normal = vec3(
        (b0 * v0.normal.x * invW0 +
          b1 * v1.normal.x * invW1 +
          b2 * v2.normal.x * invW2) *
          perspCorrect,
        (b0 * v0.normal.y * invW0 +
          b1 * v1.normal.y * invW1 +
          b2 * v2.normal.y * invW2) *
          perspCorrect,
        (b0 * v0.normal.z * invW0 +
          b1 * v1.normal.z * invW1 +
          b2 * v2.normal.z * invW2) *
          perspCorrect
      );

      // Perspective-correct world position interpolation
      const worldPosition = vec3(
        (b0 * v0.worldPosition.x * invW0 +
          b1 * v1.worldPosition.x * invW1 +
          b2 * v2.worldPosition.x * invW2) *
          perspCorrect,
        (b0 * v0.worldPosition.y * invW0 +
          b1 * v1.worldPosition.y * invW1 +
          b2 * v2.worldPosition.y * invW2) *
          perspCorrect,
        (b0 * v0.worldPosition.z * invW0 +
          b1 * v1.worldPosition.z * invW1 +
          b2 * v2.worldPosition.z * invW2) *
          perspCorrect
      );

      fragments.push({
        x,
        y,
        depth,
        uv,
        normal,
        worldPosition,
      });
    }
  }
}
