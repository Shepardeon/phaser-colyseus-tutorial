import { Client, Messages, playground, Room } from "colyseus";
import { MyRoomState, Player } from "./states/myRoomState";

export class MyRoom extends Room {
  fixedTimeStep = 1000 / 60;

  state = new MyRoomState();

  messages = {
    input: (client: Client, payload: any) => {
      const player = this.state.players.get(client.sessionId);
      player.inputQueue.push(payload);
    },
  };

  onCreate(options: any): void | Promise<any> {
    let elapsedTime = 0;
    this.setSimulationInterval((dt) => {
      elapsedTime += dt;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this._fixedTick(dt);
      }
    });
  }

  onJoin(client: Client<any>, options?: any, auth?: any): void | Promise<any> {
    console.log(client.sessionId, "joined!");

    const mapWidth = 800;
    const mapHeight = 600;

    const player = new Player();

    player.x = Math.random() * mapWidth;
    player.y = Math.random() * mapHeight;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client<any>, code?: number): void | Promise<any> {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId);
  }

  onDispose(): void | Promise<any> {
    console.log("Disposing room", this.roomId, "...");
  }

  private _fixedTick(dt: number) {
    const velocity = 2;

    this.state.players.forEach((player) => {
      let input: any;

      // dequeue player inputs
      while ((input = player.inputQueue.shift())) {
        if (input.left) {
          player.x -= velocity;
        } else if (input.right) {
          player.x += velocity;
        }

        if (input.up) {
          player.y -= velocity;
        } else if (input.down) {
          player.y += velocity;
        }
      }
    });
  }
}
