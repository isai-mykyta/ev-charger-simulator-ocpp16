import { Request, Response } from "express";

import { configService } from "../configuration";
import { logger } from "../logger";
import { 
  AuthorizationStatus, 
  AuthorizeConf, 
  CallResultMessage, 
  ChargePointStatus,
  ocppDispatcher, 
  Reason, 
  StartTransactionConf
} from "../ocpp";
import { simulator } from "../simulator";
import { Transaction } from "../transaction";

export const connect = async (_: Request, res: Response): Promise<void> => {
  if (simulator.isOnline) {
    res.status(400).json({ error: "Simulator is already connected" });
    return;
  }

  try {
    await simulator.connectSimulator();
    res.status(200).json("Connected");
  } catch (error) {
    logger.error("Failed to connect simulator", { error });
    res.status(500).json({ error: "Failed to connect simulator" });
  }
};

export const disconnect = async (_: Request, res: Response): Promise<void> => {
  try {
    await simulator.disconnectSimulator();
    res.status(200).json("Disconnected");
  } catch (error) {
    logger.error("Failed to disconnect simulator", { error });
    res.status(500).json({ error: "Failed to disconnect simulator" });
  }
};

export const startTransaction = async (req: Request, res: Response): Promise<void> => {
  const connector = simulator.connectors.find((connector) => connector.id === req.body.connectorId);

  if (!connector) {
    res.status(400).json({ error: "Invalid connector id" });
    return;
  }

  if (!connector.isReadyToCharge) {
    res.status(400).json({ error: "Connector is not ready for charging" });
    return;
  }

  try {
    connector.status = ChargePointStatus.PREPARING;
    await simulator.sendStatusNotificationReq(connector);

    const authReq = ocppDispatcher.authorizeReq(req.body);
    const authRes = await simulator.sendRequest<CallResultMessage<AuthorizeConf>>(authReq);

    if (authRes[2].idTagInfo.status !== AuthorizationStatus.ACCEPTED) {
      logger.warn("Failed authorize attempt", { ...req.body });
      connector.status = ChargePointStatus.AVAILABLE;
      await simulator.sendStatusNotificationReq(connector);
      res.status(400).json(authRes);
      return;
    }

    const startTransactionReq = ocppDispatcher.startTransactionReq({
      connectorId: connector.id,
      idTag: req.body.idTag,
      meterStart: 1,
      timestamp: new Date().toISOString()
    });

    const startTransactionRes = await simulator.sendRequest<CallResultMessage<StartTransactionConf>>(startTransactionReq);
    
    if (startTransactionRes[2].idTagInfo.status !== AuthorizationStatus.ACCEPTED) {
      logger.warn("Failed start transaction attempt", { ...req.body });
      connector.status = ChargePointStatus.AVAILABLE;
      await simulator.sendStatusNotificationReq(connector);
      res.status(400).json(startTransactionRes);
      return;
    }

    res.status(200).json(startTransactionRes);

    connector.status = ChargePointStatus.CHARGING;
    await simulator.sendStatusNotificationReq(connector);

    const transaction = new Transaction({ 
      connector, 
      transactionId: startTransactionRes[2].transactionId,
      idTag: req.body.idTag
    });

    transaction.start();
    simulator.addTransaction(transaction);
  } catch (error) {
    logger.error("Failed to perform transaction", { error });
    res.status(500).json({ error: "Failed to perform transaction" });
    connector.status = ChargePointStatus.FAULTED;
    await simulator.sendStatusNotificationReq(connector);
  }
};

export const pauseTransaction = async (req: Request, res: Response): Promise<void> => {
  const transaction = simulator.getTransaction(Number(req.params.transactionId));

  if (!transaction.isActive) {
    res.status(400).json({ error: "Transaction is already paused" });
    return;
  }

  transaction.pause();
  res.status(200).json("Paused");

  transaction.connector.status = ChargePointStatus.SUSPENDED_EV;
  await simulator.sendStatusNotificationReq(transaction.connector);
};

export const resumeTransaction = async (req: Request, res: Response): Promise<void>  => {
  const transaction = simulator.getTransaction(Number(req.params.transactionId));

  if (transaction.isActive) {
    res.status(400).json({ error: "Transaction is already active" });
    return;
  }

  transaction.resume();
  res.status(200).json("Resumed");

  transaction.connector.status = ChargePointStatus.CHARGING;
  await simulator.sendStatusNotificationReq(transaction.connector);
};

export const stopTransaction = async (req: Request, res: Response): Promise<void> => {
  const idTag = req.body.idTag;
  const transaction = simulator.getTransaction(Number(req.params.transactionId));
  const stopTransactionOnInvalidId = configService.getConfig("StopTransactionOnInvalidId").value;

  if (idTag !== transaction.idTag) {
    const authReq = ocppDispatcher.authorizeReq({ idTag });
    const authRes = await simulator.sendRequest(authReq);
    const isAuthTokenAccepted = authRes[2].idTagInfo.status === AuthorizationStatus.ACCEPTED;

    if (!isAuthTokenAccepted && stopTransactionOnInvalidId === "false") {
      logger.warn("Failed authorize attempt on stop transaction", { ...req.body });
      res.status(400).json(authRes);
      return;
    }
  }

  transaction.connector.status = ChargePointStatus.FINISHING;
  await simulator.sendStatusNotificationReq(transaction.connector);
  transaction.stop();

  const stopTransactionReq = ocppDispatcher.stopTransactionReq({
    idTag: transaction.idTag,
    meterStop: transaction.connector.totalEnergyImportedWh,
    timestamp: new Date().toISOString(),
    transactionId: transaction.transactionId,
    reason: Reason.LOCAL,
    transactionData: transaction.getTransactionData(),
  });

  const stopTransactionRes = await simulator.sendRequest(stopTransactionReq);

  if (stopTransactionRes[2].idTagInfo.status !== AuthorizationStatus.ACCEPTED) {
    logger.warn("Failed stop transaction attempt", { transaction });
    res.status(400).json(stopTransactionRes);
  } else {
    res.status(200).json(stopTransactionRes);
  }

  transaction.connector.status = ChargePointStatus.AVAILABLE;
  await simulator.sendStatusNotificationReq(transaction.connector);
  simulator.removeTransaction(transaction.transactionId);
};
