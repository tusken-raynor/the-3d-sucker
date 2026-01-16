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

  const handleMouseLeave = () => {
    state.isDragging = false;
  };

  element.addEventListener('mousedown', handleMouseDown);
  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseup', handleMouseUp);
  element.addEventListener('wheel', handleWheel, { passive: false });
  element.addEventListener('mouseleave', handleMouseLeave);

  const cleanup = () => {
    element.removeEventListener('mousedown', handleMouseDown);
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseup', handleMouseUp);
    element.removeEventListener('wheel', handleWheel);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };

  return { state, cleanup };
}
