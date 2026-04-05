import { Client, Messages, playground, Room } from "colyseus";
import { MyRoomState, Player } from "./states/myRoomState";

export class MyRoom extends Room {
  state = new MyRoomState();

  messages = {
    input: (client: Client, payload: any) => {
      const player = this.state.players.get(client.sessionId);
      const velocity = 2;

      if (payload.left) {
        player.x -= velocity;
      } else if (payload.right) {
        player.x += velocity;
      }

      if (payload.up) {
        player.y -= velocity;
      } else if (payload.down) {
        player.y += velocity;
      }
    },
  };

  onCreate(options: any): void | Promise<any> {}

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
}
