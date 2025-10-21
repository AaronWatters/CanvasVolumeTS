# Build Documentation

This document explains the build system and how tsdown is used to generate browser-compatible vanilla JavaScript from TypeScript.

## Build System Overview

CanvasVolumeTS uses [tsdown](https://github.com/sxzz/tsdown) as its build tool. tsdown is a modern TypeScript bundler powered by rolldown that compiles TypeScript to multiple JavaScript formats suitable for different environments.

## Why tsdown?

- **Multiple Output Formats**: Generates ESM, CommonJS, and IIFE from a single build
- **Zero Configuration**: Works out of the box with sensible defaults
- **Fast**: Built on rolldown for high-performance bundling
- **Type Declarations**: Automatically generates TypeScript `.d.ts` files
- **Source Maps**: Includes source maps for all outputs
- **Browser-First**: Designed for browser-compatible builds

## Configuration Files

### tsconfig.json
```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "ES2020",
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true
  }
}
```

Key settings:
- `module: "ES2020"` - Modern ESM module system
- `target: "ES2020"` - Browser-compatible ES2020 syntax
- `lib: ["ES2020", "DOM"]` - Includes browser DOM types
- `strict: true` - Full TypeScript strict mode

### tsdown.config.ts
```typescript
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  minify: false,
  platform: 'browser',
  target: 'es2020',
  globalName: 'CanvasVolumeTS',
});
```

Key settings:
- `format: ['esm', 'cjs', 'iife']` - Generates all three formats
- `platform: 'browser'` - Optimizes for browser environment
- `globalName: 'CanvasVolumeTS'` - IIFE global variable name
- `dts: true` - Generates TypeScript declarations

## Build Outputs

### ESM (index.js)
```javascript
// Modern ES Module format
export { CanvasVolume, createCanvasVolume };
```

**Usage:**
```javascript
import { CanvasVolume } from 'canvasvolumets';
```

### CommonJS (index.cjs)
```javascript
// Node.js compatible CommonJS format
exports.CanvasVolume = CanvasVolume;
exports.createCanvasVolume = createCanvasVolume;
```

**Usage:**
```javascript
const { CanvasVolume } = require('canvasvolumets');
```

### IIFE (index.iife.js)
```javascript
// Immediately Invoked Function Expression for browsers
var CanvasVolumeTS = (function(exports) {
  // Library code...
  return exports;
})({});
```

**Usage:**
```html
<script src="node_modules/canvasvolumets/dist/index.iife.js"></script>
<script>
  const { CanvasVolume } = CanvasVolumeTS;
</script>
```

### TypeScript Declarations (index.d.ts)
```typescript
// Full TypeScript type definitions
declare class CanvasVolume {
  constructor(canvas: HTMLCanvasElement, options?: CanvasVolumeOptions);
  // Methods...
}
```

## Build Commands

### Development Build
```bash
npm run build
```
Compiles TypeScript to all output formats.

### Watch Mode
```bash
npm run dev
```
Watches for changes and rebuilds automatically.

### Type Check Only
```bash
npm run typecheck
```
Runs TypeScript compiler without emitting files to check for type errors.

### Clean Build
```bash
npm run clean && npm run build
```
Removes existing build artifacts and rebuilds from scratch.

## Package.json Configuration

```json
{
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

This configuration:
- Sets the package as an ESM module
- Defines entry points for different module systems
- Enables proper TypeScript import resolution
- Supports both `import` and `require` syntax

## Browser Compatibility

The generated JavaScript is compatible with:
- Modern browsers supporting ES2020
- Node.js 14+ (for CJS/ESM)
- TypeScript projects (via type definitions)

ES2020 features used:
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Classes with private fields
- Modern syntax and APIs

## Source Maps

All outputs include source maps (`.map` files) that allow debuggers to:
- Map compiled JavaScript back to original TypeScript
- Set breakpoints in TypeScript source
- See original variable names
- Navigate stack traces to source code

## Publishing

Before publishing to npm:
```bash
npm run build
npm publish
```

The `files` field in package.json ensures only the `dist/` directory is published:
```json
{
  "files": ["dist"]
}
```

## Troubleshooting

### Build Fails
1. Check TypeScript errors: `npm run typecheck`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Clear build cache: `npm run clean`

### Import Issues
1. Verify package.json exports configuration
2. Check that dist/ directory contains all files
3. Ensure using correct import syntax for your environment

### Browser Issues
1. Use the IIFE bundle for direct `<script>` inclusion
2. Check browser console for errors
3. Verify ES2020 browser support

## Additional Resources

- [tsdown Documentation](https://github.com/sxzz/tsdown)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Node.js Package Exports](https://nodejs.org/api/packages.html#exports)
