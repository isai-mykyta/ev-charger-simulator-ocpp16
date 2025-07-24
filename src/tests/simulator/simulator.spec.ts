import { configService } from "../../configuration";
import { Connector } from "../../connector";
import { 
  CallMessage,
  ChargePointErrorCode, 
  ChargePointStatus, 
  OcppMessage, 
  OcppMessageAction, 
  OcppMessageType, 
  RegistrationStatus 
} from "../../ocpp";
import { Simulator } from "../../simulator";
import { Transaction } from "../../transaction";
import { withTimeout } from "../../utils";

process.env.CHARGE_POINT_WEBSOCKET_URL = "ws://127.0.0.1:8080";
process.env.CHARGE_POINT_IDENTITY = "TEST-IDENTITY";
process.env.CHARGE_POINT_MODEL = "test-model";
process.env.CHARGE_POINT_VENDOR = "test-vendor";
process.env.CHARGE_POINT_SERIAL_NUMBER = "SN12345";

jest.mock("../../utils", () => ({
  withTimeout: jest.fn(),
}));

describe("Simulator", () => {
  let simulator: Simulator;

  beforeEach(() => {
    simulator = new Simulator();
  });

  beforeAll(() => {
    jest.useFakeTimers();
  });
  
  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  test("should init simulator", () => {
    expect(simulator.webSocketUrl).toBe("ws://127.0.0.1:8080");
    expect(simulator.identity).toBe("TEST-IDENTITY");
    expect(simulator.model).toBe("test-model");
    expect(simulator.vendor).toBe("test-vendor");
    expect(simulator.chargePointSerialNumber).toBe("SN12345");
    expect(simulator.registrationStatus).toBe(undefined);
    expect(simulator.isOnline).toBe(false);
    expect(simulator.connectors.length).toBe(2);
    expect(simulator.transactions.length).toBe(0);
  });

  test("should change registration status to accepted", () => {
    const sendReqSpy = jest.spyOn(simulator, "sendRequest").mockResolvedValue(undefined);
    simulator.registrationStatus = RegistrationStatus.ACCEPTED;

    expect(simulator.registrationStatus).toBe(RegistrationStatus.ACCEPTED);
    expect(simulator["heartbeatTimer"]).toBeDefined();

    simulator.connectors.forEach((connector) => {
      expect(connector.status).toBe(ChargePointStatus.AVAILABLE);
      expect(connector.isEnabled).toBe(true);
    });

    expect(sendReqSpy).toHaveBeenCalledWith([
      OcppMessageType.CALL,
      expect.anything(),
      OcppMessageAction.STATUS_NOTIFICATION,
      {
        connectorId: 0, 
        status: ChargePointStatus.AVAILABLE, 
        errorCode: ChargePointErrorCode.NO_ERROR
      }
    ]);
  });

  test("should handle rejected registration status", () => {
    simulator.registrationStatus = RegistrationStatus.REJECTED;
    expect(simulator.registrationStatus).toBe(RegistrationStatus.REJECTED);
  });

  test("should set heartbeat interval", () => {
    const setConfigSpy = jest.spyOn(configService, "setConfig");
    simulator.heartbeatInterval = 5;
    expect(setConfigSpy).not.toHaveBeenCalled();

    simulator.heartbeatInterval = 15;
    expect(setConfigSpy).toHaveBeenCalledWith("HeartbeatInterval", "15");
    expect(simulator["_heartbeatInterval"]).toBe(15);
  });

  test("should connect simulator", async () => {
    const pingInterval = { key: "WebSocketPingInterval", value: "180", readonly: true };
    const onMock = jest.fn();
    simulator["client"] = { on: onMock } as any;
    
    jest.spyOn(configService, "getConfig").mockReturnValue(pingInterval);
    const connectSpy = jest.spyOn(simulator as any, "connect").mockResolvedValue(undefined);
    const sendReqSpy = jest.spyOn(simulator, "sendRequest").mockResolvedValue(undefined);

    await simulator.connectSimulator();

    expect(onMock).toHaveBeenCalledWith("close", expect.any(Function));
    expect(onMock).toHaveBeenCalledWith("message", expect.any(Function));
    expect(connectSpy).toHaveBeenCalledWith({ url: "ws://127.0.0.1:8080/TEST-IDENTITY", pingInterval: 180 });
    expect(simulator["_isOnline"]).toBe(true);
    
    expect(sendReqSpy).toHaveBeenCalledWith([
      OcppMessageType.CALL,
      expect.anything(),
      OcppMessageAction.BOOT_NOTIFICATION,
      {
        chargePointModel: "test-model", 
        chargePointVendor: "test-vendor", 
        chargePointSerialNumber: "SN12345"
      }
    ]);
  });

  test("should disconnect simulator", async () => {
    const disconnectSpy = jest.spyOn(simulator as any, "disconnect").mockResolvedValue(undefined);
    const removeAllListenersMock = jest.fn();
    simulator["client"] = { removeAllListeners: removeAllListenersMock } as any;

    await simulator.disconnectSimulator();
    expect(disconnectSpy).toHaveBeenCalled();
    expect(removeAllListenersMock).toHaveBeenCalled();
    expect(simulator["_isOnline"]).toBe(false);
    expect(simulator.registrationStatus).toBe(null);
    
    simulator.connectors.forEach((connector) => {
      expect(connector.isEnabled).toBe(false);
      expect(connector.status).toBe(ChargePointStatus.UNAVAILABLE);
    });
  });

  test("should send message", () => {
    const msg = [OcppMessageType.CALL, "id", OcppMessageAction.AUTHORIZE, {}] as OcppMessage;
    const sendSpy = jest.spyOn(simulator as any, "send").mockReturnValue(undefined);
    simulator.sendMsg(msg);
    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(msg));
  });

  test("should send request", async () => {
    const callMsg = [OcppMessageType.CALL, "id", OcppMessageAction.AUTHORIZE, {}] as CallMessage<unknown>;
    const sendSpy = jest.spyOn(simulator as any, "send").mockReturnValue(undefined);
    simulator["handleOcppWsResponse"] = jest.fn().mockResolvedValue(undefined);
    await simulator.sendRequest(callMsg);
    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(callMsg));
    expect(withTimeout).toHaveBeenCalledWith(
      expect.any(Promise),
      60_000,
      "Failed to receive OCPP WS response within 60 seconds"
    );
  });

  test("should send status notification request", async () => {
    const connector = new Connector({ id: 1, type: "Type3", maxCurrent: 100 });
    const sendReqSpy = jest.spyOn(simulator, "sendRequest").mockResolvedValue(undefined);
    await simulator.sendStatusNotificationReq(connector);
    expect(sendReqSpy).toHaveBeenCalledWith([
      OcppMessageType.CALL,
      expect.anything(),
      OcppMessageAction.STATUS_NOTIFICATION,
      {
        connectorId: connector.id,
        errorCode: connector.errorCode,
        status: connector.status,
        timestamp: new Date().toISOString()
      }
    ]);
  });

  test("should add transaction", () => {
    const connector = new Connector({ id: 1, type: "Type3", maxCurrent: 100 });
    const trx = new Transaction({ transactionId: 1, connector, idTag: "idTag" });
    simulator.addTransaction(trx);
    expect(simulator.getTransaction(trx.transactionId)).toBe(trx);
  });

  test("should remove transaction", () => {
    const connector = new Connector({ id: 1, type: "Type3", maxCurrent: 100 });
    const trx = new Transaction({ transactionId: 1, connector, idTag: "idTag" });
    simulator.addTransaction(trx);
    simulator.removeTransaction(trx.transactionId);
    expect(simulator.getTransaction(trx.transactionId)).not.toBeDefined();
  });

  test("should get connectors", () => {
    expect(simulator.connectors.length).toBe(2);
  });

  test("should get transactions", () => {
    const connector = new Connector({ id: 1, type: "Type3", maxCurrent: 100 });
    const trx1 = new Transaction({ transactionId: 1, connector, idTag: "idTag" });
    const trx2 = new Transaction({ transactionId: 2, connector, idTag: "idTag" });

    simulator.addTransaction(trx1);
    simulator.addTransaction(trx2);
    
    expect(simulator.transactions.length).toBe(2);
  });
});
