// eslint-disable-next-line import/order
import * as dotenv from "dotenv";

dotenv.config();

import "reflect-metadata";

import express from "express";
import Joi from "joi";

import { apiRouter } from "./api";

const appConfigSchema = Joi.object({
  CHARGE_POINT_VENDOR: Joi.string().required().min(3).max(30),
  CHARGE_POINT_MODEL: Joi.string().required().min(3).max(100),
  CHARGE_POINT_FIRMWARE_VERSION: Joi.string().required().min(1).max(20),
  CHARGE_POINT_WEBSOCKET_PING_INTERVAL: Joi.number().required(),
  CHARGE_POINT_WEBSOCKET_URL: Joi.string().required().min(10).max(50),
  CHARGE_POINT_SERIAL_NUMBER: Joi.string().required().min(5).max(50),
  CHARGE_POINT_IDENTITY: Joi.string().required().min(3).max(50),
});

const { error } = appConfigSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
});

if (error) {
  throw new Error(
    `❌ Invalid environment configuration:\n${error.details
      .map((d) => ` - ${d.message}`)
      .join("\n")}`
  );
}

const app = express();

const HTTP_PORT = process.env.HTTP_PORT || 3000;

app.use(apiRouter);

app.listen(HTTP_PORT, () => console.log(`🚀 App is running on port ${HTTP_PORT}`));
