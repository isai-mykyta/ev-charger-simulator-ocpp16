import cron, { ScheduledTask } from "node-cron";

import { configService } from "../../configuration";
import { Connector } from "../../connector";
import { 
  Location, 
  Measurand, 
  ocppDispatcher, 
  ReadingContext, 
  UnitOfMeasure, 
  ValueFormat 
} from "../../ocpp";
import { simulator } from "../../simulator";
import { Transaction } from "../../transaction";

describe("Transaction", () => {
  let transaction: Transaction;

  beforeEach(() => {
    jest.spyOn(configService, "getConfig").mockReturnValue({ 
      key: "key",
      value: "10", 
      readonly: true 
    });

    const connector = new Connector({ id: 1, type: "Type2", maxCurrent: 32 });
    transaction = new Transaction({ transactionId: 1, connector, idTag: "ff" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("should send initial meter value", () => {
    jest.useFakeTimers();

    const ocppDispatchSpy = jest.spyOn(ocppDispatcher, "meterValuesReq");
    jest.spyOn(simulator, "sendRequest").mockResolvedValue(undefined);
    jest.spyOn(cron, "schedule").mockReturnValue({} as unknown as ScheduledTask);

    const expectedActiveImportRegister = {
      unit: UnitOfMeasure.WH,
      context: ReadingContext.TRANSACTION_BEGIN,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      value: "0.00",
      measurand: Measurand.ENERGY_ACTIVE_IMPORT_REGISTER
    };

    const expectedCurrentImport = {
      context: ReadingContext.TRANSACTION_BEGIN,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      unit: UnitOfMeasure.A, 
      measurand: Measurand.CURRENT_IMPORT, 
      value: "0.00",
    };

    const expectedPowerActiveImport = {
      context: ReadingContext.TRANSACTION_BEGIN,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      measurand: Measurand.POWER_ACTIVE_IMPORT,
      unit: UnitOfMeasure.W,
      value: "0.00"
    };

    const expectedVoltage = {
      context: ReadingContext.TRANSACTION_BEGIN,
      measurand: Measurand.VOLTAGE, 
      unit: UnitOfMeasure.V, 
      format: ValueFormat.RAW,
      location: Location.OUTLET,
    };

    const expectedMeterValue = {
      connectorId: 1,
      transactionId: 1,
      meterValue: {
        sampledValue: [
          expectedActiveImportRegister,
          expectedCurrentImport,
          expectedPowerActiveImport,
          expectedVoltage
        ]
      }
    };

    transaction.start();
    jest.advanceTimersByTime(10000);

    const firstCallArgs = ocppDispatchSpy.mock.calls[0][0];
    expect(firstCallArgs).toMatchObject(expectedMeterValue);

    jest.useRealTimers();
  });

  test("should set up meter values interval", () => {
    jest.useFakeTimers();

    jest.spyOn(simulator, "sendRequest").mockResolvedValue(undefined);
    jest.spyOn(cron, "schedule").mockReturnValue({} as unknown as ScheduledTask);

    expect(transaction["meterValuesInterval"]).not.toBeDefined();

    transaction.start();

    jest.advanceTimersByTime(10000);

    expect(transaction["meterValuesInterval"]).toBeDefined();

    jest.useRealTimers();
  });

  test("should set up meter values cron job", () => {
    jest.useFakeTimers();

    jest.spyOn(simulator, "sendRequest").mockResolvedValue(undefined);
    const cronSpy = jest.spyOn(cron, "schedule").mockReturnValue({} as unknown as ScheduledTask);

    expect(transaction["meterValuesCron"]).not.toBeDefined();

    transaction.start();

    jest.advanceTimersByTime(10000);

    expect(transaction["meterValuesCron"]).toBeDefined();
    expect(cronSpy).toHaveBeenCalledWith("*/10 * * * * *", expect.any(Function));

    jest.useRealTimers();
  });

  test("should sample meter value", () => {
    const incrementEnergySpy = jest.spyOn(transaction.connector, "incrementTotalImportedEnergy");

    const expectedActiveImportRegister = {
      unit: UnitOfMeasure.WH,
      context: ReadingContext.SAMPLE_PERIODIC,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      measurand: Measurand.ENERGY_ACTIVE_IMPORT_REGISTER
    };

    const expectedCurrentImport = {
      context: ReadingContext.SAMPLE_PERIODIC,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      unit: UnitOfMeasure.A, 
      measurand: Measurand.CURRENT_IMPORT,
    };

    const expectedPowerActiveImport = {
      context: ReadingContext.SAMPLE_PERIODIC,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      measurand: Measurand.POWER_ACTIVE_IMPORT,
      unit: UnitOfMeasure.W,
    };

    const expectedVoltage = {
      context: ReadingContext.SAMPLE_PERIODIC,
      measurand: Measurand.VOLTAGE, 
      unit: UnitOfMeasure.V, 
      format: ValueFormat.RAW,
      location: Location.OUTLET,
    };

    const result = transaction["sampleMeterValue"](ReadingContext.SAMPLE_PERIODIC);

    expect(result).toMatchObject({
      sampledValue: [
        expectedActiveImportRegister,
        expectedCurrentImport,
        expectedPowerActiveImport,
        expectedVoltage
      ]
    });

    expect(incrementEnergySpy).toHaveBeenCalled();
  });

  test("should calculate energy based on max current and sample interval", () => {
    expect(transaction["energyPerSample"]()).toBeCloseTo(20.44, 2);
  });

  test("should generate voltage within nominal ± maxFluctuation", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    expect(transaction["generateVoltage"]()).toBe(230.00);
  });

  test("should return voltage rounded to 2 decimal places", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.123456);
    const result = transaction["generateVoltage"]();
    expect(result).toEqual(parseFloat(result.toFixed(2)));
  });

  test("should generate current within 10A and maxCurrent", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    const result = transaction["simulateCurrent"]();
    const expected = ((32 - 10) * 0.5) + 10;
    expect(result).toBeCloseTo(expected, 2);
  });

  test("should return current rounded to 2 decimal places", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.56789);
    const result = transaction["simulateCurrent"]();
    expect(result).toEqual(parseFloat(result.toFixed(2)));
  });

  test("should calculate power as voltage * current * powerFactor", () => {
    jest.spyOn(transaction as any, "generateVoltage").mockReturnValue(230);
    jest.spyOn(transaction as any, "simulateCurrent").mockReturnValue(16);

    const result = transaction["simulatePowerW"]();
    const expectedPower = 230 * 16 * 1.0;

    expect(result).toBeCloseTo(expectedPower, 2);
  });

  test("should return power rounded to 2 decimal places", () => {
    jest.spyOn(transaction as any, "generateVoltage").mockReturnValue(230.1234);
    jest.spyOn(transaction as any, "simulateCurrent").mockReturnValue(15.9876);

    const result = transaction["simulatePowerW"]();
    expect(result).toEqual(parseFloat(result.toFixed(2)));
  });

  test("should pause transaction", () => {
    transaction.pause();
    expect(transaction.isActive).toBe(false);
  });

  test("should resume transaction", () => {
    transaction.resume();
    expect(transaction.isActive).toBe(true);
  });

  test("should stop transaction", () => {
    const mockDestroyCron = jest.fn();

    transaction["meterValuesInterval"] = "test-interval" as any;
    transaction["meterValuesCron"] = { destroy: mockDestroyCron } as any;
    transaction.stop();

    expect(transaction.isActive).toBe(false);
    expect(transaction["meterValuesInterval"]).toBe(null);
    expect(transaction["meterValuesCron"]).toBe(null);
    expect(mockDestroyCron).toHaveBeenCalled();
  });
});
