import { simulator } from "../../simulator";
import { BootNotificationConf } from "../types";

export const handleBootNotificationConf = (payload: BootNotificationConf): void => {
  simulator.registrationStatus = payload.status;
  simulator.heartbeatInterval = payload.interval;
};
