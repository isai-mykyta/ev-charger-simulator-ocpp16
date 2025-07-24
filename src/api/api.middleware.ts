import { ClassConstructor } from "class-transformer";
import { Request, Response, NextFunction } from "express";

import { RegistrationStatus } from "../ocpp";
import { simulator } from "../simulator";
import { isValidIntString, validateDto } from "../utils";

export const validateBodyPayload = <D extends ClassConstructor<any>>(req: Request, res: Response, next: NextFunction, dto: D): void => {
  const { isValid, errors } = validateDto(req.body, dto);

  if (!isValid) {
    res.status(400).json({ message: "Invalid payload", errors });
    return;
  }

  next();
};

export const checkIsOnline = (_: Request, res: Response, next: NextFunction): void => {
  if (!simulator.isOnline) {
    res.status(400).json({ error: "Simulator is disconnected" });
    return;
  }

  next();
};

export const checkIsRegistered = (_: Request, res: Response, next: NextFunction): void => {
  if (simulator.registrationStatus !== RegistrationStatus.ACCEPTED) {
    res.status(400).json({ error: "Simulator is not registered by CPMS" });
    return;
  }

  next();
};

export const findTransaction = (req: Request, res: Response, next: NextFunction): void => {
  const txId = Number(req.params.transactionId);
  const isValidTxId = isValidIntString(txId.toString());
  
  if (!isValidTxId) {
    res.status(400).json({ error: "Invalid transaction id" });
    return;
  }
  
  const transaction = simulator.getTransaction(txId);
  
  if (!transaction) {
    res.status(404).json({ error: "Transaction is not found" });
    return;
  }

  next();
};
