import { Size } from "./Size";
import { Vec2D } from "./Vec2D";

export interface GameObject {

    id: number;
    name: string;
    position: Vec2D;
    angle: number;
    size: Size;
    visible: boolean;
}
