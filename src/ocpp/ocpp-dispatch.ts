import { 
  AuthorizeReq,
  BootNotificationReq, 
  CallMessage, 
  CallResultMessage, 
  ChangeConfigurationConf, 
  GetConfigurationConf, 
  MeterValuesReq, 
  OcppMessageAction,
  ResetConf,
  StartTransactionReq, 
  StatusNotificationReq, 
  StopTransactionReq
} from "./types";
import { 
  callMessage, 
  callResultMessage 
} from "../utils/ocpp";

class OcppDispatcher {
  public hearbeatReq(): CallMessage<object> {
    return callMessage(OcppMessageAction.HEARTBEAT, {});
  }

  public statusNotificationReq(payload: StatusNotificationReq): CallMessage<StatusNotificationReq> {
    return callMessage(OcppMessageAction.STATUS_NOTIFICATION, payload);
  }

  public bootNotificationReq(payload: BootNotificationReq): CallMessage<BootNotificationReq> {
    return callMessage(OcppMessageAction.BOOT_NOTIFICATION, payload);
  }

  public authorizeReq(payload: AuthorizeReq): CallMessage<AuthorizeReq> {
    return callMessage(OcppMessageAction.AUTHORIZE, payload);
  }

  public startTransactionReq(payload: StartTransactionReq): CallMessage<StartTransactionReq> {
    return callMessage(OcppMessageAction.START_TRANSACTION, payload);
  }

  public meterValuesReq(payload: MeterValuesReq): CallMessage<MeterValuesReq> {
    return callMessage(OcppMessageAction.METER_VALUES, payload);
  }

  public getConfigurationConf(messageId: string, payload: GetConfigurationConf): CallResultMessage<GetConfigurationConf> {
    return callResultMessage(messageId, payload);
  }

  public changeConfigurationConf(messageId: string, payload: ChangeConfigurationConf): CallResultMessage<ChangeConfigurationConf> {
    return callResultMessage(messageId, payload);
  }

  public resetConf(messageId: string, payload: ResetConf): CallResultMessage<ResetConf> {
    return callResultMessage(messageId, payload);
  }

  public stopTransactionReq(payload: StopTransactionReq): CallMessage<StopTransactionReq> {
    return callMessage(OcppMessageAction.STOP_TRANSACTION, payload);
  }
}

export const ocppDispatcher = new OcppDispatcher();
