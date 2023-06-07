import { Game } from './game/Game'
import './style.css'

const app = document.querySelector<HTMLDivElement>("#app")!;

const game = new Game({ 
    viewPort: { width: 800, height: 600},
    resolution: {width: 360, height: 240 },
});

app.appendChild(game.domElement);
