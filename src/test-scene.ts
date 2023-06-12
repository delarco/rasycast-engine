import { Map } from "./core/Map";
import { Size } from "./core/Size";
import { Sprite } from "./core/Sprite";
import { Texture } from "./core/Texture";
import { Vec2D } from "./core/Vec2D";
import { KeyboardInput, KEYS } from "./input/Keyboard.input";
import { MapScene } from "./scene/MapScene";
import { TextureUtils } from "./utils/Texture.utils";
import { VectorUtils } from "./utils/Vector.utils";


export class TestScene extends MapScene {

    private cameraVelocity = 2.2;
    private keyboard: KeyboardInput;

    private keyTexture: Texture | null = null;
    private campFireTexture: Texture | null = null;

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

        await this.map!.load();
        this.keyTexture = await TextureUtils.loadTexture('sprites/key.png');
        this.campFireTexture = await TextureUtils.loadTexture('sprites/camp-fire.png');
    }

    public initialize(): void {

        const keySprite = new Sprite(
            1,
            'key',
            new Vec2D(1.5, 1.5),
            0,
            new Size(0.2, 0.2),
            true,
            this.keyTexture!,
            new Size(32, 32),
            1);

        const campFireSprite = new Sprite(
            2, 'fire', new Vec2D(2.5, 2.5),
            0,
            new Size(1.0, 1.0),
            true,
            this.campFireTexture!,
            new Size(32, 32),
            5);

        this.objects.push(keySprite);
        this.objects.push(campFireSprite);
    }

    public update(deltaTime: number, updateEntities: boolean): void {

        if (updateEntities) {

            for (let sprite of this.objects) {
                if (sprite instanceof Sprite) sprite.nextFrame();
            }
        }

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
