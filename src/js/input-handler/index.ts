export interface InputState {
  isDragging: boolean;
  lastX: number;
  lastY: number;
}

export interface InputCallbacks {
  onOrbit: (deltaYaw: number, deltaPitch: number) => void;
  onZoom: (delta: number) => void;
}

export function createInputState(): InputState {
  return {
    isDragging: false,
    lastX: 0,
    lastY: 0,
  };
}

export function createInputHandler(
  element: HTMLElement,
  callbacks: InputCallbacks,
  sensitivity: number = 0.005
): { state: InputState; cleanup: () => void } {
  const state = createInputState();

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      state.isDragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!state.isDragging) return;

    const deltaX = e.clientX - state.lastX;
    const deltaY = e.clientY - state.lastY;

    state.lastX = e.clientX;
    state.lastY = e.clientY;

    callbacks.onOrbit(-deltaX * sensitivity, deltaY * sensitivity);
  };

  const handleMouseUp = () => {
    state.isDragging = false;
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.01;
    callbacks.onZoom(e.deltaY * zoomSensitivity);
  };

  // mousedown stays on element - drag only starts when clicking on the canvas
  element.addEventListener('mousedown', handleMouseDown);
  // wheel stays on element - zoom only when scrolling over canvas
  element.addEventListener('wheel', handleWheel, { passive: false });
  // mousemove and mouseup are on document for global tracking during drag
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  const cleanup = () => {
    element.removeEventListener('mousedown', handleMouseDown);
    element.removeEventListener('wheel', handleWheel);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return { state, cleanup };
}
