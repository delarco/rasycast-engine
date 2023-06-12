import { Clock } from "../core/Clock";
import { Color } from "../core/Color";
import { Map } from "../core/Map";
import { Side } from "../core/Side";
import { Size } from "../core/Size";
import { Texture } from "../core/Texture";
import { TileHit } from "../core/TileHit";
import { Vec2D } from "../core/Vec2D";
import { Keyboard, KEYS } from "../input/Keyboard";
import { Renderer } from "../renderer/Renderer";
import { TextureUtils } from "../utils/Texture.utils";
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
    private cameraPos = new Vec2D(6.5, 7.5);
    private backgroundColor = new Color(238, 238, 238);
    private clock = new Clock();
    private map: Map;
    private sprite: Texture | null = null;
    private spritePosition = new Vec2D(1.5, 1.5);
    private spriteSize = new Size(0.2, 0.2);
    private keyboard = new Keyboard();
    private cameraVelocity = 2.2;

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
        this.renderer = new Renderer(this.context, this.resolution, this.imageData, this.colorBuffer, this.depthBuffer);

        this.map = new Map('', new Size(10, 10));
    }

    public async run(): Promise<void> {

        await this.map.load();
        this.sprite = await TextureUtils.loadTexture('sprites/key.png');

        const mainLoop = (timeStamp: number) => {

            this.clock.tick(timeStamp);
            document.title = this.clock.fps.toString();

            this.renderer.clear(this.backgroundColor);

            this.update(this.clock.deltaTime);

            requestAnimationFrame(mainLoop);
        };

        requestAnimationFrame(mainLoop);
    }

    private update(deltaTime: number): void {

        this.updateCamera(deltaTime);
        this.drawMap();
        this.drawSprite();
        this.renderer.updateScreen();
    }

    private updateCamera(deltaTime: number): void {

        if (this.keyboard.key(KEYS.ARROW_LEFT) || this.keyboard.key(KEYS.KEY_Q)) {

            this.cameraAngle -= 2.5 * deltaTime;
        }

        if (this.keyboard.key(KEYS.ARROW_RIGHT) || this.keyboard.key(KEYS.KEY_E)) {

            this.cameraAngle += 2.5 * deltaTime;
        }

        const mov = new Vec2D(
            Math.cos(this.cameraAngle) * this.cameraVelocity * deltaTime,
            Math.sin(this.cameraAngle) * this.cameraVelocity * deltaTime
        );

        const strafe = new Vec2D(
            Math.cos(this.cameraAngle + Math.PI / 2) * this.cameraVelocity * deltaTime,
            Math.sin(this.cameraAngle + Math.PI / 2) * this.cameraVelocity * deltaTime
        );

        if (this.keyboard.key(KEYS.ARROW_UP) || this.keyboard.key(KEYS.KEY_W)) {

            this.cameraPos = VectorUtils.add(this.cameraPos, mov);
        }

        if (this.keyboard.key(KEYS.ARROW_DOWN) || this.keyboard.key(KEYS.KEY_S)) {

            this.cameraPos = VectorUtils.sub(this.cameraPos, mov);
        }

        if (this.keyboard.key(KEYS.KEY_A)) {

            this.cameraPos = VectorUtils.sub(this.cameraPos, strafe);
        }

        if (this.keyboard.key(KEYS.KEY_D)) {

            this.cameraPos = VectorUtils.add(this.cameraPos, strafe);
        }
    }

    private drawMap(): void {

        const floorColor = new Color(200, 150, 150);
        const ceilingColor = new Color(200, 200, 255);

        for (let x = 0; x < this.resolution.width; x++) {

            const rayAngle = (this.cameraAngle - (this.config.fieldOfView / 2.0)) + (x / this.resolution.width) * this.config.fieldOfView;
            const rayDirection = new Vec2D(Math.cos(rayAngle), Math.sin(rayAngle));

            let rayLength = Infinity;

            let hit = this.castRay(this.cameraPos, rayDirection);

            if (hit) {

                const ray = new Vec2D(
                    hit.position.x - this.cameraPos.x,
                    hit.position.y - this.cameraPos.y,
                );

                rayLength = ray.mag() * Math.cos(rayAngle - this.cameraAngle);
            }

            const fCeiling = (this.resolution.height / 2.0) - (this.resolution.height / rayLength);
            const fFloor = this.resolution.height - fCeiling;
            const fWallHeight = fFloor - fCeiling;
            const fFloorHeight = this.resolution.height - fFloor;

            for (let y = 0; y < this.resolution.height; y++) {

                if (y <= Math.trunc(fCeiling)) {

                    this.renderer.drawPixel(x, y, ceilingColor);
                }
                else if (y > Math.trunc(fCeiling) && y <= Math.trunc(fFloor)) {

                    let ty = (y - fCeiling) / fWallHeight;
                    let color = hit!.tile.wall![hit!.side!].sampleColor(hit!.tx!, ty);
                    
                    if(hit!.tile.detail) {
                        const detailColor = hit!.tile.detail![hit!.side!].sampleColor(hit!.tx!, ty);

                        if(detailColor.a == 255) color = detailColor;
                    }

                    const ray = new Vec2D(
                        hit!.position.x - this.cameraPos.x,
                        hit!.position.y - this.cameraPos.y,
                    );

                    this.renderer.depthDrawPixel(x, y, ray.mag(), color);
                }
                else {

                    this.renderer.drawPixel(x, y, floorColor);
                }
            }


        }
    }

    private drawSprite(): void {

        const object: Vec2D = VectorUtils.sub(this.spritePosition, this.cameraPos);
        const distanceToObject = object.mag();

        let objectAngle = Math.atan2(object.y, object.x) - this.cameraAngle;
        if (objectAngle < -3.14159) objectAngle += 2.0 * 3.14159;
        if (objectAngle > 3.14159) objectAngle -= 2.0 * 3.14159;

        const inPlayerFOV = Math.abs(objectAngle) < (this.config.fieldOfView + (1.0 / distanceToObject)) / 2.0;

        if (inPlayerFOV && distanceToObject >= 0.5) {

            const floorPoint = new Vec2D(
                (0.5 * ((objectAngle / (this.config.fieldOfView * 0.5))) + 0.5) * this.resolution.width,
                (this.resolution.height / 2.0) + (this.resolution.height / distanceToObject) / Math.cos(objectAngle / 2.0)
            );

            const objectSize = new Size(this.spriteSize.width, this.spriteSize.height);

            objectSize.width *= 2.0 * this.resolution.height;
            objectSize.height *= 2.0 * this.resolution.height;

            objectSize.width /= distanceToObject;
            objectSize.height /= distanceToObject;

            const objectTopLeft = new Vec2D(
                floorPoint.x - objectSize.width / 2.0,
                floorPoint.y - objectSize.height
            );

            for (let y = 0; y < objectSize.height; y++) {
                for (let x = 0; x < objectSize.width; x++) {

                    const sampleX = x / objectSize.width;
                    const sampleY = y / objectSize.height;

                    const color = this.sprite!.sampleColor(sampleX, sampleY);

                    const screenPos = new Vec2D(
                        Math.trunc(objectTopLeft.x + x),
                        Math.trunc(objectTopLeft.y + y)
                    );

                    if (screenPos.x >= 0 && screenPos.x < this.resolution.width && screenPos.y >= 0 && screenPos.y < this.resolution.height && color.a == 255) {

                        this.renderer.depthDrawPixel(screenPos.x, screenPos.y, distanceToObject, color);
                    }
                }
            }
        }

    }

    private isLocationSolid(x: number, y: number): boolean {

        return this.map.tiles[y * this.map.size.width + x].solid;
    }

    private castRay(origin: Vec2D, direction: Vec2D): TileHit | null {

        let hit: TileHit | null = null;

        const rayDelta = new Vec2D(
            Math.sqrt(1 + (direction.y / direction.x) * (direction.y / direction.x)),
            Math.sqrt(1 + (direction.x / direction.y) * (direction.x / direction.y))
        );

        let mapCheck = VectorUtils.int(origin.clone());
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
                    tile: this.map.tiles[mapCheck.y * this.map.size.width + mapCheck.x],
                    side: null,
                    position: new Vec2D(),
                    tx: null,
                };


                // Find accurate Hit Location

                const m = direction.y / direction.x;


                // From Top Left

                if (origin.y <= mapCheck.y) {
                    if (origin.x <= mapCheck.x) {
                        hit.side = Side.WEST;
                        intersection.y = m * (mapCheck.x - origin.x) + origin.y;
                        intersection.x = mapCheck.x;
                        hit.tx = intersection.y - Math.floor(intersection.y);
                    }
                    else if (origin.x >= (mapCheck.x + 1)) {
                        hit.side = Side.EAST;
                        intersection.y = m * ((mapCheck.x + 1) - origin.x) + origin.y;
                        intersection.x = mapCheck.x + 1;
                        hit.tx = 1.0 - (intersection.y - Math.floor(intersection.y));
                    }
                    else {
                        hit.side = Side.NORTH;
                        intersection.y = mapCheck.y;
                        intersection.x = (mapCheck.y - origin.y) / m + origin.x;
                        hit.tx = 1.0 - (intersection.x - Math.floor(intersection.x));
                    }

                    if (intersection.y < mapCheck.y) {
                        hit.side = Side.NORTH;
                        intersection.y = mapCheck.y;
                        intersection.x = (mapCheck.y - origin.y) / m + origin.x;
                        hit.tx = 1.0 - (intersection.x - Math.floor(intersection.x));
                    }
                }
                else if (origin.y >= mapCheck.y + 1) {
                    if (origin.x <= mapCheck.x) {
                        hit.side = Side.WEST;
                        intersection.y = m * (mapCheck.x - origin.x) + origin.y;
                        intersection.x = mapCheck.x;
                        hit.tx = intersection.y - Math.floor(intersection.y);
                    }
                    else if (origin.x >= (mapCheck.x + 1)) {
                        hit.side = Side.EAST;
                        intersection.y = m * ((mapCheck.x + 1) - origin.x) + origin.y;
                        intersection.x = mapCheck.x + 1;
                        hit.tx = 1.0 - (intersection.y - Math.floor(intersection.y));
                    }
                    else {
                        hit.side = Side.SOUTH;
                        intersection.y = mapCheck.y + 1;
                        intersection.x = ((mapCheck.y + 1) - origin.y) / m + origin.x;
                        hit.tx = intersection.x - Math.floor(intersection.x);
                    }

                    if (intersection.y > (mapCheck.y + 1)) {
                        hit.side = Side.SOUTH;
                        intersection.y = mapCheck.y + 1;
                        intersection.x = ((mapCheck.y + 1) - origin.y) / m + origin.x;
                        hit.tx = intersection.x - Math.floor(intersection.x);
                    }
                }
                else {
                    if (origin.x <= mapCheck.x) {
                        hit.side = Side.WEST;
                        intersection.y = m * (mapCheck.x - origin.x) + origin.y;
                        intersection.x = mapCheck.x;
                        hit.tx = intersection.y - Math.floor(intersection.y);
                    }
                    else if (origin.x >= (mapCheck.x + 1)) {
                        hit.side = Side.EAST;
                        intersection.y = m * ((mapCheck.x + 1) - origin.x) + origin.y;
                        intersection.x = mapCheck.x + 1;
                        hit.tx = 1.0 - (intersection.y - Math.floor(intersection.y));
                    }
                }

                hit.position = intersection;
            }
        }

        return hit;
    }
}
