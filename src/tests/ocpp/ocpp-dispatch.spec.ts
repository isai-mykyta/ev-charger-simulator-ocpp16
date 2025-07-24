import { 
  ChargePointErrorCode, 
  ChargePointStatus, 
  ConfigurationStatus, 
  ocppDispatcher, 
  OcppMessageAction, 
  OcppMessageType, 
  Reason, 
  ResetStatus, 
} from "../../ocpp";

describe("OcppDispatcher", () => {
  test("should construct HeartbeatReq", () => {
    const [type, id, action, payload] = ocppDispatcher.hearbeatReq();
    expect(type).toBe(OcppMessageType.CALL);
    expect(action).toBe(OcppMessageAction.HEARTBEAT);
    expect(typeof id).toBe("string");
    expect(payload).toStrictEqual({});
  });

  test("should construct StatusNotificationReq", () => {
    const payloadData = {
      connectorId: 1,
      errorCode: ChargePointErrorCode.NO_ERROR,
      status: ChargePointStatus.AVAILABLE,
    };

    const [type, id, action, payload] = ocppDispatcher.statusNotificationReq(payloadData);
    expect(type).toBe(OcppMessageType.CALL);
    expect(action).toBe(OcppMessageAction.STATUS_NOTIFICATION);
    expect(typeof id).toBe("string");
    expect(payload).toStrictEqual(payloadData);
  });

  test("should construct BootNotificationReq", () => {
    const payloadData = {
      chargePointModel: "test-model",
      chargePointVendor: "test-vendor",
      chargePointSerialNumber: "SN001",
    };

    const [type, id, action, payload] = ocppDispatcher.bootNotificationReq(payloadData);
    expect(type).toBe(OcppMessageType.CALL);
    expect(action).toBe(OcppMessageAction.BOOT_NOTIFICATION);
    expect(typeof id).toBe("string");
    expect(payload).toStrictEqual(payloadData);
  });

  test("should constrcut AuthorizeReq", () => {
    const payloadData = { idTag: "MOCK-ID-TAG" };
    const [type, id, action, payload] = ocppDispatcher.authorizeReq(payloadData);

    expect(type).toBe(OcppMessageType.CALL);
    expect(action).toBe(OcppMessageAction.AUTHORIZE);
    expect(typeof id).toBe("string");
    expect(payload).toStrictEqual(payloadData);
  });

  test("should constrcut StartTransactionReq", () => {
    const payloadData = {
      connectorId: 1,
      meterStart: 1,
      idTag: "MOCK-ID-TAG",
      timestamp: new Date().toISOString()
    };

    const [type, id, action, payload] = ocppDispatcher.startTransactionReq(payloadData);

    expect(type).toBe(OcppMessageType.CALL);
    expect(action).toBe(OcppMessageAction.START_TRANSACTION);
    expect(typeof id).toBe("string");
    expect(payload).toStrictEqual(payloadData);
  });

  test("should constrcut GetConfigurationConf", () => {
    const configKey = { key: "Key", value: "Value", readonly: true };
    const payloadData = { configurationKey: [configKey], unknownKey: ["test"] };
    const [type, id, payload] = ocppDispatcher.getConfigurationConf("id", payloadData);

    expect(type).toBe(OcppMessageType.RESULT);
    expect(id).toBe("id");
    expect(payload).toStrictEqual(payloadData);
  });

  test("should constrcut ChangeConfigurationConf", () => {
    const payloadData = { status: ConfigurationStatus.ACCEPTED };
    const [type, id, payload] = ocppDispatcher.changeConfigurationConf("id", payloadData);

    expect(type).toBe(OcppMessageType.RESULT);
    expect(id).toBe("id");
    expect(payload).toStrictEqual(payloadData);
  });

  test("should constrcut ResetConf", () => {
    const payloadData = { status: ResetStatus.ACCEPTED };
    const [type, id, payload] = ocppDispatcher.resetConf("id", payloadData);

    expect(type).toBe(OcppMessageType.RESULT);
    expect(id).toBe("id");
    expect(payload).toStrictEqual(payloadData);
  });

  test("should constrcut StopTransactionReq", () => {
    const payloadData = { 
      idTag: "1",
      meterStop: 123456,
      timestamp: new Date().toISOString(),
      transactionId: 1,
      reason: Reason.LOCAL,
    };

    const [type,, action, payload] = ocppDispatcher.stopTransactionReq(payloadData);

    expect(type).toBe(OcppMessageType.CALL);
    expect(action).toBe(OcppMessageAction.STOP_TRANSACTION);
    expect(payload).toStrictEqual(payloadData);
  });
});
