export interface RenderLoop {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

export type FrameCallback = (deltaTime: number) => void;

export function createRenderLoop(callback: FrameCallback): RenderLoop {
  let running = false;
  let lastTime = 0;
  let animationFrameId = 0;

  function frame(currentTime: number): void {
    if (!running) return;

    const deltaTime = lastTime === 0 ? 0 : (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    callback(deltaTime);

    animationFrameId = requestAnimationFrame(frame);
  }

  return {
    start(): void {
      if (running) return;
      running = true;
      lastTime = 0;
      animationFrameId = requestAnimationFrame(frame);
    },

    stop(): void {
      if (!running) return;
      running = false;
      cancelAnimationFrame(animationFrameId);
    },

    isRunning(): boolean {
      return running;
    },
  };
}
