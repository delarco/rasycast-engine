import { TextureUtils } from "../utils/Texture.utils";
import { Color } from "./Color";
import { Side } from "./Side";
import { Size } from "./Size";
import { Texture } from "./Texture";
import { Tile } from "./Tile";
import { Vec2D } from "./Vec2D";

// Placeholder map
const map = [
    0, 1, 1, 0, 0, 2, 0, 0, 1, 1,
    1, 0, 0, 0, 0, 2, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 2, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 2, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
]

export class Map {

    constructor(
        public name: string,
        public size: Size,
        public tiles: Array<Tile> = [],
        public skybox: Texture = new Texture('', 1, 1, [Color.BLUE])) { }

    public async load(): Promise<void> {

        this.tiles = new Array<Tile>();
        this.skybox = await TextureUtils.loadTexture('textures/skybox-night.png')!;
        
        const ground = await TextureUtils.loadTexture('textures/ground-01.png')!;
        const grass = await TextureUtils.loadTexture('textures/grass-01.png')!;
        const test = await TextureUtils.loadTexture('textures/debug.png')!;
        const north = await TextureUtils.loadTexture('textures/north.png')!;
        const south = await TextureUtils.loadTexture('textures/south.png')!;
        const west = await TextureUtils.loadTexture('textures/west.png')!;
        const east = await TextureUtils.loadTexture('textures/east.png')!;
        const banner = await TextureUtils.loadTexture('textures/banner.png')!;

        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {

                const num = map[y * this.size.width + x];

                const tile = new Tile(
                    new Vec2D(x, y),
                    num > 0,
                );

                if (num == 0) {
                    tile.texture = {
                        [Side.NORTH]: null,
                        [Side.SOUTH]: null,
                        [Side.WEST]: null,
                        [Side.EAST]: null,
                        [Side.TOP]: null,
                        [Side.BOTTOM]: ground,
                    };
                }

                if (num == 1) {
                    tile.texture = {
                        [Side.NORTH]: north,
                        [Side.SOUTH]: south,
                        [Side.WEST]: west,
                        [Side.EAST]: east,
                        [Side.TOP]: null,
                        [Side.BOTTOM]: null,
                    };
                }

                if (num == 2) {
                    tile.texture = {
                        [Side.NORTH]: test,
                        [Side.SOUTH]: test,
                        [Side.WEST]: test,
                        [Side.EAST]: test,
                        [Side.TOP]: null,
                        [Side.BOTTOM]: null,
                    };

                    tile.detail = {
                        [Side.NORTH]: banner,
                        [Side.SOUTH]: banner,
                        [Side.WEST]: banner,
                        [Side.EAST]: banner,
                        [Side.TOP]: null,
                        [Side.BOTTOM]: null,
                    };
                }

                if (x == 1 && y == 1) {
                    tile.texture![Side.TOP] = ground;
                    tile.texture![Side.BOTTOM] = grass;
                }

                this.tiles.push(tile);
            }
        }
    }

    public getTile(x: number, y: number): Tile | null {

        if (x < 0 || y < 0 || x >= this.size.width || y >= this.size.height) return null;
        return this.tiles[y * this.size.width + x];
    }
}
