import { Side } from "./Side";
import { Texture } from "./Texture";
import { Vec2D } from "./Vec2D";

export class Tile {

    constructor(
        public position: Vec2D,
        public solid: boolean,
        public texture?: { [key in Side]: Texture | null } | null,
        public detail?: { [key in Side]: Texture | null } | null,
    ) {

        if(!texture) {

            this.texture = {
                [Side.NORTH]: null,
                [Side.SOUTH]: null,
                [Side.WEST]: null,
                [Side.EAST]: null,
                [Side.TOP]: null,
                [Side.BOTTOM]: null,
            };
        }

        if(!detail) {

            this.detail = {
                [Side.NORTH]: null,
                [Side.SOUTH]: null,
                [Side.WEST]: null,
                [Side.EAST]: null,
                [Side.TOP]: null,
                [Side.BOTTOM]: null,
            };
        }
    }
}
