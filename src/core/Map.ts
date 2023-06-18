import { TextureUtils } from "../utils/Texture.utils";
import { Color } from "./Color";
import { Side } from "./Side";
import { Size } from "./Size";
import { Texture } from "./Texture";
import { Tile } from "./Tile";
import { Vec2D } from "./Vec2D";

// Placeholder map
const map = [
    6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
    6, 0, 0, 0, 0, 0, 0, 0, 0, 6,
    6, 0, 0, 0, 0, 0, 0, 0, 0, 6,
    6, 0, 0, 0, 0, 0, 0, 0, 0, 6,
    6, 0, 0, 0, 0, 0, 0, 0, 0, 6,
    6, 0, 0, 0, 0, 0, 0, 0, 0, 6,
    6, 0, 0, 0, 0, 0, 0, 0, 0, 6,
    6, 0, 0, 0, 0, 0, 0, 0, 0, 6,
    6, 0, 0, 0, 0, 0, 0, 0, 0, 6,
    6, 6, 6, 6, 7, 6, 6, 6, 6, 6,
]

export class Map {

    constructor(
        public name: string,
        public size: Size,
        public tiles: Array<Tile> = [],
        public skybox: Texture = new Texture('', 1, 1, [new Color(200, 150, 150)]),
        public defaultFloor: Texture = new Texture('', 1, 1, [new Color(200, 150, 150)])) { }

    public async load(): Promise<void> {

        this.tiles = new Array<Tile>();
        this.skybox = await TextureUtils.loadTexture('textures/skybox-night.png')!;
        this.defaultFloor = await TextureUtils.loadTexture('textures/grass-01.png')!;
        
        const ground = await TextureUtils.loadTexture('textures/ground-01.png')!;
        const grass = await TextureUtils.loadTexture('textures/grass-01.png')!;
        const test = await TextureUtils.loadTexture('textures/debug.png')!;
        const north = await TextureUtils.loadTexture('textures/north.png')!;
        const south = await TextureUtils.loadTexture('textures/south.png')!;
        const west = await TextureUtils.loadTexture('textures/west.png')!;
        const east = await TextureUtils.loadTexture('textures/east.png')!;
        const banner = await TextureUtils.loadTexture('textures/banner.png')!;
        const rocks = await TextureUtils.loadTexture('textures/rocks.png')!;
        const window = await TextureUtils.loadTexture('textures/window.png')!;
        const windowBig = await TextureUtils.loadTexture('textures/window-big.png')!;
        const wall = await TextureUtils.loadTexture('textures/wall-0.png')!;
        const wallWindow = await TextureUtils.loadTexture('textures/wall-0-window.png')!;
        const floor = await TextureUtils.loadTexture('textures/floor.jpg')!;
        const ceiling = await TextureUtils.loadTexture('textures/ceiling-0.png')!;
        //const lightSwitch = await TextureUtils.loadTexture('textures/light-switch.png')!;

        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {

                const num = map[y * this.size.width + x];

                const tile = new Tile(
                    new Vec2D(x, y),
                    num > 0,
                );

                tile.texture = {
                    [Side.NORTH]: null,
                    [Side.SOUTH]: null,
                    [Side.WEST]: null,
                    [Side.EAST]: null,
                    [Side.TOP]: ceiling,
                    [Side.BOTTOM]: floor,
                };

                if (num == 1) {
                    tile.texture = {
                        [Side.NORTH]: north,
                        [Side.SOUTH]: south,
                        [Side.WEST]: west,
                        [Side.EAST]: east,
                        [Side.TOP]: ceiling,
                        [Side.BOTTOM]: floor,
                    };
                }

                if (num == 2) {
                    tile.texture = {
                        [Side.NORTH]: test,
                        [Side.SOUTH]: test,
                        [Side.WEST]: test,
                        [Side.EAST]: test,
                        [Side.TOP]: ceiling,
                        [Side.BOTTOM]: floor,
                    };

                    tile.detail = {
                        [Side.NORTH]: banner,
                        [Side.SOUTH]: banner,
                        [Side.WEST]: banner,
                        [Side.EAST]: banner,
                        [Side.TOP]: ceiling,
                        [Side.BOTTOM]: floor,
                    };
                }

                if (num == 3) {
                    tile.texture = {
                        [Side.NORTH]: ground,
                        [Side.SOUTH]: ground,
                        [Side.WEST]: ground,
                        [Side.EAST]: ground,
                        [Side.TOP]: ceiling,
                        [Side.BOTTOM]: floor,
                    };
                }

                if (num == 4) {
                    tile.texture = {
                        [Side.NORTH]: rocks,
                        [Side.SOUTH]: rocks,
                        [Side.WEST]: rocks,
                        [Side.EAST]: rocks,
                        [Side.TOP]: ceiling,
                        [Side.BOTTOM]: floor,
                    };
                }

                if (num == 5) {
                    tile.texture = {
                        [Side.NORTH]: window,
                        [Side.SOUTH]: window,
                        [Side.WEST]: window,
                        [Side.EAST]: window,
                        [Side.TOP]: ceiling,
                        [Side.BOTTOM]: floor,
                    };
                }

                if (num == 6) {
                    tile.texture = {
                        [Side.NORTH]: wall,
                        [Side.SOUTH]: wall,
                        [Side.WEST]: wall,
                        [Side.EAST]: wall,
                        [Side.TOP]: ceiling,
                        [Side.BOTTOM]: floor,
                    };
                }
                if (num == 7) {
                    tile.texture = {
                        [Side.NORTH]: wallWindow,
                        [Side.SOUTH]: wallWindow,
                        [Side.WEST]: wallWindow,
                        [Side.EAST]: wallWindow,
                        [Side.TOP]: ceiling,
                        [Side.BOTTOM]: floor,
                    };
                }

                //tile.texture[Side.BOTTOM] = ground;

                //if (x == 1 && y <= 3) {
                    //tile.texture![Side.TOP] = grass;
                    //tile.texture![Side.BOTTOM] = rocks;
                //}

                if(x == 3 && y == 9) {

                    tile.detail![Side.NORTH] = await TextureUtils.loadTexture('textures/light-switch-off.png')!;
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
