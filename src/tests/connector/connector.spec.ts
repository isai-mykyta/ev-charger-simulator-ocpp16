import { Connector } from "../../connector";
import { ChargePointErrorCode, ChargePointStatus } from "../../ocpp";

describe("Connector", () => {
  let connector: Connector;

  beforeEach(() => {
    connector = new Connector({
      id: 1,
      type: "Type1",
      maxCurrent: 500
    });
  });

  test("should show status", () => {
    expect(connector.status).toBe(ChargePointStatus.UNAVAILABLE);
  });

  test("should show error code", () => {
    expect(connector.errorCode).toBe(ChargePointErrorCode.NO_ERROR);
  });

  test("should show is enabled", () => {
    expect(connector.isEnabled).toBe(false);
  });

  test("should show is is reserved", () => {
    expect(connector.isReserved).toBe(false);
  });

  test("should set status", () => {
    connector.status = ChargePointStatus.CHARGING;
    expect(connector.status).toBe(ChargePointStatus.CHARGING);
  });

  test("should set error code", () => {
    connector.errorCode = ChargePointErrorCode.CONNECTOR_LOCK_FAILURE;
    expect(connector.errorCode).toBe(ChargePointErrorCode.CONNECTOR_LOCK_FAILURE);
  });

  test("should disable", () => {
    connector.isEnabled = false;
    expect(connector.isEnabled).toBe(false);
  });

  test("should reserve", () => {
    connector.isReserved = true;
    expect(connector.isReserved).toBe(true);
  });

  test("should increment total imported energy", () => {
    connector.incrementTotalImportedEnergy(100);
    expect(connector.totalEnergyImportedWh).toBe(100);
  });
});
