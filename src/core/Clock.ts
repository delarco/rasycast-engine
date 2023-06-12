export class Clock {

    private fpsCounter: number = 0;
    private previousTime: number = 0;
    private previousFpsTime: number = 0;

    private updatesPerSecond = 1000 / 20;
    private updatePreviousTime: number = 0;
    private _updateEntities: boolean = false;

    public deltaTime: number = 0;
    public fps: number = 0;

    public get updateEntities() {

        return this._updateEntities;
    }

    public tick(currentTime: number): void {

        this.fpsCounter++;

        this.deltaTime = (currentTime - this.previousTime) * 0.001;
        this.previousTime = currentTime;

        if (currentTime - this.previousFpsTime >= 500) {

            this.previousFpsTime = currentTime;
            this.fps = this.fpsCounter * 2;
            this.fpsCounter = 0;
        }

        if(currentTime - this.updatePreviousTime >= this.updatesPerSecond) {

            this._updateEntities = true;
            this.updatePreviousTime = currentTime;
        }
        else {
            
            this._updateEntities = false;
        }
    }
}
