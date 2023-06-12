import { Color } from "./Color";
import { GameObject } from "./GameObject";
import { Size } from "./Size";
import { Texture } from "./Texture";
import { Vec2D } from "./Vec2D";

export class Sprite implements GameObject {

    private framesTexture: Array<Texture> | null = null;
    private currentFrameCounter = 0;

    constructor(
        public id: number,
        public name: string,
        public position: Vec2D,
        public angle: number,
        public size: Size,
        public visible: boolean,
        public texture: Texture,
        public frameSize: Size,
        public frames: number,
    ) {

        this.generateFrames();
    }
    
    public get currentFrame(): Texture {

        const sprite = this.framesTexture![this.currentFrameCounter];
        return sprite;
    }

    private generateFrames(): void {

        this.framesTexture = new Array<Texture>();

        for (let i = 0; i < this.frames; i++) {

            const startX = i * this.frameSize.width;            
            const frameTexture = new Texture(`${this.name}-${i}`, this.frameSize.width, this.frameSize.height, []);

            for (let y = 0; y < this.frameSize.height; y++) {

                for (let x = startX; x < startX + this.frameSize.width; x++) {

                    frameTexture.data.push(this.texture.getPixelColor(x, y));
                }
            }

            this.framesTexture.push(frameTexture);
        }
    }

    public getFrame(frame: number): Texture {

        return this.framesTexture![frame];
    }

    public nextFrame(): void {
        
        this.currentFrameCounter++;
        if (this.currentFrameCounter == this.frames) this.currentFrameCounter = 0;
    }

    public sampleColor(x: number, y: number): Color {
        
        return this.currentFrame.sampleColor(x, y);
    }
}
