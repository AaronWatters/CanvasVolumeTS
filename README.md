# CanvasVolumeTS

Simple library for interactive 2d and 3d images on an HTML5 canvas.

Built with TypeScript and compiled to vanilla JavaScript using [tsdown](https://github.com/sxzz/tsdown) for seamless browser integration.

## Features

- 🎨 Simple API for 2D canvas operations
- 📦 Multiple output formats (ESM, CJS, IIFE)
- 🌐 Browser-ready vanilla JavaScript
- 📘 Full TypeScript support with type definitions
- 🗺️ Source maps included
- ⚡ Zero runtime dependencies

## Installation

```bash
npm install canvasvolumets
```

## Usage

### Browser (IIFE)

```html
<!DOCTYPE html>
<html>
<head>
    <title>CanvasVolumeTS Example</title>
</head>
<body>
    <canvas id="myCanvas"></canvas>
    
    <script src="node_modules/canvasvolumets/dist/index.iife.js"></script>
    <script>
        const { CanvasVolume } = CanvasVolumeTS;
        
        const canvas = document.getElementById('myCanvas');
        const volume = new CanvasVolume(canvas, {
            width: 800,
            height: 600,
            backgroundColor: '#000000'
        });
        
        volume.clear();
        volume.drawPoint({ x: 100, y: 100 }, '#ff0000', 5);
        volume.drawLine({ x: 0, y: 0 }, { x: 800, y: 600 }, '#ffffff', 2);
    </script>
</body>
</html>
```

### ES Module

```typescript
import { CanvasVolume, createCanvasVolume } from 'canvasvolumets';

// Option 1: Direct instantiation
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const volume = new CanvasVolume(canvas, {
    width: 800,
    height: 600
});

// Option 2: Using helper function
const volume2 = createCanvasVolume('myCanvas', {
    width: 800,
    height: 600,
    backgroundColor: '#001122'
});

// Draw operations
volume.clear();
volume.drawPoint({ x: 400, y: 300 }, '#ff6b6b', 5);
volume.drawLine(
    { x: 100, y: 100 }, 
    { x: 700, y: 500 }, 
    '#4ecdc4', 
    2
);
```

### CommonJS

```javascript
const { CanvasVolume } = require('canvasvolumets');

const canvas = document.getElementById('myCanvas');
const volume = new CanvasVolume(canvas);
volume.clear();
```

## API Reference

### `CanvasVolume`

Main class for managing canvas operations.

#### Constructor

```typescript
new CanvasVolume(canvas: HTMLCanvasElement, options?: CanvasVolumeOptions)
```

**Options:**
- `width?: number` - Canvas width (default: 800)
- `height?: number` - Canvas height (default: 600)
- `backgroundColor?: string` - Background color (default: '#000000')

#### Methods

- `clear(): void` - Clear canvas with background color
- `drawPoint(point: Point2D, color?: string, size?: number): void` - Draw a point
- `drawLine(start: Point2D, end: Point2D, color?: string, width?: number): void` - Draw a line
- `getDimensions(): { width: number; height: number }` - Get canvas dimensions
- `getCanvas(): HTMLCanvasElement` - Get canvas element
- `getContext(): CanvasRenderingContext2D` - Get 2D context

### `createCanvasVolume`

Helper function to create a CanvasVolume instance by canvas ID.

```typescript
createCanvasVolume(canvasId: string, options?: CanvasVolumeOptions): CanvasVolume
```

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/AaronWatters/CanvasVolumeTS.git
cd CanvasVolumeTS

# Install dependencies
npm install
```

### Build

```bash
# Build all formats (ESM, CJS, IIFE)
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run typecheck

# Clean build artifacts
npm run clean
```

### Build Output

The build process generates the following files in the `dist/` directory:

- `index.js` - ES Module format
- `index.cjs` - CommonJS format
- `index.iife.js` - IIFE format (for direct browser use)
- `index.d.ts` - TypeScript type definitions
- `*.map` - Source maps for all outputs

### Example

Open `example.html` in a browser to see a working demonstration of the library.

## Build System

This library uses [tsdown](https://github.com/sxzz/tsdown) for building TypeScript to vanilla JavaScript. Key features:

- **Multiple Formats**: Outputs ESM, CJS, and IIFE formats from a single build
- **Type Definitions**: Automatically generates TypeScript declaration files
- **Source Maps**: Includes source maps for debugging
- **Browser Target**: Configured for ES2020 browser compatibility
- **Zero Config**: Simple configuration in `tsdown.config.ts`

## License

ISC
