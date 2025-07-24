import { Request, Response } from "express";

import { 
  startTransaction, 
  connect, 
  disconnect, 
  pauseTransaction,
  resumeTransaction,
  stopTransaction
} from "../../api";
import { configService } from "../../configuration";
import { Connector } from "../../connector";
import { 
  AuthorizationStatus, 
  AuthorizeReq, 
  CallMessage, 
  ChargePointStatus, 
  Location, 
  Measurand, 
  ocppDispatcher, 
  OcppMessageAction, 
  OcppMessageType, 
  ReadingContext, 
  Reason, 
  StartTransactionReq,
  UnitOfMeasure,
  ValueFormat
} from "../../ocpp";
import { simulator } from "../../simulator";
import { Transaction } from "../../transaction";

const mockRequest = { body: {} } as Request;
const mockResponse = { 
  status: jest.fn().mockReturnThis(), 
  json: jest.fn().mockReturnThis() 
} as unknown as Response;

describe("API Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Connect simulator", () => {
    test("should connect simulator", async () => {
      jest.spyOn(simulator, "connectSimulator").mockResolvedValue();
      await connect(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    test("should return 400 if simulator is already connected", async () => {
      jest.spyOn(simulator, "isOnline", "get").mockReturnValue(true);
      jest.spyOn(simulator, "connectSimulator").mockResolvedValue();
      
      await connect(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Disconnect simulator", () => {
    test("should disconnect simulator", async () => {
      jest.spyOn(simulator, "disconnectSimulator").mockResolvedValue();
      await disconnect(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe("startTransaction", () => {
    const mockConnector = { isReadyToCharge: true, status: ChargePointStatus.AVAILABLE };
    const mockAuthReq = [OcppMessageType.CALL, "id", OcppMessageAction.AUTHORIZE, { idTag: "TEST-ID-TAG" }];

    test("should return 400 if connector is not found", async () => {
      jest.spyOn(simulator, "connectors", "get").mockReturnValue([]);
      const sendRequestSpy = jest.spyOn(simulator, "sendRequest").mockResolvedValue({ status: "ok" });

      await startTransaction(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(sendRequestSpy).not.toHaveBeenCalled();
    });

    test("should return 400 if connector is not ready for charging", async () => {
      const mockConnector = { isReadyToCharge: false };

      jest.spyOn(simulator, "connectors", "get").mockReturnValue([mockConnector as unknown as Connector]);
      const sendRequestSpy = jest.spyOn(simulator, "sendRequest").mockResolvedValue({ status: "ok" });

      await startTransaction(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(sendRequestSpy).not.toHaveBeenCalled();
    });

    test("should return 400 if auth request is not accepted", async () => {
      const mockAuthRes = [OcppMessageType.RESULT, "id", { idTagInfo: { status: AuthorizationStatus.BLOCKED } }];

      jest.spyOn(simulator, "connectors", "get").mockReturnValue([mockConnector as unknown as Connector]);
      jest.spyOn(ocppDispatcher, "authorizeReq").mockReturnValue(mockAuthReq as CallMessage<AuthorizeReq>);

      const sendStatusNotificationSpy = jest.spyOn(simulator, "sendStatusNotificationReq").mockResolvedValue();
      const sendRequestSpy = jest.spyOn(simulator, "sendRequest").mockResolvedValue(mockAuthRes);

      await startTransaction(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAuthRes);
      expect(sendStatusNotificationSpy).toHaveBeenCalledTimes(2);
      expect(sendRequestSpy).toHaveBeenCalledWith(mockAuthReq);
    });

    test("should return 400 if start transaction request is not accepted", async () => {
      const mockConnector = { isReadyToCharge: true, status: ChargePointStatus.AVAILABLE };
      const mockStartTransactionPayload = expect.objectContaining({ idTag: "TEST-ID-TAG", meterStart: 1 });
      const mockAuthRes = [OcppMessageType.RESULT, "id", { idTagInfo: { status: AuthorizationStatus.ACCEPTED } }];

      const mockStartTransactionReq = [OcppMessageType.CALL, "id", OcppMessageAction.START_TRANSACTION, mockStartTransactionPayload];
      const mockStartTransactionRes = [OcppMessageType.RESULT, "id", { transactionId: 1, idTagInfo: { status: AuthorizationStatus.BLOCKED } }];

      jest.spyOn(simulator, "connectors", "get").mockReturnValue([mockConnector as unknown as Connector]);
      jest.spyOn(ocppDispatcher, "authorizeReq").mockReturnValue(mockAuthReq as CallMessage<AuthorizeReq>);
      jest.spyOn(ocppDispatcher, "startTransactionReq").mockReturnValue(mockStartTransactionReq as CallMessage<StartTransactionReq>);

      const sendStatusNotificationSpy = jest.spyOn(simulator, "sendStatusNotificationReq").mockResolvedValue();

      const sendRequestSpy = jest
        .spyOn(simulator, "sendRequest")
        .mockResolvedValueOnce(mockAuthRes)
        .mockResolvedValueOnce(mockStartTransactionRes);

      await startTransaction(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockStartTransactionRes);
      expect(sendStatusNotificationSpy).toHaveBeenCalledTimes(2);
      expect(sendRequestSpy).toHaveBeenCalledTimes(2);
      expect(sendRequestSpy).toHaveBeenNthCalledWith(1, mockAuthReq);
      expect(sendRequestSpy).toHaveBeenNthCalledWith(2, mockStartTransactionReq);
    });

    test("should handle start transaction request", async () => {
      const mockConnector = { isReadyToCharge: true, status: ChargePointStatus.AVAILABLE };
      const mockStartTransactionPayload = expect.objectContaining({ idTag: "TEST-ID-TAG", meterStart: 1 });
      const mockAuthRes = [OcppMessageType.RESULT, "id", { idTagInfo: { status: AuthorizationStatus.ACCEPTED } }];

      const mockStartTransactionReq = [OcppMessageType.CALL, "id", OcppMessageAction.START_TRANSACTION, mockStartTransactionPayload];
      const mockStartTransactionRes = [OcppMessageType.RESULT, "id", { transactionId: 1, idTagInfo: { status: AuthorizationStatus.ACCEPTED } }];

      jest.spyOn(simulator, "connectors", "get").mockReturnValue([mockConnector as unknown as Connector]);
      jest.spyOn(ocppDispatcher, "authorizeReq").mockReturnValue(mockAuthReq as CallMessage<AuthorizeReq>);
      jest.spyOn(ocppDispatcher, "startTransactionReq").mockReturnValue(mockStartTransactionReq as CallMessage<StartTransactionReq>);

      const sendStatusNotificationSpy = jest.spyOn(simulator, "sendStatusNotificationReq").mockResolvedValue();
      const startTransactionSpy = jest.spyOn(Transaction.prototype, "start").mockReturnValue();
      const addTransactionSpy = jest.spyOn(simulator, "addTransaction").mockReturnValue();

      const sendRequestSpy = jest
        .spyOn(simulator, "sendRequest")
        .mockResolvedValueOnce(mockAuthRes)
        .mockResolvedValueOnce(mockStartTransactionRes);

      await startTransaction(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockStartTransactionRes);
      expect(sendStatusNotificationSpy).toHaveBeenCalledTimes(2);
      expect(sendRequestSpy).toHaveBeenCalledTimes(2);
      expect(sendRequestSpy).toHaveBeenNthCalledWith(1, mockAuthReq);
      expect(sendRequestSpy).toHaveBeenNthCalledWith(2, mockStartTransactionReq);
      expect(startTransactionSpy).toHaveBeenCalled();
      expect(addTransactionSpy).toHaveBeenCalled();
    });
  });

  describe("pause transaction", () => {
    test("should return 400 if transaction is already paused", () => {
      const mockRequest = { params: { transactionId: 1 } } as unknown as Request;
      const connector = new Connector({ maxCurrent: 32, type: "Type1", id: 1 });
      const transaction = new Transaction({ transactionId: 1, connector, idTag: "ff" });

      transaction.pause();
      jest.spyOn(simulator, "getTransaction").mockReturnValue(transaction);

      pauseTransaction(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test("should return 200 and pause transaction", () => {
      const mockRequest = { params: { transactionId: 1 } } as unknown as Request;
      const connector = new Connector({ maxCurrent: 32, type: "Type1", id: 1 });
      const transaction = new Transaction({ transactionId: 1, connector, idTag: "ff" });

      jest.spyOn(simulator, "getTransaction").mockReturnValue(transaction);
      jest.spyOn(transaction, "start").mockReturnValue(undefined);
      const statusNotificationSpy = jest.spyOn(simulator, "sendStatusNotificationReq").mockResolvedValue(undefined);

      transaction["_isActive"] = true;
      pauseTransaction(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(transaction.isActive).toBe(false);
      expect(transaction.connector.status).toBe(ChargePointStatus.SUSPENDED_EV);
      expect(statusNotificationSpy).toHaveBeenCalledWith(connector);
    });
  });

  describe("resume transaction", () => {
    test("should return 400 if transaction is already active", () => {
      const mockRequest = { params: { transactionId: 1 } } as unknown as Request;
      const connector = new Connector({ maxCurrent: 32, type: "Type1", id: 1 });
      const transaction = new Transaction({ transactionId: 1, connector, idTag: "ff" });

      transaction.resume();
      jest.spyOn(simulator, "getTransaction").mockReturnValue(transaction);

      resumeTransaction(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test("should return 200 and resume transaction", () => {
      const mockRequest = { params: { transactionId: 1 } } as unknown as Request;
      const connector = new Connector({ maxCurrent: 32, type: "Type1", id: 1 });
      const transaction = new Transaction({ transactionId: 1, connector, idTag: "ff" });

      jest.spyOn(simulator, "getTransaction").mockReturnValue(transaction);
      jest.spyOn(transaction, "resume").mockReturnValue(undefined);
      const statusNotificationSpy = jest.spyOn(simulator, "sendStatusNotificationReq").mockResolvedValue(undefined);

      transaction["_isActive"] = false;
      resumeTransaction(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(transaction.isActive).toBe(false);
      expect(transaction.connector.status).toBe(ChargePointStatus.CHARGING);
      expect(statusNotificationSpy).toHaveBeenCalledWith(connector);
    });
  });

  describe("stopTransaction", () => {
    test("should return 400 if auth req failed and StopTransactionOnInvalidId is false", async () => {
      const mockRequest = { params: { transactionId: 1 }, body: { idTag: "aa" } } as unknown as Request;
      const connector = new Connector({ maxCurrent: 32, type: "Type1", id: 1 });
      const transaction = new Transaction({ transactionId: 1, connector, idTag: "ff" });
      const authRes = [OcppMessageType.RESULT, "id", { idTagInfo: { status: AuthorizationStatus.BLOCKED } }];

      jest.spyOn(simulator, "getTransaction").mockReturnValue(transaction);
      jest.spyOn(configService, "getConfig").mockReturnValue({ key: "StopTransactionOnInvalidId", value: "false", readonly: false });

      const dispatchSpy = jest.spyOn(ocppDispatcher, "authorizeReq");
      const sendReqSpy = jest.spyOn(simulator, "sendRequest").mockResolvedValue(authRes);

      await stopTransaction(mockRequest, mockResponse);

      expect(dispatchSpy).toHaveBeenCalledWith({ idTag: "aa" });
      expect(sendReqSpy).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test("should return 400 if id tag is not accepted", async () => {
      const mockRequest = { params: { transactionId: 1 }, body: { idTag: "ff" } } as unknown as Request;
      const connector = new Connector({ maxCurrent: 32, type: "Type1", id: 1 });
      const transaction = new Transaction({ transactionId: 1, connector, idTag: "ff" });

      const meterValue = {
        timestamp: new Date().toISOString(),
        sampledValue: [
          {
            unit: UnitOfMeasure.WH,
            context: ReadingContext.TRANSACTION_BEGIN,
            format: ValueFormat.RAW,
            location: Location.OUTLET,
            value: "0.00",
            measurand: Measurand.ENERGY_ACTIVE_IMPORT_REGISTER
          },
          {
            context: ReadingContext.TRANSACTION_BEGIN,
            format: ValueFormat.RAW,
            location: Location.OUTLET,
            unit: UnitOfMeasure.A, 
            measurand: Measurand.CURRENT_IMPORT, 
            value: "0.00",
          }
        ]
      };

      (transaction as any)["meterValues"] = [meterValue];

      const expectedTransactionData = transaction.meterValues.map((meterValue) => (
        ({ 
          ...meterValue, 
          sampledValue: meterValue.sampledValue.filter((s) => s.measurand === Measurand.ENERGY_ACTIVE_IMPORT_REGISTER) 
        })
      ));

      const expectedStopTransactionPayload = {
        idTag: transaction.idTag,
        meterStop: transaction.connector.totalEnergyImportedWh,
        transactionId: transaction.transactionId,
        reason: Reason.LOCAL,
        transactionData: expectedTransactionData,
        timestamp: expect.anything()
      };

      const stopTransactionResponse = [OcppMessageType.RESULT, "id", {
        idTagInfo: {
          status: AuthorizationStatus.BLOCKED
        }
      }];

      jest.spyOn(simulator, "getTransaction").mockReturnValue(transaction);
      jest.spyOn(transaction, "stop").mockReturnValue(undefined);
      jest.spyOn(configService, "getConfig").mockReturnValue({ key: "StopTransactionOnInvalidId", value: "false", readonly: false });

      const statusNotificationSpy = jest.spyOn(simulator, "sendStatusNotificationReq");
      const sendReqSpy = jest.spyOn(simulator, "sendRequest").mockResolvedValue(stopTransactionResponse);
      const removeTransactionSpy = jest.spyOn(simulator, "removeTransaction");
      const ocppDispatchSpy = jest.spyOn(ocppDispatcher, "stopTransactionReq");
      
      await stopTransaction(mockRequest, mockResponse);

      expect(statusNotificationSpy).toHaveBeenCalledTimes(2);
      expect(ocppDispatchSpy).toHaveBeenCalledWith(expectedStopTransactionPayload);
      expect(sendReqSpy).toHaveBeenCalledWith(expect.arrayContaining([expectedStopTransactionPayload]));
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(removeTransactionSpy).toHaveBeenCalledWith(transaction.transactionId);
    });

    test("should return 200 if idtag is accepted", async () => {
      const mockRequest = { params: { transactionId: 1 }, body: { idTag: "ff" } } as unknown as Request;
      const connector = new Connector({ maxCurrent: 32, type: "Type1", id: 1 });
      const transaction = new Transaction({ transactionId: 1, connector, idTag: "ff" });

      const meterValue = {
        timestamp: new Date().toISOString(),
        sampledValue: [
          {
            unit: UnitOfMeasure.WH,
            context: ReadingContext.TRANSACTION_BEGIN,
            format: ValueFormat.RAW,
            location: Location.OUTLET,
            value: "0.00",
            measurand: Measurand.ENERGY_ACTIVE_IMPORT_REGISTER
          },
          {
            context: ReadingContext.TRANSACTION_BEGIN,
            format: ValueFormat.RAW,
            location: Location.OUTLET,
            unit: UnitOfMeasure.A, 
            measurand: Measurand.CURRENT_IMPORT, 
            value: "0.00",
          }
        ]
      };

      (transaction as any)["meterValues"] = [meterValue];

      const expectedTransactionData = transaction.meterValues.map((meterValue) => (
        ({ 
          ...meterValue, 
          sampledValue: meterValue.sampledValue.filter((s) => s.measurand === Measurand.ENERGY_ACTIVE_IMPORT_REGISTER) 
        })
      ));

      const expectedStopTransactionPayload = {
        idTag: transaction.idTag,
        meterStop: transaction.connector.totalEnergyImportedWh,
        transactionId: transaction.transactionId,
        reason: Reason.LOCAL,
        transactionData: expectedTransactionData,
        timestamp: expect.anything()
      };

      const stopTransactionResponse = [OcppMessageType.RESULT, "id", {
        idTagInfo: {
          status: AuthorizationStatus.ACCEPTED
        }
      }];

      jest.spyOn(simulator, "getTransaction").mockReturnValue(transaction);
      jest.spyOn(transaction, "stop").mockReturnValue(undefined);
      jest.spyOn(configService, "getConfig").mockReturnValue({ key: "StopTransactionOnInvalidId", value: "false", readonly: false });

      const statusNotificationSpy = jest.spyOn(simulator, "sendStatusNotificationReq");
      const sendReqSpy = jest.spyOn(simulator, "sendRequest").mockResolvedValue(stopTransactionResponse);
      const removeTransactionSpy = jest.spyOn(simulator, "removeTransaction");
      const ocppDispatchSpy = jest.spyOn(ocppDispatcher, "stopTransactionReq");
      
      await stopTransaction(mockRequest, mockResponse);

      expect(statusNotificationSpy).toHaveBeenCalledTimes(2);
      expect(ocppDispatchSpy).toHaveBeenCalledWith(expectedStopTransactionPayload);
      expect(sendReqSpy).toHaveBeenCalledWith(expect.arrayContaining([expectedStopTransactionPayload]));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(removeTransactionSpy).toHaveBeenCalledWith(transaction.transactionId);
    });
  });
});
