import { Side } from "./Side";
import { Texture } from "./Texture";
import { Vec2D } from "./Vec2D";

export class Tile {

    constructor(
        public position: Vec2D,
        public solid: boolean,
        public wall?: { [key in Side]: Texture } | null,
    ) { }
}
