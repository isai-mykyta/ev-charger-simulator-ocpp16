export enum OcppMessageType {
  CALL = 2,
  RESULT = 3,
  ERROR = 4
}

export enum OcppMessageAction {
  HEARTBEAT = "Heartbeat",
  RESET = "Reset",
  BOOT_NOTIFICATION = "BootNotification",
  GET_CONFIGURATION = "GetConfiguration",
  CHANGE_CONFIGURATION = "ChangeConfiguration",
  REMOTE_STOP_TRANSACTION = "RemoteStopTransaction",
  REMOTE_START_TRANSACTION = "RemoteStartTransaction",
  STATUS_NOTIFICATION = "StatusNotification",
  START_TRANSACTION = "StartTransaction",
  STOP_TRANSACTION = "StopTransaction",
  METER_VALUES = "METER_VALUES",
  AUTHORIZE = "AUTHORIZE",
}

export enum OcppErrorCode {
  NOT_IMPLEMENTED = "NotImplemented", // Requested Action is not known by receiver
  NOT_SUPPORTED = "NotSupported", // Requested Action is recognized but not supported by the receiver
  INTERNAL_ERROR = "InternalError", // An internal error occurred and the receiver was not able to process the requested Action successfully
  PROTOCOL_ERROR = "ProtocolError", // Payload for Action is incomplete
  SECURITY_ERROR = "SecurityError", // During the processing of Action a security issue occurred preventing receiver from completing the Action successfully
  FORMATION_VIOLATION = "FormationViolation", // Payload for Action is syntactically incorrect or not conform the PDU structure for Action
  PROPERTY_CONSTRAINT_VIOLATION = "PropertyConstraintViolation", // Payload is syntactically correct but at least one field contains an invalid value
  OCCURENCE_CONSTRAINT_VIOLATION = "OccurenceConstraintViolation", // Payload for Action is syntactically correct but at least one of the fields violates occurence constraints
  TYPE_CONSTRAINT_VIOLATION = "TypeConstraintViolation", // Payload for Action is syntactically correct but at least one of the fields violates data type constraints
  GENERIC_ERROR = "GenericError" // Any other error not covered by the previous ones
}

export enum RegistrationStatus {
  ACCEPTED = "Accepted",
  PENDING = "Pending",
  REJECTED = "Rejected"
}

export enum ChargePointStatus {
  AVAILABLE = "Available",
  PREPARING = "Preparing",
  CHARGING = "Charging",
  SUSPENDED_EVSE = "SuspendedEVSE",
  SUSPENDED_EV = "SuspendedEV",
  FINISHING = "Finishing",
  RESERVED = "Reserved",
  UNAVAILABLE = "Unavailable",
  FAULTED = "Faulted"
}

export enum ChargePointErrorCode {
  CONNECTOR_LOCK_FAILURE = "ConnectorLockFailure",
  EV_COMMUNICATION_ERROR = "EVCommunicationError",
  GROUND_FAILURE = "GroundFailure",
  HIGH_TEMPERATURE = "HighTemperature",
  INTERNAL_ERROR = "InternalError",
  LOCAL_LIST_CONFLICT = "LocalListConflict",
  NO_ERROR = "NoError",
  OTHER_ERROR = "OtherError",
  OVER_CURRENT_FAILURE = "OverCurrentFailure",
  OVER_VOLTAGE = "OverVoltage",
  POWER_METER_FAILURE = "PowerMeterFailure",
  POWER_SWITCH_FAILURE = "PowerSwitchFailure",
  READER_FAILURE = "ReaderFailure",
  RESET_FAILURE = "ResetFailure",
  UNDER_VOLTAGE = "UnderVoltage",
  WEAK_SIGNAL = "WeakSignal"
}

export enum AuthorizationStatus {
  ACCEPTED = "Accepted",
  BLOCKED = "Blocked",
  EXPIRED = "Expired",
  INVALID = "Invalid",
  CONCURRENT_TX = "ConcurrentTx"
}

export enum ConfigurationStatus {
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
  REBOOT_REQUIRED = "RebootRequired",
  NOT_SUPPORTED = "NotSupported"
}

export enum ResetType {
  HARD = "Hard",
  SOFT = "Soft"
}

export enum ResetStatus {
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
}

export enum ReadingContext {
  INTERUPTION_BEGIN = "Interruption.Begin", // Value taken at start of interruption.
  INTERUPTION_END = "Interruption.End", // Value taken when resuming after interruption.
  OTHER = "Other", // Value for any other situations.
  SAMPLE_CLOCK = "Sample.Clock", // Value taken at clock aligned interval.
  SAMPLE_PERIODIC = "Sample.Periodic", // Value taken as periodic sample relative to start time of transaction.
  TRANSACTION_BEGIN = "Transaction.Begin", // Value taken at start of transaction.
  TRANSACTION_END = "Transaction.End", // Value taken at end of transaction.
  TRIGGER = "Trigger", // Value taken in response to a TriggerMessage.req
}

/**
 * Import is energy flow from the Grid to the Charge Point, EV or other load.
 * Export is energy flow from the EV to the Charge Point and/or from the Charge Point to the Grid.
 * Default value of "measurand" is always "Energy.Active.Import.Register"
 */
export enum Measurand {
  /**
   * Measures the instantaneous current (in amperes) flowing out of the EV back to the Charge Point, and potentially to the grid.
   * */
  CURRENT_EXPORT = "Current.Export",
  /**
   * Measures the instantaneous current (in amperes) flowing from the Charge Point into the EV.
   */
  CURRENT_IMPORT = "Current.Import",
  /**
   * Indicates the maximum current (in amperes) that the Charge Point (CP) is willing to provide to the EV at that moment.
   */
  CURRENT_OFFERED = "Current.Offered",
  /**
   * Measures energy flowing from EV → CP → Grid. Grows over time as the integral of current (amps) × voltage × time
   */
  ENERGY_ACTIVE_EXPORT_REGISTER = "Energy.Active.Export.Register",
  /**
   *  Measures energy flowing from Grid → CP → EV
   */
  ENERGY_ACTIVE_IMPORT_REGISTER = "Energy.Active.Import.Register",
  /**
   * The total amount of reactive energy (in VARh or kVARh) sent from EV → CP → Grid since the meter was installed or last reset.
   */
  ENERGY_REACTIVE_EXPORT_REGISTER = "Energy.Reactive.Export.Register",
  /**
   * The total amount of reactive energy (in VARh or kVARh) absorbed from Grid → CP → EV since the meter was installed/reset.
   */
  ENERGY_REACTIVE_IMPORT_REGISTER = "Energy.Reactive.Import.Register",
  /**
   * The amount of active energy (Wh or kWh) sent from EV → CP → Grid during a specific interval of time.
   * It represents the delta (difference) between two meter readings taken at the start and end of the interval.
   */
  ENERTY_ACTIVE_EXPORT_INTERVAL = "Energy.Active.Export.Interval",
  /**
   * The amount of active energy (Wh or kWh) pulled from Grid → CP → EV during a specific interval of time.
   * It shows how much energy was imported only in this interval, not since installation.
   */
  ENERGY_ACTIVE_IMPORT_INTERVAL = "Energy.Active.Import.Interval",
  /**
   * The amount of reactive energy (VARh or kVARh) sent from EV → CP → Grid during a specific time interval.
   * Shows the reactive energy exported only during the configured time slice (e.g., last 5 minutes).
   */
  ENERGY_REACTIVE_EXPORT_INTERVAL = "Energy.Reactive.Export.Interval",
  /**
   * The amount of reactive energy (VARh or kVARh) absorbed from Grid → CP → EV during a specific time interval.
   * Shows reactive energy drawn only for this time slice.
   */
  ENERGY_REACTIVE_IMPORT_INTERVAL = "Energy.Reactive.Import.Interval",
  /**
   * Measures the powerline frequency (in Hertz, Hz) at the point where the Charge Point (CP) is connected to the grid.
   * OCPP 1.6 does not have a UnitOfMeasure for frequency, the UnitOfMeasure for any SampledValue with measurand: Frequency is Hertz.
   * It represents how fast AC voltage cycles per second:
   * - 50 Hz (Europe, Asia, etc.)
   * 60 Hz (North America, parts of Japan)
   */
  FREQUENCY = "Frequency",
  /**
   * The instantaneous active power (W or kW) flowing from Grid → CP → EV at this very moment.
   * Power (W) = Voltage (V) × Current (A) × Power Factor
   */
  POWER_ACTIVE_EXPORT = "Power.Active.Export",
  /**
   * The instantaneous active power (W or kW) flowing from EV → CP → Grid at this very moment.
   * This applies to bi-directional chargers (V2G) only.
   */
  POWER_ACTIVE_IMPORT = "Power.Active.Import",
  /**
   * The instantaneous power factor of the energy flow at the Charge Point.
   * Power Factor (PF) is the ratio of real power (kW) to apparent power (kVA):
   * PF = Real Power (kW) ÷ Apparent Power (kVA)
   */
  POWER_FACTOR = "Power.Factor",
  /**
   * The maximum power (W or kW) that the Charge Point is currently willing to deliver to the EV.
   * This is how much power you’re allowed to draw if you want.
   */
  POWER_OFFERED = "Power.Offered", 
  /**
   * The instantaneous reactive power (VAR or kVAR) flowing from EV → CP → Grid at this very moment.
   * Happens in bi-directional setups (V2G), where the EV may act as a grid support device by generating reactive power.
   * Unit: VAR (volt-ampere reactive) or kVAR (1,000 VAR).
   */
  POWER_REACTIVE_EXPORT = "Power.Reactive.Export",
  /**
   * The instantaneous reactive power (VAR or kVAR) flowing from Grid → CP → EV at this very moment.
   * Happens any time the EVSE’s inductive/capacitive hardware requires reactive power to function.
   * Unit: VAR or kVAR
   */
  POWER_REACTIVE_IMPORT = "Power.Reactive.Import",
  /**
   * The rotational speed of a fan or motor in the Charge Point (or in some rare cases, the EV).
   * Used to monitor cooling systems inside the CP.
   * Unit: RPM (revolutions per minute).
   */
  RPM = "RPM",
  /**
   * The State of Charge (SoC) of the EV’s battery, in percentage (%).
   * Unit: % (0–100%)
   */
  SOC = "SoC",
  /**
   * The temperature reading inside the Charge Point (or at another measurement point like the inlet or connector).
   * Helps monitor CP operation and detect overheating.
   * Unit: °C or °F
   */
  TEMPERATURE = "Temperature",
  /**
   * The instantaneous AC RMS voltage at the measurement point.
   * What’s the grid voltage right now at the CP.
   * Unit: V (Volts)
   */
  VOLTAGE = "Voltage",
}

/**
 * Phase as used in SampledValue. Phase specifies how a measured value is to be interpreted. 
 * Please note that not all values of Phase are applicable to all Measurands.
 */
export enum Phase {
  L1 = "L1", // Measured on L1
  L2 = "L2", // Measured on L2
  L3 = "L3", // Measured on L3
  N = "N", // Measured on Neutral
  L1_N = "L1-N", // Measured on L1 with respect to Neutral conductor
  L2_N = "L2-N", // Measured on L2 with respect to Neutral conductor
  L3_N = "L3-N", // Measured on L3 with respect to Neutral conductor
  L1_L2 = "L1-L2", // Measured between L1 and L2
  L2_L3 = "L2-L3", // Measured between L2 and L3
  L3_L1 = "L3-L1", // Measured between L3 and L1
}

export enum UnitOfMeasure {
  WH = "Wh",
  KWH = "kWh",
  VARH = "varh",
  KVARH = "kvarh",
  W = "w",
  KW = "kW",
  VA = "VA",
  KVA = "kVA",
  VAR = "var",
  KVAR = "kvar",
  A = "A",
  V = "V",
  CELCIUS = "Celcius",
  FAHRENHEIT = "Fahrenheit",
  K = "K",
  PERCENT = "Percent",
}

export enum Location {
  BODY = "Body", // Measurement inside body of Charge Point (e.g. Temperature)
  CABLE = "Cable", // Measurement taken from cable between EV and Charge Point
  EV = "EV", // Measurement taken by EV
  INLET = "Inlet", // Measurement at network (“grid”) inlet connection
  OUTLET = "Outlet", // Measurement at a Connector. Default value
}

export enum ValueFormat {
  RAW = "Raw", // Data is to be interpreted as integer/decimal numeric data.
  SIGNED_DATA = "SignedData" // Data is represented as a signed binary data block, encoded as hex data.
}

export enum Reason {
  DE_AUTHORIZED = "DeAuthorized", // The transaction was stopped because of the authorization status in a StartTransaction.conf
  EMERGENCY_STOP = "EmergencyStop", // Emergency stop button was used.
  EV_DISCONNECTED = "EVDisconnected", // disconnecting of cable, vehicle moved away from inductive charge unit.
  HARD_RESET = "HardReset", // A hard reset command was received.
  LOCAL = "Local", // Stopped locally on request of the user at the Charge Point. This is a regular termination of a transaction. Examples: presenting an RFID tag, pressing a button to stop.
  OTHER = "Other", // Any other reason
  POWER_LOSS = "PowerLoss", // Complete loss of power.
  REBOOT = "Reboot", // A locally initiated reset/reboot occurred. (for instance watchdog kicked in)
  REMOTE = "Remote", // Stopped remotely on request of the user. This is a regular termination of a transaction. Examples: termination using a smartphone app, exceeding a (non local) prepaid credit.
  SOFT_RESET = "SoftReset", // A soft reset command was received.
  UNLOCK_COMMAND = "UnlockCommand", // Central System sent an Unlock Connector command.
}

export type CallMessage<P> = [OcppMessageType.CALL, string, OcppMessageAction, P];
export type CallResultMessage<P> = [OcppMessageType.RESULT, string, P];
export type CallErrorMessage = [OcppMessageType.ERROR, string, OcppErrorCode, string, string];
export type OcppMessage<P = unknown> = CallMessage<P> | CallResultMessage<P> | CallErrorMessage;

export type KeyValue = {
  key: string;
  readonly: boolean;
  value?: string;
}

export type StatusNotificationReq = {
  connectorId: number;
  errorCode: ChargePointErrorCode;
  info?: string;
  status: ChargePointStatus;
  timestamp?: string;
  vendorId?: string;
  vendorErrorCode?: string;
}

export type BootNotificationReq = {
  chargeBoxSerialNumber?: string;
  chargePointModel: string;
  chargePointSerialNumber?: string;
  chargePointVendor: string;
  firmwareVersion?: string;
  iccid?: string;
  imsi?: string;
  meterSerialNumber?: string;
  meterType?: string;
}

export type BootNotificationConf = {
  currentTime: string;
  interval: number;
  status: RegistrationStatus;
}

export type AuthorizeReq = {
  idTag: string;
}

export type AuthorizeConf = {
  idTagInfo: {
    expiryDate?: string;
    parentIdTag?: string;
    status: AuthorizationStatus;
  }
}

export type StartTransactionReq = {
  connectorId: number;
  idTag: string;
  meterStart: number;
  reservationId?: number;
  timestamp: string;
}

export type StartTransactionConf = {
  idTagInfo: {
    expiryDate?: string;
    parentIdTag?: string;
    status: AuthorizationStatus;
  },
  transactionId: number;
}

export type GetConfigurationReq = {
  key?: string[];
}

export type GetConfigurationConf = {
  configurationKey?: KeyValue[];
  unknownKey?: string[];
}

export type ChangeConfigurationReq = {
  key: string;
  value: string;
}

export type ChangeConfigurationConf = {
  status: ConfigurationStatus;
}

export type ResetReq = {
  type: ResetType;
}

export type ResetConf = {
  status: ResetStatus;
}

export type SampledValue = {
  value: string;
  context?: ReadingContext; // Type of detail value: start, end or sample. Default = “Sample.Periodic”
  format?: ValueFormat; // Raw or signed data. Default = “Raw”
  measurand?: Measurand;
  phase?: Phase; // indicates how the measured value is to be interpreted. For instance between L1 and neutral (L1-N) Please note that not all values of phase are applicable to all Measurands. When phase is absent, the measured value is interpreted as an overall value.
  location?: Location; // Location of measurement. Default=”Outlet”
  unit?: UnitOfMeasure; // Unit of the value. Default = “Wh” if the (default) measurand is an “Energy” type.
}

export type MeterValue = {
  timestamp: string;
  sampledValue: SampledValue[];
}

export type MeterValuesReq = {
  connectorId: number;
  transactionId?: number;
  meterValue: MeterValue;
}

export type MeterValuesConf = {}

export type StopTransactionReq = {
  idTag?: string;
  meterStop: number;
  timestamp: string;
  transactionId: number;
  reason?: Reason;
  transactionData?: MeterValue[];
}

export type IdTagInfo = {
  expiryDate?: string;
  parentIdTag?: string;
  status: AuthorizationStatus;
}

export type StopTransactionConf = {
  idTagInfo: IdTagInfo;
}
