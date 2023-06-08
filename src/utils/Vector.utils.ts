import { Vec2D } from "../core/Vec2D";

export class VectorUtils {

    public static add(v1: Vec2D, v2: Vec2D): Vec2D {

        return new Vec2D(v1.x + v2.x, v1.y + v2.y);
    }

    public static sub(v1: Vec2D, v2: Vec2D): Vec2D {

        return new Vec2D(v1.x - v2.x, v1.y - v2.y);
    }
}
