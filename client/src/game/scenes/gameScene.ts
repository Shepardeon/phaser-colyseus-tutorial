import { Scene } from "phaser";
import { Callbacks, Client, Room } from "@colyseus/sdk";

export class GameScene extends Scene {
  client: Client;
  room: Room;
  playerEntities: {
    [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  };

  // local input cache
  inputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  cursorKey?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("GameScene");
    this.client = new Client(`${location.protocol}//${location.hostname}:2567`);
    this.playerEntities = {};
  }

  preload() {
    this.load.image(
      "ship_0001",
      "https://cdn.jsdelivr.net/gh/colyseus/tutorial-phaser@master/client/dist/assets/ship_0001.png",
    );

    this.cursorKey = this.input.keyboard?.createCursorKeys();
  }

  async create() {
    await this.connect();
    const callbacks = Callbacks.get(this.room);

    // listen for new players
    callbacks.onAdd("players", (player: any, sessionId) => {
      const entity = this.physics.add.image(player.x, player.y, "ship_0001");
      this.playerEntities[sessionId as string] = entity;

      callbacks.onChange(player, () => {
        entity.setData("serverX", player.x);
        entity.setData("serverY", player.y);
      });
    });

    callbacks.onRemove("players", (_player, sessionId) => {
      const entity = this.playerEntities[sessionId as string];
      if (entity) {
        entity.destroy();
        delete this.playerEntities[sessionId as string];
      }
    });
  }

  update(time: number, delta: number): void {
    if (!this.room) return;

    this.inputPayload.left = this.cursorKey?.left.isDown || false;
    this.inputPayload.right = this.cursorKey?.right.isDown || false;
    this.inputPayload.up = this.cursorKey?.up.isDown || false;
    this.inputPayload.down = this.cursorKey?.down.isDown || false;
    this.room.send("input", this.inputPayload);

    for (let sessionId in this.playerEntities) {
      const entity = this.playerEntities[sessionId];
      const { serverX, serverY } = entity.data.values;

      entity.x = Phaser.Math.Linear(entity.x, serverX, 0.2);
      entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2);
    }
  }

  private async connect() {
    console.log("Joining room...");

    try {
      this.room = await this.client.joinOrCreate("my_room");
      console.log("Joined room 'my_room'");
    } catch (e: any) {
      console.error("An error occured while joining!", e);
    }
  }
}
