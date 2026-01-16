# Integration Tests

## Purpose

Integration tests verify that multiple modules work together correctly in the 3D renderer application.

## Test Files

### file-loading.test.ts

Tests the file loading workflow:

- [x] Load valid OBJ file and verify model is parsed correctly
- [x] Normalize model to unit scale
- [x] Handle OBJ with UVs and normals
- [x] Reject invalid OBJ gracefully
- [x] Reject empty OBJ files
- [x] Create and sample solid textures
- [x] Sample texture with repeat wrap mode
- [x] Sample texture with clamp wrap mode
- [x] Preserve UVs through normalization

### rendering-pipeline.test.ts

Tests the rendering pipeline integration:

- [x] Transform vertex through MVP matrix to clip space
- [x] Preserve world position from model matrix
- [x] Produce fragments for visible triangles
- [x] Interpolate UVs across fragments
- [x] Shade fragment with texture and lighting
- [x] Apply diffuse lighting based on normal
- [x] Write shaded fragments with depth testing
- [x] Reject pixels behind existing depth
- [x] Render triangle through complete pipeline

### scene-camera.test.ts

Tests camera and scene management integration:

- [x] Camera orbit updates yaw and pitch
- [x] Pitch is clamped to prevent gimbal lock
- [x] Orbit updates view matrix
- [x] Camera zoom updates distance
- [x] Zoom is clamped to min/max distance
- [x] Scene orchestrates model, texture, camera, and light
- [x] Scene renders with all components
- [x] Scene updates when camera changes
- [x] Scene handles model removal correctly

## Running Integration Tests

```bash
npm run test:integration
```
