import { Size } from "../core/Size";
import { GameConfig } from "./GameConfig";

export class Game {

    private canvas: HTMLCanvasElement;
    private resolution: Size;
    private halfResolution: Size;
    private context: CanvasRenderingContext2D | null;
    private imageData: ImageData;
    private colorBuffer: Uint8ClampedArray;
    private depthBuffer: Array<number>;

    private cameraAngle = 0.0;

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

        this.context.fillStyle = "#EEE";
        this.context.fillRect(0, 0, this.resolution.width, this.resolution.height);
    }

    public run(): void {

        const mainLoop = (timeStamp: number) => {

            timeStamp;

            this.update();

            requestAnimationFrame(mainLoop);
        };

        requestAnimationFrame(mainLoop);
    }

    private update(): void {

        this.context!.strokeStyle = "#F00";
        this.context!.lineWidth = 1;
        this.context!.beginPath()
        this.context!.moveTo(0, 0);
        this.context!.lineTo(this.resolution.width, 0);
        this.context!.lineTo(this.resolution.width, this.resolution.height);
        this.context!.lineTo(0, this.resolution.height);
        this.context!.lineTo(0, 0);
        this.context!.lineTo(this.resolution.width, this.resolution.height);
        this.context!.stroke();
        this.context!.closePath();
    }
}
