import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRenderLoop } from './index.ts';

interface TriggerGlobal {
  triggerAnimationFrame: (time: number) => void;
}

describe('createRenderLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    let frameId = 0;
    const callbacks: Map<number, FrameRequestCallback> = new Map();

    vi.stubGlobal(
      'requestAnimationFrame',
      (callback: FrameRequestCallback): number => {
        const id = ++frameId;
        callbacks.set(id, callback);
        return id;
      }
    );

    vi.stubGlobal('cancelAnimationFrame', (id: number): void => {
      callbacks.delete(id);
    });

    // Helper to trigger animation frames
    (globalThis as unknown as TriggerGlobal).triggerAnimationFrame = (
      time: number
    ) => {
      const cbs = Array.from(callbacks.entries());
      callbacks.clear();
      for (const [, cb] of cbs) {
        cb(time);
      }
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should create a render loop', () => {
    const callback = vi.fn();
    const loop = createRenderLoop(callback);

    expect(loop).toBeDefined();
    expect(loop.start).toBeDefined();
    expect(loop.stop).toBeDefined();
    expect(loop.isRunning).toBeDefined();
  });

  it('should not be running initially', () => {
    const callback = vi.fn();
    const loop = createRenderLoop(callback);

    expect(loop.isRunning()).toBe(false);
  });

  it('should be running after start', () => {
    const callback = vi.fn();
    const loop = createRenderLoop(callback);

    loop.start();
    expect(loop.isRunning()).toBe(true);
  });

  it('should not be running after stop', () => {
    const callback = vi.fn();
    const loop = createRenderLoop(callback);

    loop.start();
    loop.stop();
    expect(loop.isRunning()).toBe(false);
  });

  it('should call callback on animation frame', () => {
    const callback = vi.fn();
    const loop = createRenderLoop(callback);

    loop.start();
    (globalThis as unknown as TriggerGlobal).triggerAnimationFrame(1000);

    expect(callback).toHaveBeenCalled();
  });

  it('should pass delta time to callback', () => {
    const callback = vi.fn();
    const loop = createRenderLoop(callback);

    loop.start();
    (globalThis as unknown as TriggerGlobal).triggerAnimationFrame(1000);
    (globalThis as unknown as TriggerGlobal).triggerAnimationFrame(1016);

    // Second call should have delta time of 16ms = 0.016s
    expect(callback).toHaveBeenCalledTimes(2);
    const secondCallDelta = callback.mock.calls[1][0];
    expect(secondCallDelta).toBeCloseTo(0.016, 3);
  });

  it('should pass 0 delta time on first frame', () => {
    const callback = vi.fn();
    const loop = createRenderLoop(callback);

    loop.start();
    (globalThis as unknown as TriggerGlobal).triggerAnimationFrame(1000);

    expect(callback).toHaveBeenCalledWith(0);
  });

  it('should stop calling callback after stop', () => {
    const callback = vi.fn();
    const loop = createRenderLoop(callback);

    loop.start();
    (globalThis as unknown as TriggerGlobal).triggerAnimationFrame(1000);
    loop.stop();
    (globalThis as unknown as TriggerGlobal).triggerAnimationFrame(1016);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple start calls', () => {
    const callback = vi.fn();
    const loop = createRenderLoop(callback);

    loop.start();
    loop.start(); // Should be ignored
    (globalThis as unknown as TriggerGlobal).triggerAnimationFrame(1000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle stop when not running', () => {
    const callback = vi.fn();
    const loop = createRenderLoop(callback);

    expect(() => loop.stop()).not.toThrow();
  });
});
