import type { Vec2, Vec3 } from '@/js/math/index.ts';
import {
  vec2,
  vec3,
  vec3Sub,
  vec3Cross,
  vec3Normalize,
} from '@/js/math/index.ts';
import { ParseError } from '@/js/errors/index.ts';

export interface Vertex {
  position: Vec3;
  uv: Vec2;
  normal: Vec3;
}

export interface Triangle {
  v0: Vertex;
  v1: Vertex;
  v2: Vertex;
}

export interface Model {
  triangles: Triangle[];
  boundingBox: { min: Vec3; max: Vec3 };
  center: Vec3;
}

interface FaceVertex {
  positionIndex: number;
  uvIndex: number;
  normalIndex: number;
}

function parseFaceVertex(part: string): FaceVertex {
  const indices = part.split('/');
  return {
    positionIndex: parseInt(indices[0], 10) - 1,
    uvIndex: indices[1] ? parseInt(indices[1], 10) - 1 : -1,
    normalIndex: indices[2] ? parseInt(indices[2], 10) - 1 : -1,
  };
}

function computeNormal(p0: Vec3, p1: Vec3, p2: Vec3): Vec3 {
  const edge1 = vec3Sub(p1, p0);
  const edge2 = vec3Sub(p2, p0);
  return vec3Normalize(vec3Cross(edge1, edge2));
}

export function parseOBJ(objText: string): Model {
  const positions: Vec3[] = [];
  const uvs: Vec2[] = [];
  const normals: Vec3[] = [];
  const triangles: Triangle[] = [];

  const lines = objText.split('\n');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum].trim();

    if (line === '' || line.startsWith('#')) {
      continue;
    }

    const parts = line.split(/\s+/);
    const command = parts[0];

    switch (command) {
      case 'v': {
        if (parts.length < 4) {
          throw new ParseError('Invalid vertex position', {
            line: lineNum + 1,
          });
        }
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
        if (isNaN(x) || isNaN(y) || isNaN(z)) {
          throw new ParseError('Invalid vertex coordinates', {
            line: lineNum + 1,
          });
        }
        positions.push(vec3(x, y, z));
        break;
      }

      case 'vt': {
        if (parts.length < 3) {
          throw new ParseError('Invalid texture coordinate', {
            line: lineNum + 1,
          });
        }
        const u = parseFloat(parts[1]);
        const v = parseFloat(parts[2]);
        if (isNaN(u) || isNaN(v)) {
          throw new ParseError('Invalid texture coordinates', {
            line: lineNum + 1,
          });
        }
        uvs.push(vec2(u, v));
        break;
      }

      case 'vn': {
        if (parts.length < 4) {
          throw new ParseError('Invalid vertex normal', { line: lineNum + 1 });
        }
        const nx = parseFloat(parts[1]);
        const ny = parseFloat(parts[2]);
        const nz = parseFloat(parts[3]);
        if (isNaN(nx) || isNaN(ny) || isNaN(nz)) {
          throw new ParseError('Invalid normal coordinates', {
            line: lineNum + 1,
          });
        }
        normals.push(vec3Normalize(vec3(nx, ny, nz)));
        break;
      }

      case 'f': {
        if (parts.length < 4) {
          throw new ParseError('Face must have at least 3 vertices', {
            line: lineNum + 1,
          });
        }

        // Parse face vertices
        const faceVertices: FaceVertex[] = [];
        for (let i = 1; i < parts.length; i++) {
          faceVertices.push(parseFaceVertex(parts[i]));
        }

        // Triangulate (fan triangulation for quads and polygons)
        for (let i = 1; i < faceVertices.length - 1; i++) {
          const fv0 = faceVertices[0];
          const fv1 = faceVertices[i];
          const fv2 = faceVertices[i + 1];

          const p0 = positions[fv0.positionIndex];
          const p1 = positions[fv1.positionIndex];
          const p2 = positions[fv2.positionIndex];

          if (!p0 || !p1 || !p2) {
            throw new ParseError('Invalid position index', {
              line: lineNum + 1,
            });
          }

          // Get UVs (default to 0,0 if not provided)
          const uv0 = fv0.uvIndex >= 0 ? uvs[fv0.uvIndex] : vec2(0, 0);
          const uv1 = fv1.uvIndex >= 0 ? uvs[fv1.uvIndex] : vec2(0, 0);
          const uv2 = fv2.uvIndex >= 0 ? uvs[fv2.uvIndex] : vec2(0, 0);

          // Get normals (compute if not provided)
          const computedNormal = computeNormal(p0, p1, p2);
          const n0 =
            fv0.normalIndex >= 0 ? normals[fv0.normalIndex] : computedNormal;
          const n1 =
            fv1.normalIndex >= 0 ? normals[fv1.normalIndex] : computedNormal;
          const n2 =
            fv2.normalIndex >= 0 ? normals[fv2.normalIndex] : computedNormal;

          triangles.push({
            v0: {
              position: p0,
              uv: uv0 ?? vec2(0, 0),
              normal: n0 ?? computedNormal,
            },
            v1: {
              position: p1,
              uv: uv1 ?? vec2(0, 0),
              normal: n1 ?? computedNormal,
            },
            v2: {
              position: p2,
              uv: uv2 ?? vec2(0, 0),
              normal: n2 ?? computedNormal,
            },
          });
        }
        break;
      }

      // Ignore unsupported commands (mtllib, usemtl, g, o, s, etc.)
      default:
        break;
    }
  }

  if (triangles.length === 0) {
    throw new ParseError('No faces found in OBJ file', {});
  }

  // Compute bounding box
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  for (const pos of positions) {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    minZ = Math.min(minZ, pos.z);
    maxX = Math.max(maxX, pos.x);
    maxY = Math.max(maxY, pos.y);
    maxZ = Math.max(maxZ, pos.z);
  }

  const boundingBox = {
    min: vec3(minX, minY, minZ),
    max: vec3(maxX, maxY, maxZ),
  };

  const center = vec3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);

  return { triangles, boundingBox, center };
}

export function normalizeModel(model: Model): Model {
  const { boundingBox, center, triangles } = model;
  const size = vec3(
    boundingBox.max.x - boundingBox.min.x,
    boundingBox.max.y - boundingBox.min.y,
    boundingBox.max.z - boundingBox.min.z
  );
  const maxDimension = Math.max(size.x, size.y, size.z);
  const scale = maxDimension > 0 ? 1 / maxDimension : 1;

  const normalizedTriangles = triangles.map((tri) => ({
    v0: {
      position: vec3(
        (tri.v0.position.x - center.x) * scale,
        (tri.v0.position.y - center.y) * scale,
        (tri.v0.position.z - center.z) * scale
      ),
      uv: tri.v0.uv,
      normal: tri.v0.normal,
    },
    v1: {
      position: vec3(
        (tri.v1.position.x - center.x) * scale,
        (tri.v1.position.y - center.y) * scale,
        (tri.v1.position.z - center.z) * scale
      ),
      uv: tri.v1.uv,
      normal: tri.v1.normal,
    },
    v2: {
      position: vec3(
        (tri.v2.position.x - center.x) * scale,
        (tri.v2.position.y - center.y) * scale,
        (tri.v2.position.z - center.z) * scale
      ),
      uv: tri.v2.uv,
      normal: tri.v2.normal,
    },
  }));

  // New bounding box after normalization
  const halfScale = 0.5;
  const newBoundingBox = {
    min: vec3(-halfScale, -halfScale, -halfScale),
    max: vec3(halfScale, halfScale, halfScale),
  };

  return {
    triangles: normalizedTriangles,
    boundingBox: newBoundingBox,
    center: vec3(0, 0, 0),
  };
}
