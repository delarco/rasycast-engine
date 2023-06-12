import { Clock } from "../core/Clock";
import { Color } from "../core/Color";
import { Map } from "../core/Map";
import { Side } from "../core/Side";
import { Size } from "../core/Size";
import { Sprite } from "../core/Sprite";
import { TileHit } from "../core/TileHit";
import { Vec2D } from "../core/Vec2D";
import { Renderer } from "../renderer/Renderer";
import { MapScene } from "../scene/MapScene";
import { Scene } from "../scene/Scene";
import { VectorUtils } from "../utils/Vector.utils";
import { GameConfig } from "./GameConfig";

export class Game {

    private canvas: HTMLCanvasElement;
    private resolution: Size;
    private halfResolution: Size;
    private renderer: Renderer;
    private clock = new Clock();
    private scenes: Array<Scene> = [];

    public get domElement(): HTMLCanvasElement {
        return this.canvas;
    }

    constructor(private config: GameConfig) {

        this.resolution = config.resolution;
        this.halfResolution = { width: ~~(config.resolution.width / 2), height: ~~(config.resolution.height / 2) };
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.resolution.width;
        this.canvas.height = this.resolution.height;
        this.canvas.style.width = `${config.viewPort.width}px`;
        this.canvas.style.height = `${config.viewPort.height}px`;
        this.renderer = new Renderer(this.canvas, this.resolution);
    }

    public addScene(scene: Scene) {

        this.scenes.push(scene);
    }

    public async run(): Promise<void> {

        for (let scene of this.scenes) await scene.preload();
        for (let scene of this.scenes) scene.initialize();

        const mainLoop = (timeStamp: number) => {

            this.clock.tick(timeStamp);
            document.title = this.clock.fps.toString();

            this.renderer.clear(this.config.backgroundColor);

            for (let scene of this.scenes) {                

                scene.update(this.clock.deltaTime, this.clock.updateEntities);

                if (scene instanceof MapScene) {

                    this.drawMap(scene);
                    this.drawSprites(scene);
                }
            }

            this.renderer.updateScreen();

            requestAnimationFrame(mainLoop);
        };

        requestAnimationFrame(mainLoop);
    }

    private getSkyboxColor(scene: MapScene, rayAngle: number, y: number): Color {

        let tx = rayAngle * (1 / (2 * Math.PI)) % 1;
        if (tx < 0) tx = 1 + tx;
        const ty = y / (this.resolution.height - 1);
        return scene.map!.skybox.sampleColor(tx, ty);
    }

    private drawMap(scene: MapScene): void {

        for (let x = 0; x < this.resolution.width; x++) {

            const rayAngle = (scene.camera.angle - (this.config.fieldOfView / 2.0)) + (x / this.resolution.width) * this.config.fieldOfView;
            const rayDirection = new Vec2D(Math.cos(rayAngle), Math.sin(rayAngle));

            let rayLength = Infinity;

            let hit = this.castRay(scene, scene.camera.position, rayDirection);

            if (hit) {

                const ray = new Vec2D(
                    hit.position.x - scene.camera.position.x,
                    hit.position.y - scene.camera.position.y,
                );

                rayLength = ray.mag() * Math.cos(rayAngle - scene.camera.angle);
            }

            const fCeiling = (this.resolution.height / 2.0) - (this.resolution.height / rayLength);
            const fFloor = this.resolution.height - fCeiling;
            const fWallHeight = fFloor - fCeiling;

            for (let y = 0; y < this.resolution.height; y++) {

                if (y <= Math.trunc(fCeiling)) {

                    const planeZ = this.halfResolution.height / (this.halfResolution.height - y);
                    const planePoint = VectorUtils.add(scene.camera.position, VectorUtils.mul(rayDirection, planeZ * 2.0 / Math.cos(rayAngle - scene.camera.angle)));
                    const tilePos = VectorUtils.int(planePoint);
                    const tex = new Vec2D(planePoint.x - tilePos.x, planePoint.y - tilePos.y);
                    const tile = scene.map!.getTile(tilePos.y, tilePos.x);
                    let color: Color | null = null;

                    if (tile?.texture && tile.texture[Side.TOP]) {

                        color = tile.texture[Side.TOP].sampleColor(tex.x, tex.y);
                        color = Color.shade(color, scene.ambientLight);
                    }

                    if (!color) color = this.getSkyboxColor(scene, rayAngle, y);

                    this.renderer.drawPixel(x, y, color);
                }
                else if (y > Math.trunc(fCeiling) && y <= Math.trunc(fFloor)) {

                    let ty = (y - fCeiling) / fWallHeight;
                    let color = hit!.tile!.texture![hit!.side!]!.sampleColor(hit!.tx!, ty);

                    if (hit!.tile.detail) {

                        const detailColor = hit!.tile.detail![hit!.side!]!.sampleColor(hit!.tx!, ty);
                        if (detailColor.a == 255) color = detailColor;
                    }

                    const ray = new Vec2D(
                        hit!.position.x - scene.camera.position.x,
                        hit!.position.y - scene.camera.position.y,
                    );

                    color = Color.shade(color, scene.ambientLight);

                    if (color.a != 255) color = this.getSkyboxColor(scene, rayAngle, y);

                    this.renderer.depthDrawPixel(x, y, ray.mag(), color);
                }
                else {

                    const planeZ = this.halfResolution.height / (y - this.halfResolution.height);
                    const planePoint = VectorUtils.add(scene.camera.position, VectorUtils.mul(rayDirection, planeZ * 2.0 / Math.cos(rayAngle - scene.camera.angle)));
                    const tilePos = VectorUtils.int(planePoint);
                    const tex = new Vec2D(planePoint.x - tilePos.x, planePoint.y - tilePos.y);
                    const tile = scene.map!.getTile(tilePos.y, tilePos.x);
                    let color = scene.map!.defaultFloor.sampleColor(tex.x, tex.y);

                    if (tile?.texture && tile.texture[Side.BOTTOM]) {

                        color = tile.texture[Side.BOTTOM].sampleColor(tex.x, tex.y);
                        color = Color.shade(color, scene.ambientLight);
                    }

                    this.renderer.drawPixel(x, y, color);
                }
            }


        }
    }

    private drawSprites(scene: MapScene): void {

        for (let sprite of scene.objects) {

            if (!sprite.visible || !(sprite instanceof Sprite)) continue;

            const object: Vec2D = VectorUtils.sub(sprite.position, scene.camera.position);
            const distanceToObject = object.mag();

            let objectAngle = Math.atan2(object.y, object.x) - scene.camera.angle;
            if (objectAngle < -3.14159) objectAngle += 2.0 * 3.14159;
            if (objectAngle > 3.14159) objectAngle -= 2.0 * 3.14159;

            const inPlayerFOV = Math.abs(objectAngle) < (this.config.fieldOfView + (1.0 / distanceToObject)) / 2.0;

            if (inPlayerFOV && distanceToObject >= 0.5) {

                const floorPoint = new Vec2D(
                    (0.5 * ((objectAngle / (this.config.fieldOfView * 0.5))) + 0.5) * this.resolution.width,
                    (this.resolution.height / 2.0) + (this.resolution.height / distanceToObject) / Math.cos(objectAngle / 2.0)
                );

                const objectSize = new Size(sprite.size.width, sprite.size.height);

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

                        let color = sprite.sampleColor(sampleX, sampleY);
                        color = Color.shade(color, scene.ambientLight);

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
    }

    private isLocationSolid(map: Map, x: number, y: number): boolean {

        if (x < 0 || y < 0) return false;
        if (x >= map.size.width || y >= map.size.height) return false;

        return map.tiles[y * map.size.width + x].solid;
    }

    private castRay(scene: MapScene, origin: Vec2D, direction: Vec2D): TileHit | null {

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

            if (this.isLocationSolid(scene.map!, mapCheck.x, mapCheck.y)) {
                [hitTile.x, hitTile.y] = [mapCheck.x, mapCheck.y];
                tileFound = true;

                hit = {
                    tile: scene.map!.tiles[mapCheck.y * scene.map!.size.width + mapCheck.x],
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
