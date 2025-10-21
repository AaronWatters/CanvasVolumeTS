/**
 * CanvasVolumeTS - Simple library for interactive 2d and 3d images on an HTML5 canvas.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface CanvasVolumeOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

/**
 * Main CanvasVolume class for managing interactive 2D/3D visualizations
 */
export class CanvasVolume {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private backgroundColor: string;

  constructor(canvas: HTMLCanvasElement, options: CanvasVolumeOptions = {}) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    
    this.width = options.width ?? 800;
    this.height = options.height ?? 600;
    this.backgroundColor = options.backgroundColor ?? '#000000';
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  /**
   * Clear the canvas with background color
   */
  clear(): void {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw a point on the canvas
   */
  drawPoint(point: Point2D, color: string = '#ffffff', size: number = 2): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  /**
   * Draw a line between two points
   */
  drawLine(start: Point2D, end: Point2D, color: string = '#ffffff', width: number = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
  }

  /**
   * Get canvas dimensions
   */
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Get the underlying canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get the 2D rendering context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}

/**
 * Helper function to create a new CanvasVolume instance
 */
export function createCanvasVolume(
  canvasId: string,
  options?: CanvasVolumeOptions
): CanvasVolume {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error(`Canvas element with id "${canvasId}" not found`);
  }
  return new CanvasVolume(canvas, options);
}

export default CanvasVolume;
