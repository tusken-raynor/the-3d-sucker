import './style.css';
import { createFramebuffer, getImageData } from '@/js/framebuffer/index.ts';
import {
  createScene,
  renderScene,
  setSceneModel,
  setSceneTexture,
  setSceneCamera,
} from '@/js/scene-manager/index.ts';
import { createRenderLoop } from '@/js/render-loop/index.ts';
import { createInputHandler } from '@/js/input-handler/index.ts';
import { cameraOrbit, cameraZoom } from '@/js/camera/index.ts';
import { parseOBJ, normalizeModel } from '@/js/model-parser/index.ts';
import { loadTexture } from '@/js/texture-loader/index.ts';
import { errorHandler } from '@/js/error-handler/index.ts';

const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;
const MIN_WIDTH = 200;
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;
const RESIZE_DEBOUNCE_MS = 50;

function setStatus(
  message: string,
  type: 'info' | 'loading' | 'error' | 'success' = 'info'
): void {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = 'controls__status';

  if (type !== 'info') {
    statusEl.classList.add(`controls__status--${type}`);
  }
}

function init(): void {
  const canvas = document.getElementById('render-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get 2D context');
    return;
  }

  let framebuffer = createFramebuffer(BASE_WIDTH, BASE_HEIGHT);
  let scene = createScene();

  // Calculate canvas dimensions based on displayed size
  function getCanvasDimensions(): { width: number; height: number } {
    const displayedWidth = canvas.clientWidth;
    const width = Math.max(MIN_WIDTH, Math.min(BASE_WIDTH, displayedWidth));
    const height = Math.round(width / ASPECT_RATIO);
    return { width, height };
  }

  // Update canvas and framebuffer dimensions
  function updateCanvasSize(): void {
    const { width, height } = getCanvasDimensions();

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      framebuffer = createFramebuffer(width, height);
    }
  }

  // Set initial size
  updateCanvasSize();

  // Debounced resize handler to avoid excessive framebuffer recreations
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  function debouncedUpdateCanvasSize(): void {
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      updateCanvasSize();
      resizeTimeout = null;
    }, RESIZE_DEBOUNCE_MS);
  }

  // Observe canvas size changes
  const resizeObserver = new ResizeObserver(() => {
    debouncedUpdateCanvasSize();
  });
  resizeObserver.observe(canvas);


  // Set up input handling for camera controls
  const { cleanup: cleanupInput } = createInputHandler(canvas, {
    onOrbit: (deltaYaw, deltaPitch) => {
      scene = setSceneCamera(
        scene,
        cameraOrbit(scene.camera, deltaYaw, deltaPitch)
      );
    },
    onZoom: (delta) => {
      scene = setSceneCamera(scene, cameraZoom(scene.camera, delta));
    },
  });

  // Set up file inputs
  const objInput = document.getElementById('obj-input') as HTMLInputElement;
  const textureInput = document.getElementById(
    'texture-input'
  ) as HTMLInputElement;

  if (objInput) {
    objInput.addEventListener('change', async (e) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;

      setStatus('Loading model...', 'loading');

      try {
        const text = await file.text();
        const model = parseOBJ(text);
        const normalized = normalizeModel(model);
        scene = setSceneModel(scene, normalized);
        setStatus(
          `Loaded: ${file.name} (${normalized.triangles.length} triangles)`,
          'success'
        );
      } catch (error) {
        const appError = errorHandler.handle(error);
        const message = errorHandler.getUserMessage(appError);
        setStatus(message, 'error');
      }

      input.value = '';
    });
  }

  if (textureInput) {
    textureInput.addEventListener('change', async (e) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;

      setStatus('Loading texture...', 'loading');

      try {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
        });

        const texture = loadTexture(img);
        scene = setSceneTexture(scene, texture);
        setStatus(
          `Loaded texture: ${file.name} (${texture.width}x${texture.height})`,
          'success'
        );

        URL.revokeObjectURL(img.src);
      } catch (error) {
        const appError = errorHandler.handle(error);
        const message = errorHandler.getUserMessage(appError);
        setStatus(message, 'error');
      }

      input.value = '';
    });
  }

  // Render loop
  const loop = createRenderLoop(() => {
    renderScene(scene, framebuffer);
    const imageData = getImageData(framebuffer);
    ctx.putImageData(imageData, 0, 0);
  });

  loop.start();
  setStatus('Drag to orbit, scroll to zoom. Load an OBJ file to view.', 'info');

  // Cleanup on page unload
  window.addEventListener('unload', () => {
    loop.stop();
    cleanupInput();
    resizeObserver.disconnect();
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout);
    }
  });
}

init();
