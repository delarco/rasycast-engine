import { Size } from "./Size";
import { Tile } from "./Tile";
import { Vec2D } from "./Vec2D";

// Placeholder map
const map = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
]

export var tileMap = {

    size: new Size(10, 10),
    tiles: map.map(t => new Tile(new Vec2D(), t == 1))
}

for (let y = 0; y < tileMap.size.height; y++) {
    for (let x = 0; x < tileMap.size.width; x++) {
        const tile = tileMap.tiles[y * tileMap.size.width + x];
        [tile.position.x, tile.position.y] = [x, y];
    }
}
