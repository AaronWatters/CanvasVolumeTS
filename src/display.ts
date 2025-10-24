/**
 * Canvas container with volume rendering capabilities.
 */

import * as volume from './volume';

export class CanvasVolume {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  volumeData: volume.Volume3D | null;
  pixelScale: number = 1.0;
  pixelOffsetX: number = 0;
  pixelOffsetY: number = 0;
  currentSlice: number = 0;
  pixelCenterX: number = 0;
  pixelCenterY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.context = ctx;
    this.volumeData = null;
  };

  setVolumeData(volumeData: volume.Volume3D) {
    const loaded = (volumeData.data !== null);
    this.volumeData = volumeData;
    // if this is the first time loading data, center the view
    if (!loaded) {
       this.pixelCenterX = volumeData.width / 2;
       this.pixelCenterY = volumeData.height / 2;
       this.pixelOffsetX = 0;
       this.pixelOffsetY = 0;
       this.currentSlice = Math.floor(volumeData.depth / 2);
    }
  };

  canvasShape(): {width: number, height: number} {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  };

  center(pixelX: number, pixelY: number) {
    const canvasCenterX = this.canvas.width / 2;
    const canvasCenterY = this.canvas.height / 2;
    const canvasScale = this.pixelScale / 2;
    this.pixelOffsetX = canvasCenterX - (pixelX * canvasScale);
    this.pixelOffsetY = canvasCenterY - (pixelY * canvasScale);
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
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = this.volumeData.width;
    offscreenCanvas.height = this.volumeData.height;
    const imageBitmap = await createImageBitmap(sliceData);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(
      imageBitmap,
      0, 0, this.volumeData.width, this.volumeData.height,
      this.pixelOffsetX, this.pixelOffsetY,
      this.volumeData.width * this.pixelScale,
      this.volumeData.height * this.pixelScale
    );
  };
};