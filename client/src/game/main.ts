import Phaser from "phaser";
import { GameScene } from "./scenes/gameScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  backgroundColor: "#b6d53c",
  physics: { default: "arcade" },
  pixelArt: true,
  scene: [GameScene],
};

const StartGame = (parent: string) => {
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;
