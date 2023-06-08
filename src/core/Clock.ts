export class Clock {

    private fpsCounter: number = 0;
    private previousTime: number = 0;
    private previousFpsTime: number = 0;

    public deltaTime: number = 0;
    public fps: number = 0;

    public tick(currentTime: number): void {

        this.fpsCounter++;

        this.deltaTime = (currentTime - this.previousTime) * 0.001;
        this.previousTime = currentTime;

        if (currentTime - this.previousFpsTime >= 500) {

            this.previousFpsTime = currentTime;
            this.fps = this.fpsCounter * 2;
            this.fpsCounter = 0;
        }
    }
}
