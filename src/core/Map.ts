import { TextureUtils } from "../utils/Texture.utils";
import { Side } from "./Side";
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
        const north = await TextureUtils.loadTexture('textures/north.png')!;
        const south = await TextureUtils.loadTexture('textures/south.png')!;
        const west = await TextureUtils.loadTexture('textures/west.png')!;
        const east = await TextureUtils.loadTexture('textures/east.png')!;

        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {

                const num = map[y * this.size.width + x];

                const tile = new Tile(
                    new Vec2D(x, y),
                    num > 0,
                );

                if (num == 1) {
                    tile.wall = {
                        [Side.NORTH]: north,
                        [Side.SOUTH]: south,
                        [Side.WEST]: west,
                        [Side.EAST]: east,
                    };
                }

                if(num == 2) {
                    tile.wall = {
                        [Side.NORTH]: test,
                        [Side.SOUTH]: test,
                        [Side.WEST]: test,
                        [Side.EAST]: test,
                    };
                }

                this.tiles.push(tile);
            }
        }
    }
}
