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
  lastKeyPressed: string = '';

  constructor(
    canvas: HTMLCanvasElement, 
    backgroundColor: string = 'black',
    wheelZoom: boolean = true,
    dragPan: boolean = true,
    arrowLevels: boolean = true,
) {
    this.backgroundColor = backgroundColor;
    this.canvas = canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.context = ctx;
    this.volumeData = null;
    if (wheelZoom) {
      this.setupWheelZoom();
    }
    if (dragPan) {
      this.setupDragPan();
    }
    if (arrowLevels) {
      this.setupKeyboardControls();
    }
    // set the tabindex to make the canvas focusable if it is not already set
    if (!this.canvas.hasAttribute('tabindex')) {
      this.canvas.tabIndex = 0;
    }
  };

  setVolumeData(volumeData: volume.Volume3D) {
    const loaded = (this.volumeData !== null);
    this.volumeData = volumeData;
    // if this is the first time loading data, center the view
    if (!loaded) {
       this.pixelCenterX = volumeData.width / 2;
       this.pixelCenterY = volumeData.height / 2;
       this.currentSlice = Math.floor(volumeData.depth / 2);
       // set intial zoom to center the volume in the canvas
       const scaleX = this.canvas.width / volumeData.width;
       const scaleY = this.canvas.height / volumeData.height;
       this.pixelScale = Math.min(scaleX, scaleY);
    }
    // null the image bitmap cache
    //this.imageBitmapCache = null;
  };

  canvasShape(): {width: number, height: number} {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  };

  setZoom(zoom: number) {
    //console.log('setZoom', zoom, this);
    if (zoom <= 0) {
      throw new Error('zoom must be > 0');
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
    const intslice = Math.floor(z);
    if (intslice < 0 || intslice >= this.volumeData.depth) {
      throw new Error(`Slice z=${z} out of bounds (0 to ${this.volumeData.depth - 1})`);
    }
    this.currentSlice = intslice;
  };

  async draw() {
    if (!this.volumeData) {
      throw new Error('No volume data set');
    }
    const imageBitmap = await this.volumeData.getImageBitMapAtSlice(this.currentSlice);
    //const sliceData = this.volumeData.getImageDataAtSlice(this.currentSlice);
    // draw the sliceData to the canvas with scaling and offset
    // save the context state
    this.context.save();
    // clear the canvas
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //debugger;
    const cx = this.pixelCenterX
    const cy = this.pixelCenterY;
    const s = this.pixelScale;
    const w = this.canvas.width;
    const h = this.canvas.height;
    // adjust top left pixel offset
    const offsetx = cx - (w / (2 * s));
    const offsety = cy - (h / (2 * s));
    //.log("translate to ", offsetx, offsety, " scale ", s);
    // translate to center
    this.context.translate(-offsetx*s, -offsety*s);
    // scale by s
    this.context.scale(s, s);
    // translate to center
    //this.context.translate(-offsetx, -offsety);
    //const imageBitmap = await createImageBitmap(sliceData);
    //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // get dx, dy, dWidth, dHeight to center the image on the canvas
    //debugger;
    //const aspectRatio = this.canvas.width / this.canvas.height;
    //const vAspectRatio = this.volumeData.width / this.volumeData.height;
    //let dx = 0;
    //let dy = 0;
    //let dWidth = this.canvas.width;
    //let dHeight = this.canvas.height;
    /*
    if (aspectRatio > vAspectRatio) {
      // canvas is wider than volume aspect ratio
      dWidth = this.canvas.height * vAspectRatio;
      dx = (this.canvas.width - dWidth) / 2;
    } else {
      // canvas is taller than volume aspect ratio
      dHeight = this.canvas.width / vAspectRatio;
      dy = (this.canvas.height - dHeight) / 2;
    }
      */
    this.context.drawImage(
      imageBitmap,
      0, 0, this.volumeData.width, this.volumeData.height,
      //dx, dy, dWidth, dHeight
    );
    // restore the context state
    this.context.restore();
  };

  /** Set up event callbacks so wheel events cause zooming. */
  setupWheelZoom() {
    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const factor = (1 + delta);
      const newZoom = Math.max(1e-5, this.pixelScale * factor);
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
      // focus the canvas to receive keyboard events
      this.canvas.focus();
      isDragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      //console.log('mousedown at', lastX, lastY);
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

  /** Set up event callbacks for keyboard interactions. */
  setupKeyboardControls() {
    this.canvas.addEventListener('keydown', (event) => {
      const key = event.key;
      if (key.startsWith('Arrow')) {
        event.preventDefault();
      }
      this.lastKeyPressed = key;
      //console.log('key pressed:', key);
    });
    this.canvas.addEventListener('keyup', (event) => {
      const key = this.lastKeyPressed;
      //if (key.startsWith('Arrow')) {
      //  event.preventDefault();
      //}
      switch (key) {
        case 'ArrowUp':
          const maxSlice = this.volumeData ? this.volumeData.depth - 1 : 0;
          this.currentSlice = Math.min(maxSlice, this.currentSlice + 1);
          this.draw();
          event.preventDefault();
          break;
        case 'ArrowDown':
          this.currentSlice = Math.max(0, this.currentSlice - 1);
          this.draw();
          event.preventDefault();
          break;
      }
      this.lastKeyPressed = '';
    });
  };
};
