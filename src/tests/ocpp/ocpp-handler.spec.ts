import { logger } from "../../logger";
import {
  OcppErrorCode,
  ocppHandler, 
  OcppMessage, 
  OcppMessageAction, 
  OcppMessageType, 
  RegistrationStatus,
  ResetType,
} from "../../ocpp";
import { 
  handleBootNotificationConf,
  handleChangeConfigurationReq,
  handleGetConfigurationReq,
  handleResetReq, 
} from "../../ocpp/handlers";
import { simulator } from "../../simulator";

jest.mock("../../ocpp/handlers", () => ({
  handleBootNotificationConf: jest.fn(),
  handleAuthorizeConf: jest.fn(),
  handleGetConfigurationReq: jest.fn(),
  handleChangeConfigurationReq: jest.fn(),
  handleResetReq: jest.fn(),
}));

describe("OCPP Handler", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("should not handle message if registration status is rejected", () => {
    const loggerSpy = jest.spyOn(logger, "error");
    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.REJECTED);
    ocppHandler.handleMessage([OcppMessageType.CALL, "id", OcppMessageAction.HEARTBEAT, {}]);
    expect(loggerSpy).toHaveBeenCalledWith("While Rejected, the Charge Point SHALL NOT respond to any Central System initiated message");
  });

  test("should not handle message if it's invalid", () => {
    const loggerSpy = jest.spyOn(logger, "error");
    const message = [5, "id", OcppMessageAction.HEARTBEAT, {}] as unknown as OcppMessage;

    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);
    ocppHandler.handleMessage(message);
    expect(loggerSpy).toHaveBeenCalledWith("Invalid OCPP message received", { message });
  });

  test("should handle call error message", () => {
    const loggerSpy = jest.spyOn(logger, "error");
    const message = [OcppMessageType.ERROR, "id", OcppErrorCode.FORMATION_VIOLATION, "", ""] as OcppMessage;

    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);
    ocppHandler.handleMessage(message);
    expect(loggerSpy).toHaveBeenCalledWith("Call Error message received", { message });
  });

  test("should not handle invalid call result message", () => {
    const loggerSpy = jest.spyOn(logger, "error");
    const message = [OcppMessageType.RESULT, "id", {}, {}] as unknown as OcppMessage;

    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);
    ocppHandler.handleMessage(message);
    expect(loggerSpy).toHaveBeenCalledWith("Invalid OCPP call result message received", { message });
  });

  test("should not handle call result message if there is no pending request", () => {
    const loggerSpy = jest.spyOn(logger, "error");
    const message = [OcppMessageType.RESULT, "id", {}] as OcppMessage;

    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);
    (simulator as any).pendingRequests = new Map();

    ocppHandler.handleMessage(message);
    expect(loggerSpy).toHaveBeenCalledWith("Failed to find pending request for received message", { message });
  });

  test("should not handle call result message if payload is invalid", () => {
    const loggerSpy = jest.spyOn(logger, "error");
    const deletePendingRequest = jest.fn();

    const callMessage = [OcppMessageType.CALL, "id", OcppMessageAction.BOOT_NOTIFICATION, {}];
    const message = [OcppMessageType.RESULT, "id", {}] as OcppMessage;

    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);
    
    (simulator as any).pendingRequests = { 
      get: jest.fn().mockReturnValue(callMessage),
      delete: deletePendingRequest
    };

    ocppHandler.handleMessage(message);

    expect(loggerSpy).toHaveBeenCalledWith("Recieved invalid OCPP response message", { message });
    expect(deletePendingRequest).toHaveBeenCalledWith("id");
  });

  test("should handle BootNotificationConf", () => {
    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);

    const reqPayload = {
      chargePointModel: "test-model",
      chargePointVendor: "test-vendor",
      chargeBoxSerialNumber: "SN001"
    };

    const resPayload = {
      currentTime: new Date().toISOString(),
      interval: 180,
      status: RegistrationStatus.ACCEPTED
    };

    const callMessage = [OcppMessageType.CALL, "id", OcppMessageAction.BOOT_NOTIFICATION, reqPayload];
    const resultMessage = [OcppMessageType.RESULT, "id", resPayload] as OcppMessage;

    (simulator as any).pendingRequests = { 
      get: jest.fn().mockReturnValue(callMessage),
      delete: jest.fn()
    };

    ocppHandler.handleMessage(resultMessage);
    expect(handleBootNotificationConf).toHaveBeenCalledWith(resPayload);
  });

  test("should handle GetConfigurationReq", () => {
    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);
    const callMessage = [OcppMessageType.CALL, "id", OcppMessageAction.GET_CONFIGURATION, {}] as OcppMessage;
    ocppHandler.handleMessage(callMessage);
    expect(handleGetConfigurationReq).toHaveBeenCalledWith("id", {});
  });

  test("should handle ChangeConfigurationReq", () => {
    const payload = { key: "key", value: "value" };
    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);
    const callMessage = [OcppMessageType.CALL, "id", OcppMessageAction.CHANGE_CONFIGURATION, payload] as OcppMessage;
    ocppHandler.handleMessage(callMessage);
    expect(handleChangeConfigurationReq).toHaveBeenCalledWith("id", payload);
  });

  test("should handle ResetReq", () => {
    const payload = { type: ResetType.HARD };
    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);
    const callMessage = [OcppMessageType.CALL, "id", OcppMessageAction.RESET, payload] as OcppMessage;
    ocppHandler.handleMessage(callMessage);
    expect(handleResetReq).toHaveBeenCalledWith("id", payload);
  });

  test("should not handle invalid call message", () => {
    const loggerSpy = jest.spyOn(logger, "error");
    const message = [OcppMessageType.CALL, "id", {}] as unknown as OcppMessage;

    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);
    ocppHandler.handleMessage(message);
    expect(loggerSpy).toHaveBeenCalledWith("Invalid OCPP call message received", { message });
  });

  test("should not handle call message if payload is invalid", () => {
    jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);

    const loggerSpy = jest.spyOn(logger, "error");
    const sendMsgSpy = jest.spyOn(simulator, "sendMsg").mockReturnValue(undefined);
    
    const callMessage = [OcppMessageType.CALL, "id", OcppMessageAction.GET_CONFIGURATION, { key: 1 }] as OcppMessage;
    const errorMessage = [4, "id", OcppErrorCode.GENERIC_ERROR, "", "{}"];

    ocppHandler.handleMessage(callMessage);

    expect(loggerSpy).toHaveBeenCalledWith("Error during validation of OCPP call message payload", { errorMessage });
    expect(sendMsgSpy).toHaveBeenCalledWith(errorMessage);
  });
});
