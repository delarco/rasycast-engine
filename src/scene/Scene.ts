export interface Scene {

    preload(): Promise<void>;
    initialize(): void;
    update(deltaTime: number, updateEntities: boolean): void;
    dispose(): void;
}
