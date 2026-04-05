import { defineRoom, defineServer, monitor, playground } from "colyseus";
import { MyRoom } from "./rooms/myRoom";

export const server = defineServer({
  /**
   * Room handles
   */
  rooms: {
    my_room: defineRoom(MyRoom),
  },

  express: (app) => {
    if (process.env.NODE_ENV !== "production") {
      app.use("/", playground());
    }

    // Recommended to protect this route with a password
    app.use("/monitor", monitor());
  },

  beforeListen: () => {
    // Executes before gameServer.listen() is called
  },
});

export default server;
