import { GameConfig } from "./GameConfig";

export class Game {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null;
    private imageData: ImageData;
    private colorBuffer: Uint8ClampedArray;

    public get domElement(): HTMLCanvasElement {
        return this.canvas;
    }

    constructor(private config: GameConfig) {

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext("2d");

        if (!this.context) throw new Error("Context error.");

        this.canvas.width = this.config.resolution.width;
        this.canvas.height = this.config.resolution.height;
        this.canvas.style.width = `${config.viewPort.width}px`;
        this.canvas.style.height = `${config.viewPort.height}px`;

        this.imageData = this.context.getImageData(0, 0, config.resolution.width, config.resolution.height);
        this.colorBuffer = this.imageData.data;

        this.context.fillStyle = "#EEE";
        this.context.fillRect(0, 0, config.resolution.width, config.resolution.height);
    }
}
