import { Color } from "../core/Color";
import { Size } from "../core/Size";
import { Renderer } from "../renderer/Renderer";
import { GameConfig } from "./GameConfig";

export class Game {

    private canvas: HTMLCanvasElement;
    private resolution: Size;
    private halfResolution: Size;
    private context: CanvasRenderingContext2D | null;
    private imageData: ImageData;
    private colorBuffer: Uint8ClampedArray;
    private depthBuffer: Array<number>;
    private renderer: Renderer;
    private cameraAngle = 0.0;
    private backgroundColor = new Color(238, 238, 238);

    public get domElement(): HTMLCanvasElement {
        return this.canvas;
    }

    constructor(private config: GameConfig) {

        this.resolution = config.resolution;
        this.halfResolution = { width: ~~(config.resolution.width / 2), height: ~~(config.resolution.height / 2) };
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext("2d");

        if (!this.context) throw new Error("Context error.");

        this.canvas.width = this.resolution.width;
        this.canvas.height = this.resolution.height;
        this.canvas.style.width = `${config.viewPort.width}px`;
        this.canvas.style.height = `${config.viewPort.height}px`;

        this.imageData = this.context.getImageData(0, 0, this.resolution.width, this.resolution.height);
        this.colorBuffer = this.imageData.data;
        this.depthBuffer = [...new Array(this.resolution.width * this.resolution.height)].map(() => Infinity);
        this.renderer = new Renderer(this.context, this.resolution, this.imageData, this.colorBuffer);
    }

    public run(): void {

        const mainLoop = (timeStamp: number) => {

            timeStamp;

            this.renderer.clear(this.backgroundColor);

            this.update();

            this.renderer.updateScreen();

            requestAnimationFrame(mainLoop);
        };

        requestAnimationFrame(mainLoop);
    }

    private update(): void {

        for (let y = 0; y < this.resolution.height; y++) {

            for (let x = 0; x < this.resolution.width; x++) {

                if (x % 2 == 0 && y % 2 == 0) {

                    this.renderer.drawPixel(x, y, Color.RED);
                }
            }
        }
    }
}
