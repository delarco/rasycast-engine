import { Side } from "./Side";
import { Tile } from "./Tile";
import { Vec2D } from "./Vec2D";

export interface TileHit {

    tile: Tile;
    side: Side;
    position: Vec2D;
    tx: number | null;
}
