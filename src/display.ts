/**
 * Canvas container with volume rendering capabilities.
 */

import * as volume from './volume';

export class CanvasVolume {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  volumeData: volume.Volume3D | null;
  pixelScale: number = 1.0;
  currentSlice: number = 0;
  pixelCenterX: number = 0;
  pixelCenterY: number = 0;
  backgroundColor: string;

  constructor(canvas: HTMLCanvasElement, backgroundColor: string = 'black') {
    this.backgroundColor = backgroundColor;
    this.canvas = canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.context = ctx;
    this.volumeData = null;
  };

  setVolumeData(volumeData: volume.Volume3D) {
    const loaded = (this.volumeData !== null);
    this.volumeData = volumeData;
    // if this is the first time loading data, center the view
    if (!loaded) {
       this.pixelCenterX = volumeData.width / 2;
       this.pixelCenterY = volumeData.height / 2;
       this.currentSlice = Math.floor(volumeData.depth / 2);
    }
  };

  canvasShape(): {width: number, height: number} {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  };

  setZoom(zoom: number) {
    console.log('setZoom', zoom, this);
    if (zoom < 1) {
      throw new Error('zoom must be >= 1');
    }
    this.pixelScale = zoom;
  };

  center(pixelX: number, pixelY: number) {
    this.pixelCenterX = pixelX;
    this.pixelCenterY = pixelY;
  };

  sliceAt(z: number) {
    if (!this.volumeData) {
      throw new Error('No volume data set');
    }
    if (z < 0 || z >= this.volumeData.depth) {
      throw new Error(`Slice z=${z} out of bounds (0 to ${this.volumeData.depth - 1})`);
    }
    this.currentSlice = Math.floor(z);
  };

  async draw() {
    if (!this.volumeData) {
      throw new Error('No volume data set');
    }
    const sliceData = this.volumeData.getImageDataAtSlice(this.currentSlice);
    // draw the sliceData to the canvas with scaling and offset
    // save the context state
    this.context.save();
    // clear the canvas
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    debugger;
    const cx = this.pixelCenterX
    const cy = this.pixelCenterY;
    const s = this.pixelScale;
    const w = this.canvas.width;
    const h = this.canvas.height;
    // adjust top left pixel offset
    const offsetx = cx - (w / (2 * s));
    const offsety = cy - (h / (2 * s));
    console.log("translate to ", offsetx, offsety, " scale ", s);
    // translate to center
    this.context.translate(-offsetx*s, -offsety*s);
    // scale by s
    this.context.scale(s, s);
    // translate to center
    //this.context.translate(-offsetx, -offsety);
    const imageBitmap = await createImageBitmap(sliceData);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(
      imageBitmap,
      0, 0, this.volumeData.width, this.volumeData.height,
      0, 0,
      this.volumeData.width,
      this.volumeData.height
    );
    // restore the context state
    this.context.restore();
  };

  /** Set up event callbacks so wheel events cause zooming. */
  setupWheelZoom() {
    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(1, this.pixelScale + delta);
      this.setZoom(newZoom);
      this.draw();
    });
  };

  /** Set up event callbacks so drag events cause panning. */
  setupDragPan() {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    this.canvas.addEventListener('mousedown', (event) => {
      isDragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    });
    this.canvas.addEventListener('mousemove', (event) => {
      if (isDragging) {
        const deltaX = (event.clientX - lastX) / this.pixelScale;
        const deltaY = (event.clientY - lastY) / this.pixelScale;
        this.pixelCenterX -= deltaX;
        this.pixelCenterY -= deltaY;
        lastX = event.clientX;
        lastY = event.clientY;
        this.draw();
      }
    });
    this.canvas.addEventListener('mouseup', (event) => {
      isDragging = false;
    });
    this.canvas.addEventListener('mouseleave', (event) => {
      isDragging = false;
    });
  };
};
