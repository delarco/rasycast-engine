import { GameObject } from "../core/GameObject";
import { Map } from "../core/Map";
import { Size } from "../core/Size";
import { Vec2D } from "../core/Vec2D";
import { Scene } from "./Scene";

export class MapScene implements Scene {

    public camera: GameObject;
    public objects: GameObject[] = [];
    public ambientLight: number = 1.0;
    public map: Map | null = null;

    constructor() {

        this.camera = {
            id: 0,
            angle: 0.0,
            name: '',
            position: new Vec2D(0, 0),
            size: new Size(0.3, 0.3),
            visible: false,
        };
    }

    public async preload(): Promise<void> { }

    public initialize(): void { }

    public update(deltaTime: number): void { }

    public dispose(): void { }
}
