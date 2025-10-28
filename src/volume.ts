
/**
 * 3d image volume.
 * C ordered Uint8Array data.
 * axis order: z, y, x, channels
 * z is the slowest axis.
 */

import { npyjs } from '.';

export * as npyjs from 'npyjs';

export class Volume3D {
  width: number;
  height: number;
  depth: number;
  channels: number;
  layerSize: number;
  data: Uint8Array | null;
  BitMapMapping: Map<number, ImageBitmap> = new Map();

  constructor(
    width: number, 
    height: number, 
    depth: number, 
    channels: number=1,
    data: Uint8Array | null = null
    ) {
    // channels must be 1 (grayscale) or 3 (rgb) or 4 (rgba)
    if (channels !== 1 && channels !== 3 && channels !== 4) {
      throw new Error('Channels must be 1, 3, or 4');
    }
    // width, height, depth must be positive integers
    if (width <= 0 || height <= 0 || depth <= 0) {
      throw new Error('Width, height, and depth must be positive integers');
    }
    // if data is provided, check its length
    if (data) {
      const expectedLength = width * height * depth * channels;
      if (data.length !== expectedLength) {
        throw new Error(`Data length ${data.length} does not match expected size ${expectedLength}`);
      }
    }
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.channels = channels;
    this.layerSize = this.width * this.height * this.channels;
    this.data = data;
  };
  /** Get an image slice at depth z */
  getSlice(z: number): Uint8Array {
    if (!this.data) {
        // return all zeros
        return new Uint8Array(this.width * this.height * this.channels);
    }
    const indexStart = z * this.layerSize;
    const indexEnd = indexStart + this.layerSize;
    const slice = this.data.slice(indexStart, indexEnd);
    return slice;
  };
  async getImageBitMapAtSlice(z: number): ImageBitmap {
    const index = Math.floor(z);
    const cachedBitmap = this.BitMapMapping.get(index);
    if (cachedBitmap) {
      return cachedBitmap;
    }
    const slice = this.getSlice(index);
    let rgbaData = new Uint8Array(this.width * this.height * 4);
    const planeSize = this.width * this.height;
    if (this.channels === 1) {
      // grayscale to rgba
      for (let i = 0; i < planeSize; i++) {
        const value = slice[i];
        // value must be defined
        if (value === undefined) {
          throw new Error('Invalid pixel value');
        }
        const pixelIndex = i * 4;
        rgbaData[pixelIndex] = value!;
        rgbaData[pixelIndex + 1] = value!;
        rgbaData[pixelIndex + 2] = value!;
        rgbaData[pixelIndex + 3] = 255; // opaque
      }
    } else if (this.channels === 3) {
        // rgb to rgba
        for (let i = 0; i < planeSize; i++) {
            const sliceIndex = i * 3;
            const r = slice[sliceIndex];
            const g = slice[sliceIndex + 1];
            const b = slice[sliceIndex + 2];
            const pixelIndex = i * 4;
            rgbaData[pixelIndex] = r!;
            rgbaData[pixelIndex + 1] = g!;
            rgbaData[pixelIndex + 2] = b!;
            rgbaData[pixelIndex + 3] = 255; // opaque
        }
    } else if (this.channels === 4) {
        // rgba
        rgbaData.set(slice);
    }
    const data = new ImageData(new Uint8ClampedArray(rgbaData), this.width, this.height);
    const bitmap = await createImageBitmap(data);
    this.BitMapMapping.set(index, bitmap);
    return bitmap;
  }
};

export async function loadNpyVolume(url: string): Promise<Volume3D> {
  //const npy = new npyjs.NPYJS();
  const array = await npyjs.load(url);
  // check that array is a Uint8Array
  if (!(array.data instanceof Uint8Array)) {
    throw new Error('Loaded data is not a Uint8Array');
  }
  // get shape
  const shape = array.shape;
  // shape must be (width, height, depth) or (width, height, depth, channels)
  const ln = shape.length;
  if (ln === 3) {
    const [depth, height, width] = shape;
    return new Volume3D(width!, height!, depth!, 1, array.data);
  } else if (ln === 4) {
    const [depth, height, width, channels] = shape;
    return new Volume3D(width!, height!, depth!, channels!, array.data);
  } else {
    throw new Error(`Unsupported shape: ${shape}`);
  }
};
