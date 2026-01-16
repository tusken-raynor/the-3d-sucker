# Investigation: Canvas Resize Bug

## Bug Summary

The canvas gets stuck at a small size after shrinking the viewport and then expanding it. The canvas correctly shrinks when the viewport narrows, but fails to grow back when the viewport is expanded.

## Root Cause Analysis

The problem is a **circular sizing dependency** caused by observing the canvas element itself:

### Current Flow (Broken)

1. **Initial state**: Canvas has `width="800"` attribute, CSS `max-width: 100%`
2. **Viewport shrinks**: CSS `max-width: 100%` causes canvas to display smaller (say 500px)
3. **ResizeObserver fires**: Reads `canvas.clientWidth` (500px), updates `canvas.width = 500`
4. **Viewport expands**: The canvas **stays at 500px** because:
   - The canvas intrinsic size is now 500px (from step 3)
   - `max-width: 100%` is a *maximum constraint*, not a size driver
   - Nothing tells the canvas to grow larger
   - The ResizeObserver doesn't fire because the canvas size hasn't changed

### The Fundamental Problem

The ResizeObserver watches the canvas, but the canvas size is **determined by its own attributes**. This creates a one-way ratchet:
- Shrinking works: CSS constraint → smaller display → observer updates attribute
- Growing fails: No CSS force pushes canvas larger → display stays same → observer never fires

## Affected Components

| File | Lines | Component |
|------|-------|-----------|
| `src/main.ts` | 88-92 | ResizeObserver setup (observes canvas directly) |
| `src/main.ts` | 55-60 | `getCanvasDimensions()` reads `canvas.clientWidth` |
| `src/style.css` | 43-49 | Canvas CSS with `max-width: 100%` |
| `index.html` | 11-12 | `.renderer` wrapper lacks size constraints |

## Proposed Solution

**Observe a wrapper container instead of the canvas itself.**

### HTML Changes (`index.html`)

Add a wrapper `div` around the canvas with a specific class:

```html
<div class="renderer">
  <div class="renderer__canvas-wrapper">
    <canvas id="render-canvas" width="800" height="600"></canvas>
  </div>
  ...
</div>
```

### CSS Changes (`src/style.css`)

Style the wrapper to always try to be as large as possible (up to 800px):

```css
.renderer__canvas-wrapper {
  width: 100%;
  max-width: 800px;  /* BASE_WIDTH */
}

.renderer canvas {
  display: block;
  width: 100%;
  /* Remove max-width: 100% from canvas - wrapper handles constraints */
}
```

The wrapper:
- Has `width: 100%` - always tries to fill available space
- Has `max-width: 800px` - caps at the base width
- When viewport shrinks: wrapper shrinks (constrained by viewport)
- When viewport expands: wrapper grows (up to 800px)

### JavaScript Changes (`src/main.ts`)

1. Query the wrapper element
2. Observe the wrapper instead of the canvas
3. Read wrapper's `clientWidth` in `getCanvasDimensions()`

```typescript
const wrapper = document.querySelector('.renderer__canvas-wrapper') as HTMLElement;

function getCanvasDimensions(): { width: number; height: number } {
  const displayedWidth = wrapper.clientWidth;  // Read wrapper, not canvas
  const width = Math.max(MIN_WIDTH, Math.min(BASE_WIDTH, displayedWidth));
  const height = Math.round(width / ASPECT_RATIO);
  return { width, height };
}

resizeObserver.observe(wrapper);  // Observe wrapper, not canvas
```

### Why This Works

1. **Wrapper always reflects available space**: `width: 100%` makes it fill viewport width (or parent), `max-width: 800px` caps it
2. **No circular dependency**: Wrapper size is determined by viewport/parent, not by canvas
3. **Both directions work**:
   - Shrink: viewport shrinks → wrapper shrinks → observer fires → canvas shrinks
   - Grow: viewport grows → wrapper grows → observer fires → canvas grows

## Edge Cases Considered

1. **Minimum width**: Still enforced via `MIN_WIDTH` in `getCanvasDimensions()`
2. **Aspect ratio**: Still maintained by calculating height from width
3. **Framebuffer recreation**: No changes needed, still triggered by dimension changes
4. **Debouncing**: No changes needed, still applied
5. **Existing e2e tests**: Test for shrinking should still pass; need to add test for growing

## Test Plan

Add a regression test that:
1. Starts at 1000px viewport width (canvas should be ~800px)
2. Shrinks to 500px viewport width (canvas shrinks accordingly)
3. Expands back to 1000px viewport width
4. Verifies canvas width increases back to ~800px (the bug was it stayed small)
5. Verifies aspect ratio is maintained (4:3)

---

## Implementation Notes

### Changes Made

1. **index.html** - Added wrapper div around canvas:
   ```html
   <div class="renderer__canvas-wrapper">
     <canvas id="render-canvas" width="800" height="600"></canvas>
   </div>
   ```

2. **src/style.css** - Three CSS changes:
   - Added `width: 100%` to `#app` to ensure it fills viewport
   - Added `width: 100%` and `max-width: 800px` to `.renderer`
   - Added `.renderer__canvas-wrapper` with `width: 100%` and `max-width: 800px`
   - Changed canvas from `max-width: 100%` to `width: 100%` and added `display: block`

3. **src/main.ts** - Two changes:
   - Query the wrapper element: `document.querySelector('.renderer__canvas-wrapper')`
   - Read `wrapper.clientWidth` instead of `canvas.clientWidth` in `getCanvasDimensions()`
   - Observe wrapper instead of canvas: `resizeObserver.observe(wrapper)`

### Test Results

- Added regression test: "should resize canvas when viewport expands after shrinking"
- Confirmed test fails before fix (canvas stayed at 468px after shrinking)
- Confirmed test passes after fix (canvas grows back to ~800px)
- All 13 e2e tests pass
- All 197 unit tests pass
- All 30 integration tests pass
- Full validation (`npm run validate`) passes
