import { logger } from "../../logger";
import { simulator } from "../../simulator";
import { ocppDispatcher } from "../ocpp-dispatch";
import { 
  AuthorizationStatus,
  ChargePointStatus, 
  Reason, 
  ResetReq, 
  ResetStatus, 
  ResetType 
} from "../types";

export const handleResetReq = async (id: string, payload: ResetReq): Promise<void>  => {
  for (const transaction of simulator.transactions) {
    transaction.connector.status = ChargePointStatus.FINISHING;
    await simulator.sendStatusNotificationReq(transaction.connector);
    transaction.stop();

    const stopTransactionReq = ocppDispatcher.stopTransactionReq({
      idTag: transaction.idTag,
      meterStop: transaction.connector.totalEnergyImportedWh,
      timestamp: new Date().toISOString(),
      transactionId: transaction.transactionId,
      reason: payload.type === ResetType.SOFT ? Reason.SOFT_RESET : Reason.HARD_RESET,
      transactionData: transaction.getTransactionData(),
    });

    const stopTransactionRes = await simulator.sendRequest(stopTransactionReq);
    simulator.removeTransaction(transaction.transactionId);

    if (stopTransactionRes[2]?.idTagInfo?.status !== AuthorizationStatus.ACCEPTED) {
      logger.warn("ID Tag token is not accepted on stop tx request", { transaction });
    }
  }

  for (const connector of simulator.connectors) {
    connector.status = ChargePointStatus.UNAVAILABLE;
    connector.isEnabled = false;
    await simulator.sendStatusNotificationReq(connector);
  }

  const resetRes = ocppDispatcher.resetConf(id, { status: ResetStatus.ACCEPTED });
  simulator.sendMsg(resetRes);

  await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000)); // wait for msg being delivered
  await simulator.disconnectSimulator();
  await simulator.connectSimulator();
};
