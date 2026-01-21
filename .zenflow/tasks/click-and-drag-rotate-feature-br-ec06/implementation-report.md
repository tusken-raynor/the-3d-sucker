# Implementation Report

## Bug Fixed

**Issue**: Click and drag rotation stops working when the mouse cursor leaves the 3D view bounds during a drag operation.

## Root Cause

The `handleMouseLeave` event listener unconditionally set `isDragging` to `false` when the cursor left the element bounds, breaking the drag operation. Additionally, `mousemove` and `mouseup` listeners were only attached to the target element, so events outside the element were never captured.

## Fix Applied

### Changes to `src/js/input-handler/index.ts`

1. **Removed `handleMouseLeave` function** - No longer needed since drag should not stop when leaving element
2. **Moved `mousemove` listener to `document`** - Allows tracking mouse movement anywhere on the page during drag
3. **Moved `mouseup` listener to `document`** - Ensures drag stops when mouse is released anywhere
4. **Updated `cleanup` function** - Removes listeners from correct targets (element and document)

### Event Listener Configuration

| Event     | Target   | Purpose                              |
|-----------|----------|--------------------------------------|
| mousedown | element  | Start drag only when clicking canvas |
| wheel     | element  | Zoom only when scrolling over canvas |
| mousemove | document | Track movement globally during drag  |
| mouseup   | document | Stop drag when released anywhere     |

## Tests Added/Updated

### New Tests

1. **`should continue dragging when mouse leaves element bounds`** - Verifies `mouseleave` does not stop dragging
2. **`should track mouse movement on document during drag`** - Verifies orbit callback fires for document-level mousemove
3. **`should stop dragging when mouseup occurs on document`** - Verifies global mouseup detection

### Updated Tests

- Updated all existing drag-related tests to dispatch `mousemove` and `mouseup` events on `document` instead of `element`
- Updated cleanup test to verify correct number of listeners removed from both element (2) and document (2)

## Verification Results

### Unit Tests
- **17 tests passing** in `src/js/input-handler/index.test.ts`

### Full Test Suite
- **199 unit tests** - All passing
- **30 integration tests** - All passing
- **13 e2e tests** - All passing

## Documentation Updated

Updated `src/js/input-handler/docs.md`:
- Updated "Input Detection" section to reflect global tracking behavior
- Updated "Tests" section to list new test coverage

## Files Modified

1. `src/js/input-handler/index.ts` - Implementation changes
2. `src/js/input-handler/index.test.ts` - Test updates and additions
3. `src/js/input-handler/docs.md` - Documentation updates
