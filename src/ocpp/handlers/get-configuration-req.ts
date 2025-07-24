import { configService } from "../../configuration";
import { simulator } from "../../simulator";
import { ocppDispatcher } from "../ocpp-dispatch";
import { GetConfigurationReq } from "../types";

export const handleGetConfigurationReq = (messageId: string, payload: GetConfigurationReq): void => {
  const maxKeys = Number(configService.getConfig("GetConfigurationMaxKeys").value) + 1;

  if (!payload?.key || !payload?.key.length) {
    const responsePayload = { configurationKey: configService.configuration.slice(0, maxKeys) };
    const response = ocppDispatcher.getConfigurationConf(messageId, responsePayload);
    simulator.sendMsg(response);
    return;
  }

  const configurationKey = [];
  const unknownKey = [];

  payload.key.forEach((key) => {
    const config = configService.getConfig(key);
    !!config ? configurationKey.push(config) : unknownKey.push(key);
  });

  const responsePayload = { configurationKey: configurationKey.slice(0, maxKeys), unknownKey };
  const response = ocppDispatcher.getConfigurationConf(messageId, responsePayload);
  simulator.sendMsg(response);
};
