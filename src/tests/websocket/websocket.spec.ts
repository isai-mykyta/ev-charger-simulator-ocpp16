import { WebSocketServer } from "ws";

import { WebSocketClient } from "../../websocket";

class WsInstance extends WebSocketClient {
  constructor() {
    super();
  }
}

describe("WebSocketClient", () => {
  const wssPort = 8081;
  let wss: WebSocketServer;
  let wsInstance: WebSocketClient;

  beforeEach(() => {
    wss = new WebSocketServer({ port: wssPort });
    wsInstance = new WsInstance();
  });

  afterEach(() => {
    wss.clients.forEach((client) => client.close());
    wss.close();
    wss = null;
  });

  test("should connect to ws server", (done) => {
    wss.once("connection", async (socket) => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      expect(wss.clients.size).toBe(1);
      expect(socket.protocol).toBe("ocpp1.6");
      expect(wsInstance["pingInterval"]).toBeDefined();
      done();
    });

    wsInstance["connect"]({ url: `ws://127.0.0.1:${wssPort}`, pingInterval: 60 });
  });

  test("should disconnect from ws server", (done) => {
    wss.once("connection", async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      wsInstance["disconnect"]();

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      expect(wss.clients.size).toBe(0);
      expect(wsInstance["pingInterval"]).toBe(null);
      expect(wsInstance["client"]).toBe(null);
      done();
    });

    wsInstance["connect"]({ url: `ws://127.0.0.1:${wssPort}`, pingInterval: 60 });
  });

  test("should pong", (done) => {
    wss.once("connection", async (socket) => {
      socket.once("pong", () => {
        done();
      });

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
      socket.ping();
    });

    wsInstance["connect"]({ url: `ws://127.0.0.1:${wssPort}`, pingInterval: 60 });
  });
});
