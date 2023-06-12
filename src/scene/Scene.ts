export interface Scene {

    preload(): Promise<void>;
    initialize(): void;
    update(deltaTime: number): void;
    dispose(): void;
}
