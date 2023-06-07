import { Size } from "../core/Size";

export interface GameConfig {

    /**
     * Canvas size on screen.
     */
    viewPort: Size;

    /**
     * Canvas resolution.
     */
    resolution: Size;

    /**
     * Field of view in radians.
     */
    fieldOfView: number;
}
