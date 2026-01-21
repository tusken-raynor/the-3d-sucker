# Investigation Report

## Bug Summary

**Issue**: Click and drag rotation stops working when the mouse cursor leaves the 3D view bounds during a drag operation.

**Reported Behavior**: When rotating the model by clicking and dragging, if the cursor moves outside the canvas/3D view element, the rotation stops and the drag state is lost.

## Root Cause Analysis

### Location
`src/js/input-handler/index.ts:57-59`

### Problem
The `handleMouseLeave` event listener unconditionally sets `isDragging` to `false` when the cursor leaves the element bounds:

```typescript
const handleMouseLeave = () => {
  state.isDragging = false;
};
```

This is by design in the current implementation (line 65):
```typescript
element.addEventListener('mouseleave', handleMouseLeave);
```

### Why This Causes the Bug

1. User clicks on the canvas to start rotation (`mousedown` → `isDragging = true`)
2. User drags to rotate the model (`mousemove` → triggers `onOrbit` callback)
3. User's cursor moves outside the canvas bounds → `mouseleave` event fires
4. `handleMouseLeave` sets `isDragging = false`
5. Any further `mousemove` events (even if cursor returns to canvas) don't trigger rotation because `isDragging` is now `false`
6. User must click again to restart the drag operation

### Additional Issues

Currently, all event listeners (`mousemove`, `mouseup`) are attached only to the target element, not to `document` or `window`. This means:

- `mousemove` events outside the element are never captured
- `mouseup` events outside the element are never captured (so if user releases mouse button outside, the element never knows)

## Impact Assessment

- **User Experience**: Poor - users cannot make smooth, continuous rotation movements
- **Functionality**: Rotation feature is partially broken
- **Scope**: Only affects the input-handler module

## Fix Plan

### Approach: Attach global listeners during drag

The fix involves modifying how events are handled during drag operations:

1. **Remove the `mouseleave` handler** entirely - it should not stop dragging
2. **Attach `mousemove` to `document`** during drag (or always) so movement is tracked globally
3. **Attach `mouseup` to `document`** so release is detected even if cursor is outside the element
4. **Keep `mousedown` on the element** - drag should only start when clicking on the canvas

### Implementation Details

#### Changes to `src/js/input-handler/index.ts`:

1. Remove `handleMouseLeave` function and its event listener
2. Change `mousemove` listener to be attached to `document` instead of `element`
3. Change `mouseup` listener to be attached to `document` instead of `element`
4. Update `cleanup` function to remove listeners from the correct targets

#### Pseudo-code for fix:

```typescript
// Keep mousedown on element (user must click on canvas to start)
element.addEventListener('mousedown', handleMouseDown);

// Attach move and up to document for global tracking
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);

// Remove mouseleave entirely - don't need it anymore
// element.addEventListener('mouseleave', handleMouseLeave); // DELETE

const cleanup = () => {
  element.removeEventListener('mousedown', handleMouseDown);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  // element.removeEventListener('mouseleave', handleMouseLeave); // DELETE
};
```

### Test Strategy

1. **Update existing tests** that expect `mouseleave` to stop dragging (this behavior will change)
2. **Add new tests** to verify:
   - Dragging continues when mouse moves outside element bounds
   - `mouseup` outside element bounds stops dragging correctly
   - `mousemove` outside element bounds still triggers orbit callback
3. **Manual testing** to verify smooth rotation across the entire viewport

### Files to Modify

1. `src/js/input-handler/index.ts` - Main implementation changes
2. `src/js/input-handler/index.test.ts` - Update and add tests
3. `src/js/input-handler/docs.md` - Update documentation to reflect new behavior

### Potential Side Effects

- None expected - this change improves behavior without affecting other functionality
- The wheel/zoom behavior remains unchanged (bound to element only, which is correct for scroll)

## Conclusion

This is a straightforward bug with a well-defined fix. The root cause is the `mouseleave` handler stopping drag state, combined with `mousemove` and `mouseup` only being listened on the element rather than globally.

The fix involves removing `mouseleave` handling and moving `mousemove`/`mouseup` listeners to `document` level to ensure continuous tracking during drag operations.
