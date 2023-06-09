import { Color } from "./Color";

export class Texture {

    constructor(
        public name: string,
        public width: number,
        public height: number,
        public data: Array<Color> = [...new Array(width * height).keys()].map(() => new Color())
    ) { }

    public drawPixel(x: number, y: number, color: Color): void {

        let index = (y * this.width + x);
        this.data[index] = color;
    }

    public getPixelColor(x: number, y: number): Color {

        return this.data[y * this.width + x];
    }

    public sampleColor(x: number, y: number): Color {

        const sx = Math.min(Math.trunc((x * this.width)), this.width - 1);
		const sy = Math.min(Math.trunc((y * this.height)), this.height - 1);
		return this.getPixelColor(sx, sy);
    }
}
