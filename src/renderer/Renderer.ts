import { Color } from "../core/Color";
import { Size } from "../core/Size";

export class Renderer {

    private context: CanvasRenderingContext2D | null;
    private imageData: ImageData;
    private colorBuffer: Uint8ClampedArray;
    private depthBuffer: Array<number>

    constructor(
        private canvas: HTMLCanvasElement,
        private resolution: Size) {

            this.context = this.canvas.getContext("2d");

            if (!this.context) throw new Error("Context error.");

            this.imageData = this.context.getImageData(0, 0, this.resolution.width, this.resolution.height);
            this.colorBuffer = this.imageData.data;
            this.depthBuffer = [...new Array(this.resolution.width * this.resolution.height)].map(() => Infinity);
        }

    public clear(color: Color): void {

        for(let i = 0; i < this.depthBuffer.length; i++) {

            this.depthBuffer[i] = Infinity;
        }

        for (let index = 0; index < this.colorBuffer.length; index += 4) {

            this.colorBuffer[index + 0] = color.r;
            this.colorBuffer[index + 1] = color.g;
            this.colorBuffer[index + 2] = color.b;
            this.colorBuffer[index + 3] = color.a;
        }
    }

    public drawPixel(x: number, y: number, color: Color): void {

        [x, y] = [~~x, ~~y];

        if (x < 0
            || y < 0
            || x >= this.resolution.width
            || y >= this.resolution.height) return;

        const index = 4 * (y * this.resolution.width + x);

        this.colorBuffer[index + 0] = color.r;
        this.colorBuffer[index + 1] = color.g;
        this.colorBuffer[index + 2] = color.b;
        this.colorBuffer[index + 3] = color.a;
    }

    public depthDrawPixel(x: number, y: number, z: number, color: Color): void {

        [x, y] = [~~x, ~~y];

        if (x < 0
            || y < 0
            || x >= this.resolution.width
            || y >= this.resolution.height) return;

        const depthIndex = y * this.resolution.width + x;

        if (z > this.depthBuffer[depthIndex]) return;
        this.depthBuffer[depthIndex] = z;

        const index = 4 * (y * this.resolution.width + x);

        this.colorBuffer[index + 0] = color.r;
        this.colorBuffer[index + 1] = color.g;
        this.colorBuffer[index + 2] = color.b;
        this.colorBuffer[index + 3] = color.a;
    }

    public updateScreen(): void {

        this.context!.putImageData(this.imageData, 0, 0);
    }
}
