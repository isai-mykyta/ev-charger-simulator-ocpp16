import { Connector } from "../../../connector";
import { 
  AuthorizationStatus,
  ChargePointStatus, 
  handleResetReq, 
  ocppDispatcher, 
  OcppMessageType, 
  ResetStatus, 
  ResetType 
} from "../../../ocpp";
import { simulator } from "../../../simulator";
import { Transaction } from "../../../transaction";

describe("handleResetReq", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should handle reset req", async () => {
    const connector1 = new Connector({ id: 1, type: "Type1", maxCurrent: 100 });
    const connector2 = new Connector({ id: 2, type: "Type1", maxCurrent: 100 });
    const connectors = [connector1, connector2];

    const transaction1 = new Transaction({ transactionId: 1, connector: connector1, idTag: "ff" });
    const transaction2 = new Transaction({ transactionId: 1, connector: connector2, idTag: "ff" });
    const transactions = [transaction1, transaction2];

    const expectedResponse = [OcppMessageType.RESULT, "id", { status: ResetStatus.ACCEPTED }];
    const stopTxResponse = [OcppMessageType.RESULT, "id", { idTagInfo: { status: AuthorizationStatus.ACCEPTED } }];

    jest.spyOn(simulator, "connectors", "get").mockReturnValue(connectors);
    jest.spyOn(simulator, "transactions", "get").mockReturnValue(transactions);

    const transaction1Stop = jest.spyOn(transaction1, "stop").mockReturnValue();
    const transaction2Stop = jest.spyOn(transaction2, "stop").mockReturnValue();
    const sendMsgSpy = jest.spyOn(simulator, "sendMsg").mockReturnValue();
    const disconnectSpy = jest.spyOn(simulator, "disconnectSimulator").mockResolvedValue();
    const connectSpy = jest.spyOn(simulator, "connectSimulator").mockResolvedValue();
    const statusNotificationSpy = jest.spyOn(simulator, "sendStatusNotificationReq").mockResolvedValue();
    const sendReqSpy = jest.spyOn(simulator, "sendRequest").mockResolvedValue(stopTxResponse);
    const stopTransactionReqSpy = jest.spyOn(ocppDispatcher, "stopTransactionReq");
    const removeTransactionSpy = jest.spyOn(simulator, "removeTransaction").mockReturnValue();

    await handleResetReq("id", { type: ResetType.SOFT });

    expect(connector1.status).toBe(ChargePointStatus.UNAVAILABLE);
    expect(connector2.status).toBe(ChargePointStatus.UNAVAILABLE);
    expect(connector1.isEnabled).toBe(false);
    expect(connector2.isEnabled).toBe(false);
    expect(statusNotificationSpy).toHaveBeenCalledTimes(4);
    expect(sendMsgSpy).toHaveBeenCalledWith(expectedResponse);
    expect(sendReqSpy).toHaveBeenCalledTimes(2);
    expect(disconnectSpy).toHaveBeenCalled();
    expect(connectSpy).toHaveBeenCalled();
    expect(transaction1Stop).toHaveBeenCalled();
    expect(transaction2Stop).toHaveBeenCalled();
    expect(stopTransactionReqSpy).toHaveBeenCalledTimes(2);
    expect(removeTransactionSpy).toHaveBeenCalledTimes(2);
  });
});
