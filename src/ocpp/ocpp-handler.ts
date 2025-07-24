import { ClassConstructor } from "class-transformer";

import { logger } from "../logger";
import { simulator } from "../simulator";
import { 
  AuthorizeConfDto,
  BootNotificationConfDto, 
  ChangeConfigurationReqDto, 
  GetConfigurationReqDto, 
  ResetReqDto,
  StopTransactionConfDto
} from "./dtos";
import {
  BootNotificationConf,
  CallMessage, 
  CallResultMessage, 
  ChangeConfigurationReq, 
  GetConfigurationReq, 
  OcppErrorCode, 
  OcppMessage, 
  OcppMessageAction, 
  OcppMessageType, 
  RegistrationStatus, 
  ResetReq
} from "./types";
import { 
  callErrorMessage, 
  mapErrorConstraintToErrorCode, 
  validateDto 
} from "../utils";
import { 
  handleBootNotificationConf,
  handleChangeConfigurationReq,
  handleGetConfigurationReq,
  handleResetReq,
} from "./handlers";

class OcppHandler {
  private ocppResponseValidator = {
    [OcppMessageAction.BOOT_NOTIFICATION]: BootNotificationConfDto,
    [OcppMessageAction.AUTHORIZE]: AuthorizeConfDto,
    [OcppMessageAction.STOP_TRANSACTION]: StopTransactionConfDto
  };

  private ocppRequestValidator = {
    [OcppMessageAction.GET_CONFIGURATION]: GetConfigurationReqDto,
    [OcppMessageAction.CHANGE_CONFIGURATION]: ChangeConfigurationReqDto,
    [OcppMessageAction.RESET]: ResetReqDto
  };

  private validateOcppPayload<P>(payload: P, validator: ClassConstructor<any>): { isValid: boolean, errorCode?: OcppErrorCode } {
    const { isValid, errors } = validateDto(payload, validator);
    return { isValid, errorCode: !isValid ? mapErrorConstraintToErrorCode(errors[0].constraint) : undefined };
  };

  private validateOcppMessage(message: OcppMessage<unknown>): boolean {
    const [messageType] = message;
    return Array.isArray(message) && [2, 3, 4].includes(messageType);
  };

  private validateOcppCallMessage(message: CallMessage<unknown>): boolean {
    return message?.[0] === OcppMessageType.CALL && message.length === 4;
  };

  private validateOcppCallResultMessage(message: CallResultMessage<unknown>): boolean {
    return message?.[0] === OcppMessageType.RESULT && message.length === 3;
  };

  private validateOcppRequestPayload<P>(action: OcppMessageAction, payload: P): { isValid: boolean, errorCode?: OcppErrorCode } {
    return !!this.ocppRequestValidator[action] ? this.validateOcppPayload(payload, this.ocppRequestValidator[action]) : { isValid: false, errorCode: OcppErrorCode.NOT_IMPLEMENTED };
  };

  private validateOcppResponsePayload<P>(action: OcppMessageAction, payload: P): { isValid: boolean, errorCode?: OcppErrorCode } {
    return !!this.ocppResponseValidator[action] ? this.validateOcppPayload(payload, this.ocppResponseValidator[action]) : { isValid: true };
  };

  private handleCallResultMessage(message: CallResultMessage<unknown>): void {
    const isValidCallResultMsg = this.validateOcppCallResultMessage(message);

    if (!isValidCallResultMsg) {
      logger.error("Invalid OCPP call result message received", { message });
      return;
    }

    const [, messageId, payload] = message;
    const pendingRequest = simulator.pendingRequests.get(messageId);

    if (!pendingRequest) {
      logger.error("Failed to find pending request for received message", { message });
      return;
    }

    const [,,action] = pendingRequest;
    simulator.pendingRequests.delete(messageId);
    const { isValid: isValidPayload } = this.validateOcppResponsePayload(action, payload);

    if (!isValidPayload) {
      logger.error("Recieved invalid OCPP response message", { message });
      return;
    }

    switch (action) {
    case OcppMessageAction.BOOT_NOTIFICATION:
      handleBootNotificationConf(payload as BootNotificationConf);
      break;
    case OcppMessageAction.AUTHORIZE:
      break;
    case OcppMessageAction.HEARTBEAT:
      break;
    case OcppMessageAction.STATUS_NOTIFICATION:
      break;
    case OcppMessageAction.METER_VALUES:
      break;
    case OcppMessageAction.STOP_TRANSACTION:
      break;
    default:
      break;
    }
  }

  private async handleCallMessage(message: CallMessage<unknown>): Promise<void> {
    const isValidCallMsg = this.validateOcppCallMessage(message);

    if (!isValidCallMsg) {
      logger.error("Invalid OCPP call message received", { message });
      return;
    }

    const [, messageId, action, payload] = message;
    const { isValid: isValidPayload, errorCode } = this.validateOcppRequestPayload(action, payload);

    if (!isValidPayload) {
      const errorMessage = callErrorMessage(messageId, errorCode);
      logger.error("Error during validation of OCPP call message payload", { errorMessage });
      simulator.sendMsg(errorMessage);
      return;
    }

    switch (action) {
    case OcppMessageAction.GET_CONFIGURATION:
      handleGetConfigurationReq(messageId, payload as GetConfigurationReq);
      return;
    case OcppMessageAction.CHANGE_CONFIGURATION:
      handleChangeConfigurationReq(messageId, payload as ChangeConfigurationReq);
      return;
    case OcppMessageAction.RESET:
      await handleResetReq(messageId, payload as ResetReq);
      return;
    default:
      break;
    }
  }

  public async handleMessage(message: OcppMessage): Promise<void> {
    if (simulator.registrationStatus === RegistrationStatus.REJECTED) {
      logger.error("While Rejected, the Charge Point SHALL NOT respond to any Central System initiated message");
      return;
    }

    const isValidOcppMessage = this.validateOcppMessage(message);

    if (!isValidOcppMessage) {
      logger.error("Invalid OCPP message received", { message });
      return;
    }

    const [ messageType ] = message;

    switch (messageType) {
    case OcppMessageType.ERROR:
      logger.error("Call Error message received", { message });
      return;
    case OcppMessageType.RESULT:
      this.handleCallResultMessage(message);
      return;
    case OcppMessageType.CALL:
      await this.handleCallMessage(message);
      return;
    }
  }
}

export const ocppHandler = new OcppHandler();
