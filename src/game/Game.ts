import { Color } from "../core/Color";
import { tileMap } from "../core/Map";
import { Side } from "../core/Side";
import { Size } from "../core/Size";
import { TileHit } from "../core/TileHit";
import { Vec2D } from "../core/Vec2D";
import { Renderer } from "../renderer/Renderer";
import { VectorUtils } from "../utils/Vector.utils";
import { GameConfig } from "./GameConfig";

export class Game {

    private canvas: HTMLCanvasElement;
    private resolution: Size;
    private halfResolution: Size;
    private context: CanvasRenderingContext2D | null;
    private imageData: ImageData;
    private colorBuffer: Uint8ClampedArray;
    private depthBuffer: Array<number>;
    private renderer: Renderer;
    private cameraAngle = 0.0;
    private cameraPos = new Vec2D(6, 7);
    private backgroundColor = new Color(238, 238, 238);

    public get domElement(): HTMLCanvasElement {
        return this.canvas;
    }

    constructor(private config: GameConfig) {

        this.resolution = config.resolution;
        this.halfResolution = { width: ~~(config.resolution.width / 2), height: ~~(config.resolution.height / 2) };
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext("2d");

        if (!this.context) throw new Error("Context error.");

        this.canvas.width = this.resolution.width;
        this.canvas.height = this.resolution.height;
        this.canvas.style.width = `${config.viewPort.width}px`;
        this.canvas.style.height = `${config.viewPort.height}px`;

        this.imageData = this.context.getImageData(0, 0, this.resolution.width, this.resolution.height);
        this.colorBuffer = this.imageData.data;
        this.depthBuffer = [...new Array(this.resolution.width * this.resolution.height)].map(() => Infinity);
        this.renderer = new Renderer(this.context, this.resolution, this.imageData, this.colorBuffer);
    }

    public run(): void {

        setInterval(() => this.cameraAngle += 0.03, 100);

        const mainLoop = (timeStamp: number) => {

            timeStamp;

            this.renderer.clear(this.backgroundColor);

            this.update();

            this.renderer.updateScreen();

            requestAnimationFrame(mainLoop);
        };

        requestAnimationFrame(mainLoop);
    }

    private update(): void {

        for (let x = 0; x < this.resolution.width; x++) {

            const rayAngle = (this.cameraAngle - (this.config.fieldOfView / 2.0)) + (x / this.resolution.width) * this.config.fieldOfView;
            const rayDirection = new Vec2D(Math.cos(rayAngle), Math.sin(rayAngle));

            let rayLength = Infinity;

            let hit = this.castRay(this.cameraPos, rayDirection);

            if (hit) {

                // It has hit something, so extract information to draw column
                const ray = VectorUtils.sub(hit.position, this.cameraPos);

                // Length of ray is vital for pseudo-depth, but we'll also cosine correct to remove fisheye
                rayLength = ray.mag() * Math.cos(rayAngle - this.cameraAngle);

            }

            // Calculate locations in column that divides ceiling, wall and floor
            const fCeiling = (this.resolution.height / 2.0) - (this.resolution.height / rayLength);
            const fFloor = this.resolution.height - fCeiling;
            const fWallHeight = fFloor - fCeiling;
            const fFloorHeight = this.resolution.height - fFloor;

            // Now draw the column from top to bottom
            for (let y = 0; y < this.resolution.height; y++) {
                if (y <= Math.trunc(fCeiling)) {

                    this.renderer.drawPixel(x, y, new Color(200, 200, 255));
                }
                else if (y > Math.trunc(fCeiling) && y <= Math.trunc(fFloor)) {

                    switch (hit?.side) {
                        case Side.NORTH:
                            this.renderer.drawPixel(x, y, Color.BLUE);
                            break;

                        case Side.SOUTH:
                            this.renderer.drawPixel(x, y, Color.ORANGE);
                            break;

                        case Side.WEST:
                            this.renderer.drawPixel(x, y, Color.GREEN);
                            break;

                        case Side.EAST:
                            this.renderer.drawPixel(x, y, Color.RED);
                            break;
                    }

                }
                else {

                    this.renderer.drawPixel(x, y, new Color(200, 150, 150));
                }

            }
        }

    }

    private isLocationSolid(x: number, y: number): boolean {

        return tileMap.tiles[y * tileMap.size.width + x].solid;
    }

    private castRay(origin: Vec2D, direction: Vec2D): TileHit | null {

        let hit: TileHit | null = null;

        const rayDelta = new Vec2D(
            Math.sqrt(1 + (direction.y / direction.x) * (direction.y / direction.x)),
            Math.sqrt(1 + (direction.x / direction.y) * (direction.x / direction.y))
        );

        let mapCheck = origin.clone();
        let sideDistance = new Vec2D();
        let stepDistance = new Vec2D();

        if (direction.x < 0) {
            stepDistance.x = -1;
            sideDistance.x = (origin.x - mapCheck.x) * rayDelta.x;
        }
        else {
            stepDistance.x = 1;
            sideDistance.x = (mapCheck.x + 1.0 - origin.x) * rayDelta.x;
        }

        if (direction.y < 0) {
            stepDistance.y = -1;
            sideDistance.y = (origin.y - mapCheck.y) * rayDelta.y;
        }
        else {
            stepDistance.y = 1;
            sideDistance.y = (mapCheck.y + 1.0 - origin.y) * rayDelta.y;
        }

        const intersection = new Vec2D();
        const hitTile = new Vec2D();
        let maxDistance = 100.0;
        let distance = 0.0;
        let tileFound = false;

        while (!tileFound && distance < maxDistance) {
            if (sideDistance.x < sideDistance.y) {
                sideDistance.x += rayDelta.x;
                mapCheck.x += stepDistance.x;
            }
            else {
                sideDistance.y += rayDelta.y;
                mapCheck.y += stepDistance.y;
            }

            const rayDist = new Vec2D(
                mapCheck.x - origin.x,
                mapCheck.y - origin.y
            );

            distance = rayDist.mag();

            if (this.isLocationSolid(mapCheck.x, mapCheck.y)) {
                [hitTile.x, hitTile.y] = [mapCheck.x, mapCheck.y];
                tileFound = true;

                hit = {
                    tile: tileMap.tiles[mapCheck.y * tileMap.size.width + mapCheck.x],
                    side: Side.NONE,
                    position: new Vec2D(),
                };


                // Find accurate Hit Location

                const m = direction.y / direction.x;


                // From Top Left

                if (origin.y <= mapCheck.y) {
                    if (origin.x <= mapCheck.x) {
                        hit.side = Side.WEST;
                        intersection.y = m * (mapCheck.x - origin.x) + origin.y;
                        intersection.x = mapCheck.x;
                        //hit.fSampleX = vIntersection.y - std::floor(vIntersection.y);
                    }
                    else if (origin.x >= (mapCheck.x + 1)) {
                        hit.side = Side.EAST;
                        intersection.y = m * ((mapCheck.x + 1) - origin.x) + origin.y;
                        intersection.x = mapCheck.x + 1;
                        //hit.fSampleX = vIntersection.y - std::floor(vIntersection.y);
                    }
                    else {
                        hit.side = Side.NORTH;
                        intersection.y = mapCheck.y;
                        intersection.x = (mapCheck.y - origin.y) / m + origin.x;
                        //hit.fSampleX = intersection.x - std::floor(intersection.x);
                    }


                    if (intersection.y < mapCheck.y) {
                        hit.side = Side.NORTH;
                        intersection.y = mapCheck.y;
                        intersection.x = (mapCheck.y - origin.y) / m + origin.x;
                        //hit.fSampleX = intersection.x - std::floor(intersection.x);
                    }
                }
                else if (origin.y >= mapCheck.y + 1) {
                    if (origin.x <= mapCheck.x) {
                        hit.side = Side.WEST;
                        intersection.y = m * (mapCheck.x - origin.x) + origin.y;
                        intersection.x = mapCheck.x;
                        //hit.fSampleX = intersection.y - std::floor(intersection.y);
                    }
                    else if (origin.x >= (mapCheck.x + 1)) {
                        hit.side = Side.EAST;
                        intersection.y = m * ((mapCheck.x + 1) - origin.x) + origin.y;
                        intersection.x = mapCheck.x + 1;
                        //hit.fSampleX = intersection.y - std::floor(intersection.y);
                    }
                    else {
                        hit.side = Side.SOUTH;
                        intersection.y = mapCheck.y + 1;
                        intersection.x = ((mapCheck.y + 1) - origin.y) / m + origin.x;
                        //hit.fSampleX = intersection.x - std::floor(intersection.x);
                    }

                    if (intersection.y > (mapCheck.y + 1)) {
                        hit.side = Side.SOUTH;
                        intersection.y = mapCheck.y + 1;
                        intersection.x = ((mapCheck.y + 1) - origin.y) / m + origin.x;
                        //hit.fSampleX = intersection.x - std::floor(intersection.x);
                    }
                }
                else {
                    if (origin.x <= mapCheck.x) {
                        hit.side = Side.WEST;
                        intersection.y = m * (mapCheck.x - origin.x) + origin.y;
                        intersection.x = mapCheck.x;
                        //hit.fSampleX = intersection.y - std::floor(intersection.y);
                    }
                    else if (origin.x >= (mapCheck.x + 1)) {
                        hit.side = Side.EAST;
                        intersection.y = m * ((mapCheck.x + 1) - origin.x) + origin.y;
                        intersection.x = mapCheck.x + 1;
                        //hit.fSampleX = intersection.y - std::floor(intersection.y);
                    }
                }

                hit.position = intersection;
            }
        }

        return hit;
    }


}
