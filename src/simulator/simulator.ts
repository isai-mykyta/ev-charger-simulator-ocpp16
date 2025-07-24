import { RawData } from "ws";

import { configService } from "../configuration";
import { Connector } from "../connector";
import { logger } from "../logger";
import { 
  CallMessage,
  ChargePointErrorCode,
  ChargePointStatus,
  ocppDispatcher,
  ocppHandler,
  OcppMessage,
  RegistrationStatus,
} from "../ocpp";
import { Transaction } from "../transaction";
import { withTimeout } from "../utils";
import { WebSocketClient } from "../websocket";

export class Simulator extends WebSocketClient {
  public readonly webSocketUrl: string;
  public readonly identity: string;
  public readonly model: string;
  public readonly vendor: string;
  public readonly chargePointSerialNumber: string;
  public readonly pendingRequests = new Map<string, CallMessage<unknown>>();

  private _isOnline: boolean = false;
  private _registrationStatus: RegistrationStatus;
  private _heartbeatInterval: number;

  private heartbeatTimer: NodeJS.Timeout;

  private readonly _connectors = new Map<number, Connector>();
  private readonly _transactions = new Map<number, Transaction>();

  constructor () {
    super();

    this.webSocketUrl = process.env.CHARGE_POINT_WEBSOCKET_URL;
    this.identity = process.env.CHARGE_POINT_IDENTITY;
    this.model = process.env.CHARGE_POINT_MODEL;
    this.vendor = process.env.CHARGE_POINT_VENDOR;
    this.chargePointSerialNumber = process.env.CHARGE_POINT_SERIAL_NUMBER;

    const { connectors } = JSON.parse(configService.getConfig("Connectors").value);

    connectors.forEach(({ maxCurrent, pos, type }) => 
      this._connectors.set(pos, new Connector({ maxCurrent, id: pos, type }))
    );
  }

  private handleAcceptedRegistrationStatus(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendRequest(ocppDispatcher.hearbeatReq());
    }, this._heartbeatInterval * 1000);

    this.connectors.forEach((connector) => {
      connector.status = ChargePointStatus.AVAILABLE;
      connector.isEnabled = true;
    });

    this.sendRequest(
      ocppDispatcher.statusNotificationReq({
        connectorId: 0,
        status: ChargePointStatus.AVAILABLE,
        errorCode: ChargePointErrorCode.NO_ERROR
      })
    );
  }

  private handleRejectedRegistrationStatus(): void {
    setTimeout(() => {
      this.sendRequest(
        ocppDispatcher.bootNotificationReq({
          chargePointModel: this.model,
          chargePointVendor: this.vendor,
          chargePointSerialNumber: this.chargePointSerialNumber,
        })
      );
    }, this._heartbeatInterval * 1000);
  }

  private async handleOcppWsResponse<R>(reqId: string): Promise<R> {
    return new Promise((resolve, reject) => {
      this.client.once("message", (message) => {
        try {
          const response = JSON.parse(message.toString());

          if (response[1] === reqId) {
            resolve(response);
            return;
          }
          
        } catch (error) {
          logger.error("Failed to send ws request", { error });
          reject("Failed to send ws request");
        }
      });
    });
  }

  public set registrationStatus(status: RegistrationStatus) {
    this._registrationStatus = status;

    switch (status) {
    case RegistrationStatus.ACCEPTED:
      this.handleAcceptedRegistrationStatus();
      break;
    case RegistrationStatus.REJECTED:
      this.handleRejectedRegistrationStatus();
      break;
    default: 
      break;
    }
  }

  public get registrationStatus(): RegistrationStatus {
    return this._registrationStatus;
  }

  public set heartbeatInterval(interval: number) {
    if (interval < 10) return;
    configService.setConfig("HeartbeatInterval", `${interval}`);
    this._heartbeatInterval = interval;
  }

  public async connectSimulator(): Promise<void> {
    const pingInterval = Number(configService.getConfig("WebSocketPingInterval").value);

    await this.connect({
      url: `${this.webSocketUrl}/${this.identity}`,
      pingInterval
    });

    this.client.on("close", () => this._isOnline = false);
    this.client.on("message", (data: RawData) => ocppHandler.handleMessage(JSON.parse(data?.toString())));
    this._isOnline = true;

    const bootNotificationReq = ocppDispatcher.bootNotificationReq({
      chargePointModel: this.model,
      chargePointVendor: this.vendor,
      chargePointSerialNumber: this.chargePointSerialNumber,
    });

    this.sendRequest(bootNotificationReq);
  }

  public async disconnectSimulator(): Promise<void> {
    await this.disconnect();
    this.client.removeAllListeners();
    this._isOnline = false;
    this.registrationStatus = null;

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.connectors.forEach((connector) => {
      connector.isEnabled = false;
      connector.status = ChargePointStatus.UNAVAILABLE;
    });
  }

  public sendMsg(request: OcppMessage): void {
    this.send(JSON.stringify(request));
  }

  public async sendRequest<R = unknown>(request: CallMessage<unknown>): Promise<R> {
    const [, id] = request;
    this.sendMsg(request);
    this.pendingRequests.set(id, request);

    return await withTimeout(this.handleOcppWsResponse(id), 60_000, "Failed to receive OCPP WS response within 60 seconds");
  }

  public async sendStatusNotificationReq(connector: Connector): Promise<void> {
    await this.sendRequest(ocppDispatcher.statusNotificationReq({
      connectorId: connector.id,
      errorCode: connector.errorCode,
      status: connector.status,
      timestamp: new Date().toISOString(),
    }));
  }

  public addTransaction(transaction: Transaction): void {
    this._transactions.set(transaction.transactionId, transaction);
  }

  public removeTransaction(transactionId: number): void {
    this._transactions.delete(transactionId);
  }

  public getTransaction(transactionId: number): Transaction {
    return this._transactions.get(transactionId);
  }

  public get isOnline(): boolean {
    return this._isOnline;
  }

  public get connectors(): Connector[] {
    return Array.from(this._connectors.values());
  }

  public get transactions(): Transaction[] {
    return Array.from(this._transactions.values());
  }
}

export const simulator = new Simulator();
