import { TextureUtils } from "../utils/Texture.utils";
import { Size } from "./Size";
import { Tile } from "./Tile";
import { Vec2D } from "./Vec2D";

// Placeholder map
const map = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 2, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 2, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 2, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 2, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
]

export class Map {

    constructor(
        public name: string,
        public size: Size,
        public tiles: Array<Tile> = []) { }

    public async load(): Promise<void> {

        this.tiles = new Array<Tile>();

        const wall = await TextureUtils.loadTexture('textures/ground-01.png')!;
        const test = await TextureUtils.loadTexture('textures/debug.png')!;

        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {

                const num = map[y * this.size.width + x];

                const tile = new Tile(
                    new Vec2D(x, y),
                    num > 0,
                    num == 1 ? wall : test
                );
                this.tiles.push(tile);
            }
        }
    }
}
