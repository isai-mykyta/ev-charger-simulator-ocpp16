import { Request, Response } from "express";

import { 
  checkIsOnline, 
  checkIsRegistered, 
  findTransaction, 
  StartTransactionReqDto, 
  validateBodyPayload 
} from "../../api";
import { Connector } from "../../connector";
import { RegistrationStatus } from "../../ocpp";
import { simulator } from "../../simulator";
import { Transaction } from "../../transaction";

const mockRequest = { body: {} } as Request;
const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
const mockNext = jest.fn();

describe("API middleware", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("checkIsOnline", () => {
    test("should return 400 if charger is offline", () => {
      jest.spyOn(simulator, "isOnline", "get").mockReturnValue(false);
      checkIsOnline(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test("should call next if charger is online", () => {
      jest.spyOn(simulator, "isOnline", "get").mockReturnValue(true);
      checkIsOnline(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("checkIsRegistered", () => {
    test("should return 400 if charger is not registered", () => {
      jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.REJECTED);
      checkIsRegistered(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test("should call next if charger is registered", () => {
      jest.spyOn(simulator, "registrationStatus", "get").mockReturnValue(RegistrationStatus.ACCEPTED);
      checkIsOnline(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("validateBodyPayload", () => {
    test("should return 400 if payload is invalid", () => {
      validateBodyPayload({ ...mockRequest, body: {} } as unknown as Request, mockResponse, mockNext, StartTransactionReqDto);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test("should call next if payload is valid", () => {
      const validPayload = { connectorId: 1, idTag: "MOCK-ID-TAG" };
      validateBodyPayload({ ...mockRequest, body: validPayload } as unknown as Request, mockResponse, mockNext, StartTransactionReqDto);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("findTransaction", () => {
    test("should return 400 if transaction id is invalid", () => {
      const mockRequest = { params: { transactionId: "ff" } } as unknown as Request;
      findTransaction(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test("should return 400 if transaction is not found", () => {
      const mockRequest = { params: { transactionId: "1" } } as unknown as Request;
      jest.spyOn(simulator, "getTransaction").mockReturnValue(undefined);
      findTransaction(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test("should call next if transaction is found", () => {
      const mockRequest = { params: { transactionId: "1" } } as unknown as Request;
      const connector = new Connector({ maxCurrent: 32, type: "Type1", id: 1 });
      const transaction = new Transaction({ transactionId: 1, connector, idTag: "ff" });

      jest.spyOn(simulator, "getTransaction").mockReturnValue(transaction);
      findTransaction(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
