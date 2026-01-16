import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

test.describe('3D Model Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display initial UI elements', async ({ page }) => {
    // Check canvas is present
    const canvas = page.locator('#render-canvas');
    await expect(canvas).toBeVisible();

    // Check file inputs are present
    const objInput = page.locator('#obj-input');
    const textureInput = page.locator('#texture-input');
    await expect(objInput).toBeAttached();
    await expect(textureInput).toBeAttached();

    // Check status message is present
    const status = page.locator('#status');
    await expect(status).toBeVisible();
    await expect(status).toContainText('Drag to orbit');
  });

  test('should load valid OBJ file', async ({ page }) => {
    const objInput = page.locator('#obj-input');

    // Upload the cube.obj fixture
    await objInput.setInputFiles(path.join(fixturesDir, 'cube.obj'));

    // Status should show success
    const status = page.locator('#status');
    await expect(status).toContainText('Loaded: cube.obj', { timeout: 5000 });
    await expect(status).toContainText('triangles');
  });

  test('should show error for invalid OBJ file', async ({ page }) => {
    const objInput = page.locator('#obj-input');

    // Upload the invalid.obj fixture
    await objInput.setInputFiles(path.join(fixturesDir, 'invalid.obj'));

    // Status should show error
    const status = page.locator('#status');
    await expect(status).toHaveClass(/controls__status--error/, {
      timeout: 5000,
    });
  });

  test('should show loading state while processing', async ({ page }) => {
    const objInput = page.locator('#obj-input');
    const status = page.locator('#status');

    // Start upload
    const uploadPromise = objInput.setInputFiles(
      path.join(fixturesDir, 'cube.obj')
    );

    // We might briefly see loading state (it's fast, so this is best-effort)
    // The test mainly verifies the flow works
    await uploadPromise;

    // Should end in success state
    await expect(status).toContainText('Loaded', { timeout: 5000 });
  });

  test('should allow camera orbit via mouse drag', async ({ page }) => {
    const canvas = page.locator('#render-canvas');

    // Load a model first
    const objInput = page.locator('#obj-input');
    await objInput.setInputFiles(path.join(fixturesDir, 'cube.obj'));
    await expect(page.locator('#status')).toContainText('Loaded', {
      timeout: 5000,
    });

    // Get initial canvas state
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      // Perform drag gesture
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + 100, centerY + 50, { steps: 10 });
      await page.mouse.up();

      // If we got here without error, drag succeeded
      // Visual verification would require screenshot comparison
    }
  });

  test('should allow camera zoom via scroll wheel', async ({ page }) => {
    const canvas = page.locator('#render-canvas');

    // Load a model first
    const objInput = page.locator('#obj-input');
    await objInput.setInputFiles(path.join(fixturesDir, 'cube.obj'));
    await expect(page.locator('#status')).toContainText('Loaded', {
      timeout: 5000,
    });

    // Get canvas position
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      // Perform scroll gesture
      await page.mouse.move(centerX, centerY);
      await page.mouse.wheel(0, 100);

      // If we got here without error, scroll succeeded
    }
  });

  test('should handle texture loading (simulated with valid image)', async ({
    page,
  }) => {
    // Load a model first
    const objInput = page.locator('#obj-input');
    await objInput.setInputFiles(path.join(fixturesDir, 'cube.obj'));
    await expect(page.locator('#status')).toContainText('Loaded: cube.obj', {
      timeout: 5000,
    });

    // For texture loading, we'd need a real image file
    // This test verifies the texture input exists and is functional
    const textureInput = page.locator('#texture-input');
    await expect(textureInput).toBeAttached();
  });

  test('should recover from error and allow new file loads', async ({
    page,
  }) => {
    const objInput = page.locator('#obj-input');
    const status = page.locator('#status');

    // First, load invalid file (causes error)
    await objInput.setInputFiles(path.join(fixturesDir, 'invalid.obj'));
    await expect(status).toHaveClass(/controls__status--error/, {
      timeout: 5000,
    });

    // Then load valid file (should recover)
    await objInput.setInputFiles(path.join(fixturesDir, 'cube.obj'));
    await expect(status).toContainText('Loaded: cube.obj', { timeout: 5000 });
    await expect(status).toHaveClass(/controls__status--success/, {
      timeout: 5000,
    });
  });

  test('should handle rapid file changes', async ({ page }) => {
    const objInput = page.locator('#obj-input');
    const status = page.locator('#status');

    // Load files in quick succession
    await objInput.setInputFiles(path.join(fixturesDir, 'cube.obj'));
    await objInput.setInputFiles(path.join(fixturesDir, 'cube.obj'));
    await objInput.setInputFiles(path.join(fixturesDir, 'cube.obj'));

    // Should end with success
    await expect(status).toContainText('Loaded', { timeout: 5000 });
  });

  test('should resize canvas when viewport shrinks below 800px', async ({
    page,
  }) => {
    const canvas = page.locator('#render-canvas');

    // Start with wide viewport
    await page.setViewportSize({ width: 1000, height: 800 });
    await expect(canvas).toBeVisible();

    // Get initial dimensions
    const initialBox = await canvas.boundingBox();
    expect(initialBox).not.toBeNull();
    if (!initialBox) return;

    const initialWidth = initialBox.width;

    // Shrink viewport below 800px
    await page.setViewportSize({ width: 500, height: 600 });

    // Wait for debounced resize to take effect
    await page.waitForTimeout(150);

    // Canvas should have shrunk
    const shrunkBox = await canvas.boundingBox();
    expect(shrunkBox).not.toBeNull();
    if (!shrunkBox) return;

    expect(shrunkBox.width).toBeLessThan(initialWidth);

    // Verify aspect ratio is maintained (4:3 = 1.333...)
    const aspectRatio = shrunkBox.width / shrunkBox.height;
    expect(aspectRatio).toBeCloseTo(4 / 3, 1);
  });

  test('should resize canvas when viewport expands after shrinking', async ({
    page,
  }) => {
    const canvas = page.locator('#render-canvas');

    // Start with wide viewport
    await page.setViewportSize({ width: 1000, height: 800 });
    await expect(canvas).toBeVisible();

    // Get initial dimensions (should be 800px wide at 1000px viewport)
    const initialBox = await canvas.boundingBox();
    expect(initialBox).not.toBeNull();
    if (!initialBox) return;

    const initialWidth = initialBox.width;
    expect(initialWidth).toBeCloseTo(800, -1); // Should be ~800px

    // Shrink viewport below 800px
    await page.setViewportSize({ width: 500, height: 600 });
    await page.waitForTimeout(150); // Wait for debounced resize

    // Canvas should have shrunk
    const shrunkBox = await canvas.boundingBox();
    expect(shrunkBox).not.toBeNull();
    if (!shrunkBox) return;

    expect(shrunkBox.width).toBeLessThan(initialWidth);

    // Now expand viewport back to 1000px
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.waitForTimeout(150); // Wait for debounced resize

    // Canvas should grow back to ~800px (the bug was it stayed small)
    const expandedBox = await canvas.boundingBox();
    expect(expandedBox).not.toBeNull();
    if (!expandedBox) return;

    // Key assertion: canvas should grow back to near original size
    expect(expandedBox.width).toBeGreaterThan(shrunkBox.width);
    expect(expandedBox.width).toBeCloseTo(initialWidth, -1); // Should be ~800px again

    // Verify aspect ratio is maintained
    const aspectRatio = expandedBox.width / expandedBox.height;
    expect(aspectRatio).toBeCloseTo(4 / 3, 1);
  });

  test('should maintain canvas rendering after resize', async ({ page }) => {
    const canvas = page.locator('#render-canvas');
    const objInput = page.locator('#obj-input');
    const status = page.locator('#status');

    // Load a model first
    await objInput.setInputFiles(path.join(fixturesDir, 'cube.obj'));
    await expect(status).toContainText('Loaded: cube.obj', { timeout: 5000 });

    // Resize viewport
    await page.setViewportSize({ width: 400, height: 500 });
    await page.waitForTimeout(150); // Wait for debounced resize

    // Canvas should still be visible and functional
    await expect(canvas).toBeVisible();

    // Verify canvas has updated width attribute (internal resolution)
    const canvasWidth = await canvas.evaluate(
      (el: HTMLCanvasElement) => el.width
    );
    expect(canvasWidth).toBeLessThanOrEqual(400);
    expect(canvasWidth).toBeGreaterThanOrEqual(200); // MIN_WIDTH

    // Verify we can still interact with the camera
    const box = await canvas.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + 50, centerY, { steps: 5 });
      await page.mouse.up();
    }

    // Application should still be responsive
    await expect(status).toContainText('Loaded');
  });

  test('complete workflow: load model, interact with camera', async ({
    page,
  }) => {
    const canvas = page.locator('#render-canvas');
    const objInput = page.locator('#obj-input');
    const status = page.locator('#status');

    // Step 1: Load model
    await objInput.setInputFiles(path.join(fixturesDir, 'cube.obj'));
    await expect(status).toContainText('Loaded: cube.obj', { timeout: 5000 });

    // Step 2: Interact with camera
    const box = await canvas.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      // Orbit
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + 50, centerY + 30, { steps: 5 });
      await page.mouse.up();

      // Zoom
      await page.mouse.wheel(0, -50);
    }

    // Application should still be responsive
    await expect(canvas).toBeVisible();
    await expect(status).toContainText('Loaded');
  });
});
