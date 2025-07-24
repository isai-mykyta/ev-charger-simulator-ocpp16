import winston from "winston";

import { LogLevel } from "./types";

class Logger {
  private readonly logger: winston.Logger;

  constructor () {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
      ],
    });
  }

  public log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    this.logger.log(level, message, meta);
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.log("info", message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.log("warn", message, meta);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    this.log("error", message, meta);
  }
  
  public debug(message: string, meta?: Record<string, unknown>): void {
    this.log("debug", message, meta);
  }
}

export const logger = new Logger();
