export class Color {

    public static readonly WHITE = new Color(255, 255, 255);
    public static readonly BLACK = new Color(0, 0, 0);
    public static readonly RED = new Color(255, 0, 0);
    public static readonly GREEN = new Color(0, 255, 0);
    public static readonly BLUE = new Color(0, 0, 255);
    public static readonly YELLOW = new Color(255, 255, 0);
    public static readonly ORANGE = new Color(255, 160, 0);

    constructor(
        public r: number = 0,
        public g: number = 0,
        public b: number = 0,
        public a: number = 255) { }

    public get RGB(): string {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    public get RGBA(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    public shade(shade: number = 0.6): void {

        this.r *= shade;
        this.g *= shade;
        this.b *= shade;
    }

    public static shade(color: Color, shade: number = 0.6): Color {

        return new Color(color.r * shade, color.g * shade, color.b * shade,);
    }

    public clone(): Color {

        return new Color(this.r, this.g, this.b, this.a);
    }
}
