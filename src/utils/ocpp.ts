import { randomUUID } from "node:crypto";

import { 
  CallErrorMessage,
  CallMessage, 
  CallResultMessage, 
  OcppErrorCode, 
  OcppMessageAction, 
  OcppMessageType 
} from "../ocpp/types";

export const callMessage = <P>(action: OcppMessageAction, payload: P): CallMessage<P> => {
  return [OcppMessageType.CALL, randomUUID(), action, payload];
};

export const callResultMessage = <P>(messageId: string, payload: P): CallResultMessage<P> => {
  return [OcppMessageType.RESULT, messageId, payload];
};

export const callErrorMessage = (
  messageId: string, 
  errorCode: OcppErrorCode, 
  description: string = "", 
  details: Record<string, unknown> = {}
): CallErrorMessage => {
  return [OcppMessageType.ERROR, messageId, errorCode, description, JSON.stringify(details)];
};

export const mapErrorConstraintToErrorCode = (constraint: string): OcppErrorCode => {
  switch (constraint) {
  case "isEmail":
  case "isUUID":
  case "isDateString":
  case "isUrl":
  case "whitelistValidation":
  case "maxLength":
  case "minLength":
  case "length":
  case "isEnum":
    return OcppErrorCode.FORMATION_VIOLATION;

  case "isInt":
  case "isBoolean":
  case "isString":
  case "isNumber":
    return OcppErrorCode.TYPE_CONSTRAINT_VIOLATION;

  case "isNotEmpty":
    return OcppErrorCode.PROTOCOL_ERROR;
        
  case "customValidation":
    return OcppErrorCode.NOT_IMPLEMENTED;
        
  default:
    return OcppErrorCode.GENERIC_ERROR;
  }
};
