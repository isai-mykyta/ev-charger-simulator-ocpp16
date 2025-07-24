import { KeyValue } from "../ocpp";
import { configuration } from "./configuration";
import { 
  CLOCK_ALIGNED_DATA_INTERVAL_MAX_VALUE,
  CLOCK_ALIGNED_DATA_INTERVAL_MIN_VALUE,
  GET_CONFIGURATION_MAX_KEYS_MAX_VALUE,
  GET_CONFIGURATION_MAX_KEYS_MIN_VALUE,
  HEARTBEAT_INTERVAL_MAX_VALUE, 
  HEARTBEAT_INTERVAL_MIN_VALUE, 
  METER_VALUE_SAMPLE_INTERVAL_MAX_VALUE, 
  METER_VALUE_SAMPLE_INTERVAL_MIN_VALUE, 
  WEBSOCKET_PING_INTERVAL_MAX_VALUE, 
  WEBSOCKET_PING_INTERVAL_MIN_VALUE
} from "../constants";
import { 
  inRange, 
  isBoolString, 
  isFiveOrTenDivisible, 
  isValidIntString 
} from "../utils/validators";

class ConfigService {
  private readonly _configuration = new Map<string, KeyValue>();

  private readonly configValidator = {
    HeartbeatInterval: (v: string) => isValidIntString(v) && inRange(Number(v), HEARTBEAT_INTERVAL_MIN_VALUE, HEARTBEAT_INTERVAL_MAX_VALUE),
    WebSocketPingInterval: (v: string) => isValidIntString(v) && inRange(Number(v), WEBSOCKET_PING_INTERVAL_MIN_VALUE, WEBSOCKET_PING_INTERVAL_MAX_VALUE),
    GetConfigurationMaxKeys: (v: string) => isValidIntString(v) && inRange(Number(v), GET_CONFIGURATION_MAX_KEYS_MIN_VALUE, GET_CONFIGURATION_MAX_KEYS_MAX_VALUE),
    MeterValueSampleInterval: (v: string) => isValidIntString(v) && inRange(Number(v), METER_VALUE_SAMPLE_INTERVAL_MIN_VALUE, METER_VALUE_SAMPLE_INTERVAL_MAX_VALUE),
    ClockAlignedDataInterval: (v: string) => isValidIntString(v) && inRange(Number(v), CLOCK_ALIGNED_DATA_INTERVAL_MIN_VALUE, CLOCK_ALIGNED_DATA_INTERVAL_MAX_VALUE) && (Number(v) > 0 ? isFiveOrTenDivisible(Number(v)) : true),
    AuthorizeRemoteTxRequests: (v: string) => isBoolString(v),
    StopTransactionOnInvalidId: (v: string) => isBoolString(v),
  };

  constructor (configuration: KeyValue[]) {
    configuration.forEach((config) => this._configuration.set(config.key, config));
  }

  public get configuration(): KeyValue[] {
    return Array.from(this._configuration.values());
  }

  public getConfig(key: string): KeyValue {
    return this._configuration.get(key);
  }

  public setConfig(key: string, value: string): void {
    const config = this.getConfig(key);
    if (config) this._configuration.set(key, { ...config, value });
  }

  public validateConfigValue(key: string, value: string): boolean {
    return this.configValidator[key] ? this.configValidator[key](value) : false;
  }
}

export const configService = new ConfigService(configuration);
