import { Map } from "./core/Map";
import { Size } from "./core/Size";
import { Vec2D } from "./core/Vec2D";
import { KeyboardInput, KEYS } from "./input/Keyboard.input";
import { MapScene } from "./scene/MapScene";
import { VectorUtils } from "./utils/Vector.utils";


export class TestScene extends MapScene {

    private cameraVelocity = 2.2;
    private keyboard: KeyboardInput;

    constructor() {
        super();

        this.keyboard = new KeyboardInput();

        this.camera = {
            id: 0,
            angle: 0.0,
            name: 'Player',
            position: new Vec2D(5, 5),
            size: new Size(0.3, 0.3),
            visible: false,
        };

        this.map = new Map('Test map', new Size(10, 10));
    }
    
    async preload(): Promise<void> {

        this.map!.load();
    }

    public initialize(): void {

        
    }

    public update(deltaTime: number): void {

        this.updateCamera(deltaTime);
    }

    public dispose(): void {

        
    }

    private updateCamera(deltaTime: number): void {

        if (this.keyboard.key(KEYS.ARROW_LEFT) || this.keyboard.key(KEYS.KEY_Q)) {

            this.camera.angle -= 2.5 * deltaTime;
        }

        if (this.keyboard.key(KEYS.ARROW_RIGHT) || this.keyboard.key(KEYS.KEY_E)) {

            this.camera.angle += 2.5 * deltaTime;
        }

        const mov = new Vec2D(
            Math.cos(this.camera.angle) * this.cameraVelocity * deltaTime,
            Math.sin(this.camera.angle) * this.cameraVelocity * deltaTime
        );

        const strafe = new Vec2D(
            Math.cos(this.camera.angle + Math.PI / 2) * this.cameraVelocity * deltaTime,
            Math.sin(this.camera.angle + Math.PI / 2) * this.cameraVelocity * deltaTime
        );

        if (this.keyboard.key(KEYS.ARROW_UP) || this.keyboard.key(KEYS.KEY_W)) {

            this.camera.position = VectorUtils.add(this.camera.position, mov);
        }

        if (this.keyboard.key(KEYS.ARROW_DOWN) || this.keyboard.key(KEYS.KEY_S)) {

            this.camera.position = VectorUtils.sub(this.camera.position, mov);
        }

        if (this.keyboard.key(KEYS.KEY_A)) {

            this.camera.position = VectorUtils.sub(this.camera.position, strafe);
        }

        if (this.keyboard.key(KEYS.KEY_D)) {

            this.camera.position = VectorUtils.add(this.camera.position, strafe);
        }
    }
}
