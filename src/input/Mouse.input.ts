import { TypedEvent } from "../core/TypedEvent";
import { Vec2D } from "../core/Vec2D";

export class MouseInput {

    private havePointerLock: boolean = false;
    private locked: boolean = false;
    public onClick = new TypedEvent<{ point: Vec2D, button: number }>();
    public onMove = new TypedEvent<Vec2D>();

    private clickCallback = (ev: MouseEvent) => this.clickEvent(ev)
    private moveCallback = (ev: MouseEvent) => this.moveEvent(ev);
    private changeCallback = () => this.changeEvent();

    constructor(private element: HTMLElement) {

        this.havePointerLock =
            'pointerLockElement' in document
            || 'mozPointerLockElement' in document
            || 'webkitPointerLockElement' in document;

        if (!this.havePointerLock) alert('Pointer lock not available');
    }

    public initialize(): void {

        if (!this.havePointerLock) return;

        this.element.addEventListener("click", this.clickCallback);
    }

    private clickEvent(ev: MouseEvent): void {

        const rect = (this.element as HTMLCanvasElement).getBoundingClientRect();
        const point = new Vec2D(ev.clientX - rect.left, ev.clientY - rect.top);
        this.onClick.emit({ point, button: ev.buttons });

        if (this.locked) return;

        document.addEventListener('pointerlockchange', this.changeCallback, false);

        this.element.requestPointerLock();
    }

    private changeEvent(): void {

        if (document.pointerLockElement === this.element) {

            this.locked = true;
            document.addEventListener("mousemove", this.moveCallback, false);
        } else {

            this.locked = false;
            document.removeEventListener("mousemove", this.moveCallback, false);
        }
    }

    private moveEvent(e: MouseEvent) {

        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;
        this.onMove.emit(new Vec2D(movementX, movementY));
    }

    public release(): void {

        document.exitPointerLock();
    }
}
