import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createInputState,
  createInputHandler,
  type InputCallbacks,
} from './index.ts';

describe('createInputState', () => {
  it('should create initial state with dragging false', () => {
    const state = createInputState();
    expect(state.isDragging).toBe(false);
  });

  it('should create initial state with lastX and lastY at 0', () => {
    const state = createInputState();
    expect(state.lastX).toBe(0);
    expect(state.lastY).toBe(0);
  });
});

describe('createInputHandler', () => {
  let element: HTMLElement;
  let callbacks: InputCallbacks;
  let cleanup: () => void;

  beforeEach(() => {
    element = document.createElement('div');
    callbacks = {
      onOrbit: vi.fn(),
      onZoom: vi.fn(),
    };
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
    }
  });

  it('should return state and cleanup function', () => {
    const result = createInputHandler(element, callbacks);
    cleanup = result.cleanup;

    expect(result.state).toBeDefined();
    expect(result.cleanup).toBeInstanceOf(Function);
  });

  it('should start dragging on mousedown', () => {
    const result = createInputHandler(element, callbacks);
    cleanup = result.cleanup;

    const event = new MouseEvent('mousedown', {
      button: 0,
      clientX: 100,
      clientY: 200,
    });
    element.dispatchEvent(event);

    expect(result.state.isDragging).toBe(true);
    expect(result.state.lastX).toBe(100);
    expect(result.state.lastY).toBe(200);
  });

  it('should not start dragging on right click', () => {
    const result = createInputHandler(element, callbacks);
    cleanup = result.cleanup;

    const event = new MouseEvent('mousedown', {
      button: 2,
      clientX: 100,
      clientY: 200,
    });
    element.dispatchEvent(event);

    expect(result.state.isDragging).toBe(false);
  });

  it('should stop dragging on mouseup', () => {
    const result = createInputHandler(element, callbacks);
    cleanup = result.cleanup;

    element.dispatchEvent(
      new MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0 })
    );
    expect(result.state.isDragging).toBe(true);

    element.dispatchEvent(new MouseEvent('mouseup'));
    expect(result.state.isDragging).toBe(false);
  });

  it('should stop dragging on mouseleave', () => {
    const result = createInputHandler(element, callbacks);
    cleanup = result.cleanup;

    element.dispatchEvent(
      new MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0 })
    );
    expect(result.state.isDragging).toBe(true);

    element.dispatchEvent(new MouseEvent('mouseleave'));
    expect(result.state.isDragging).toBe(false);
  });

  it('should call onOrbit during drag', () => {
    const result = createInputHandler(element, callbacks);
    cleanup = result.cleanup;

    element.dispatchEvent(
      new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100 })
    );
    element.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 110, clientY: 120 })
    );

    expect(callbacks.onOrbit).toHaveBeenCalled();
  });

  it('should not call onOrbit when not dragging', () => {
    const result = createInputHandler(element, callbacks);
    cleanup = result.cleanup;

    element.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 110, clientY: 120 })
    );

    expect(callbacks.onOrbit).not.toHaveBeenCalled();
  });

  it('should calculate delta correctly for orbit', () => {
    const result = createInputHandler(element, callbacks, 1); // sensitivity = 1 for easy testing
    cleanup = result.cleanup;

    element.dispatchEvent(
      new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100 })
    );
    element.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 110, clientY: 120 })
    );

    expect(callbacks.onOrbit).toHaveBeenCalledWith(10, 20);
  });

  it('should apply sensitivity to orbit deltas', () => {
    const result = createInputHandler(element, callbacks, 0.01);
    cleanup = result.cleanup;

    element.dispatchEvent(
      new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100 })
    );
    element.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 200, clientY: 200 })
    );

    expect(callbacks.onOrbit).toHaveBeenCalledWith(1, 1);
  });

  it('should call onZoom on wheel event', () => {
    const result = createInputHandler(element, callbacks);
    cleanup = result.cleanup;

    const wheelEvent = new WheelEvent('wheel', { deltaY: 100 });
    element.dispatchEvent(wheelEvent);

    expect(callbacks.onZoom).toHaveBeenCalled();
  });

  it('should apply zoom sensitivity', () => {
    const result = createInputHandler(element, callbacks);
    cleanup = result.cleanup;

    const wheelEvent = new WheelEvent('wheel', { deltaY: 100 });
    element.dispatchEvent(wheelEvent);

    expect(callbacks.onZoom).toHaveBeenCalledWith(1); // 100 * 0.01
  });

  it('should update lastX and lastY during drag', () => {
    const result = createInputHandler(element, callbacks);
    cleanup = result.cleanup;

    element.dispatchEvent(
      new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100 })
    );
    element.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 150, clientY: 180 })
    );

    expect(result.state.lastX).toBe(150);
    expect(result.state.lastY).toBe(180);
  });

  it('should remove event listeners on cleanup', () => {
    const result = createInputHandler(element, callbacks);

    const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');
    result.cleanup();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(5);
  });
});
