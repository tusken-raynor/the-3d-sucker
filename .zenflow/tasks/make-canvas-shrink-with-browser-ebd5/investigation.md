# Investigation: Canvas Resize Bug

## Bug Summary

When the browser viewport is shrunk narrower than 800px, the canvas rendering the 3D model overflows horizontally. The canvas has a fixed 800x600 dimension that does not respond to viewport size changes.

## Root Cause Analysis

The canvas dimensions are hardcoded in multiple places:

1. **HTML (`index.html:12`)**: Canvas element has static `width="800" height="600"` attributes
2. **TypeScript (`src/main.ts:17-18`)**: Constants define fixed dimensions:
   ```typescript
   const CANVAS_WIDTH = 800;
   const CANVAS_HEIGHT = 600;
   ```
3. **Framebuffer (`src/main.ts:48`)**: Created with fixed dimensions, never resized
4. **CSS (`src/style.css:43-47`)**: No responsive constraints (no `max-width`)

Additionally, there is **no resize handling**:
- No `window.addEventListener('resize', ...)`
- No `ResizeObserver` monitoring container size
- Framebuffer is created once at initialization and never recreated

## Affected Components

| File | Lines | Issue |
|------|-------|-------|
| `index.html` | 12 | Hardcoded `width="800" height="600"` |
| `src/main.ts` | 17-18 | `CANVAS_WIDTH = 800`, `CANVAS_HEIGHT = 600` constants |
| `src/main.ts` | 48 | Framebuffer created with fixed dimensions |
| `src/main.ts` | 133-137 | Render loop uses fixed framebuffer |
| `src/style.css` | 43-47 | No `max-width` constraint on canvas |
| `src/js/scene-manager/index.ts` | 48-54 | Aspect ratio derived from framebuffer (will update automatically if framebuffer changes) |

## Proposed Solution

### Approach: CSS-based responsive canvas with JavaScript dimension sync

1. **CSS Changes (`src/style.css`)**:
   - Add `max-width: 100%` to `.renderer canvas` so it shrinks with viewport
   - Add `height: auto` and use `aspect-ratio: 4 / 3` to maintain proportions
   - This handles the visual sizing responsively

2. **JavaScript Changes (`src/main.ts`)**:
   - Add a `ResizeObserver` to monitor the canvas container
   - When the canvas's rendered size changes, update:
     - Canvas `width` and `height` attributes (for drawing resolution)
     - Recreate framebuffer with new dimensions
   - Debounce resize handler to avoid excessive recreations

3. **Key insight**: The `scene-manager` already calculates aspect ratio from framebuffer dimensions (`src/js/scene-manager/index.ts:49`), so it will automatically use the correct aspect ratio when the framebuffer is resized.

### Implementation Details

```typescript
// Pseudocode for resize handling
const resizeObserver = new ResizeObserver((entries) => {
  const entry = entries[0];
  const { width, height } = entry.contentRect;

  // Round to integers
  const newWidth = Math.floor(width);
  const newHeight = Math.floor(width * (3/4)); // Maintain 4:3 aspect ratio

  // Update canvas attributes
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Recreate framebuffer
  framebuffer = createFramebuffer(newWidth, newHeight);
});

resizeObserver.observe(canvas);
```

### Edge Cases

1. **Minimum size**: Should enforce a minimum canvas width to prevent rendering at tiny sizes (e.g., 200px minimum)
2. **High DPI displays**: Could optionally scale for `devicePixelRatio`, but this increases render cost significantly - suggest keeping 1:1 for now since this is a software rasterizer
3. **Very narrow viewports**: At extreme sizes, the 4:3 aspect ratio may still result in height overflow - CSS `max-height: 100vh` could help

### Alternative Approaches Considered

1. **CSS-only with fixed internal resolution**: Keep internal 800x600 but scale canvas via CSS - simpler but results in blurry/pixelated output
2. **Fixed aspect-ratio container**: Wrap canvas in container with `aspect-ratio` - similar result to chosen approach but more HTML changes

## Test Strategy

- Resize browser window below 800px and verify canvas shrinks
- Resize above 800px and verify canvas doesn't exceed 800px width (preferred) or grows smoothly
- Verify 3D rendering still works correctly at different sizes
- Verify aspect ratio is maintained during resize
- Verify no visual glitches during resize (debouncing)
