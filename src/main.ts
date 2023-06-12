import './style.css'
import { Color } from './core/Color';
import { Game } from './game/Game'
import { TestScene } from './test-scene';

const app = document.querySelector<HTMLDivElement>("#app")!;

const game = new Game({ 
    viewPort: { width: 800, height: 600},
    resolution: {width: 360, height: 240 },
    fieldOfView: Math.PI / 3,
    backgroundColor: new Color(238, 238, 238),
});

app.appendChild(game.domElement);

const scene = new TestScene();
game.addScene(scene);

game.run();
