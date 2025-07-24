import { Router } from "express";

import { 
  connect, 
  disconnect, 
  pauseTransaction, 
  resumeTransaction, 
  startTransaction, 
  stopTransaction
} from "./api.controller";
import { 
  checkIsOnline, 
  checkIsRegistered, 
  findTransaction, 
  validateBodyPayload 
} from "./api.middleware";
import { 
  StartTransactionReqDto, 
  StopTransactionReqDto 
} from "./dtos";

const apiRouter = Router();

apiRouter.post(
  "/connect", 
  connect
);

apiRouter.post(
  "/disconnect", 
  checkIsOnline, 
  disconnect
);

apiRouter.post(
  "/start-transaction", 
  checkIsOnline,
  checkIsRegistered,
  (req, res, next) => validateBodyPayload(req, res, next, StartTransactionReqDto), 
  startTransaction
);

apiRouter.post(
  "/pause-transaction/:transactionId",
  findTransaction,
  pauseTransaction
);

apiRouter.post(
  "/resume-transaction/:transactionId",
  findTransaction,
  resumeTransaction
);

apiRouter.post(
  "/stop-transaction/:transactionId",
  findTransaction,
  (req, res, next) => validateBodyPayload(req, res, next, StopTransactionReqDto), 
  stopTransaction
);

export { apiRouter };
