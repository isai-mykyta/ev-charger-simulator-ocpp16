import { configService } from "../../configuration";
import { simulator } from "../../simulator";
import { ocppDispatcher } from "../ocpp-dispatch";
import { ChangeConfigurationReq, ConfigurationStatus } from "../types";

export const handleChangeConfigurationReq = (id: string, payload: ChangeConfigurationReq): void => {
  const key = configService.getConfig(payload.key);

  if (!key) {
    const payload = { status: ConfigurationStatus.NOT_SUPPORTED };
    const response = ocppDispatcher.changeConfigurationConf(id, payload);
    simulator.sendMsg(response);
    return;
  }

  let status: ConfigurationStatus;

  if (key.readonly) {
    const payload = { status: ConfigurationStatus.REJECTED };
    const response = ocppDispatcher.changeConfigurationConf(id, payload);
    simulator.sendMsg(response);
    return;
  }

  const isValidValue = configService.validateConfigValue(payload.key, payload.value);

  if (isValidValue) {
    status = ConfigurationStatus.ACCEPTED;
    configService.setConfig(payload.key, payload.value);
  } else {
    status = ConfigurationStatus.REJECTED;
  }

  const response = ocppDispatcher.changeConfigurationConf(id, { status });
  simulator.sendMsg(response);
};
