import WebSocket from "ws";

import { logger } from "../logger";
import { ConnectOptions } from "./types";

export abstract class WebSocketClient {
  protected client: WebSocket;
  
  private pingInterval: number;
  private pingTimer: NodeJS.Timeout;

  private startPingTimer(): void {
    this.pingTimer = setInterval(() => {
      this.client.ping();
    }, this.pingInterval * 1000);
  }

  private onOpen(): void {
    logger.info("WebSocket connection is opened");
    this.startPingTimer();
  }

  private onClose(): void {
    clearInterval(this.pingTimer);
    this.pingInterval = null;
    this.client = null;
    logger.warn("WebSocket connection is closed");
  }

  private onError(error: Error): void {
    logger.error("WebSocket error occured", { error });
  }

  protected send(message: string): void {
    this.client.send(message);
  }

  protected async disconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.on("error", (error) => {
        this.onError(error);
        reject(error);
      });

      this.client.on("close", () => {
        this.onClose();
        resolve();
      });

      this.client.close();
    });
  }

  protected async connect(options: ConnectOptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pingInterval = options.pingInterval;
      this.client = new WebSocket(options.url, "ocpp1.6");
      this.client.on("ping", () => this.client.pong());

      this.client.on("open", () => {
        this.onOpen();
        resolve();
      });

      this.client.on("close", () => {
        this.onClose();
      });

      this.client.on("error", (error) => {
        this.onError(error);
        reject(error);
      });
    });
  }
}
