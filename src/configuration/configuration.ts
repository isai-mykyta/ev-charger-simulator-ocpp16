export const configuration = [
  {
    key: "HeartbeatInterval",
    value: "1800",
    readonly: false
  },
  {
    key: "ChargePointVendor",
    value: process.env.CHARGE_POINT_VENDOR,
    readonly: true
  },
  {
    key: "Connectors",
    value: `{"connectors":[{"maxCurrent":32,"pos":1,"type":"Type2"},{"maxCurrent":500,"pos":2,"type":"CCS"}]}`,
    readonly: true
  },
  {
    key: "FirmwareVersion",
    value: process.env.CHARGE_POINT_FIRMWARE_VERSION,
    readonly: true
  },
  {
    key: "WebSocketPingInterval",
    value: process.env.CHARGE_POINT_WEBSOCKET_PING_INTERVAL,
    readonly: false
  },
  {
    key: "WebSocketUrl",
    value: process.env.CHARGE_POINT_WEBSOCKET_URL,
    readonly: true
  },
  {
    key: "ChargePointSerialNumber",
    value: process.env.CHARGE_POINT_SERIAL_NUMBER,
    readonly: true
  },
  {
    key: "GetConfigurationMaxKeys",
    value: "100",
    readonly: false,
  },
  /**
   * Sampled measurands to be included in a MeterValues.req PDU, every MeterValueSampleInterval seconds. 
   * Where applicable, the Measurand is combined with the optional phase; for instance: 
   * Voltage.L1 Default: "Energy.Active.Import.Register"
   */
  {
    key: "MeterValuesSampledData",
    value: "Current.Import,Energy.Active.Import.Register,Power.Active.Import,Voltage",
    readonly: true
  },
  {
    key: "AuthorizeRemoteTxRequests",
    value: "false",
    readonly: false
  },
  /**
   * The phase rotation per connector in respect to the connector’s electrical meter (or if absent, the grid connection). 
   * Possible values per connector are:
   * NotApplicable (for Single phase or DC Charge Points)
   * Unknown (not (yet) known)
   * RST (Standard Reference Phasing)
   * RTS (Reversed Reference Phasing)
   * SRT (Reversed 240 degree rotation)
   * STR (Standard 120 degree rotation)
   * TRS (Standard 240 degree rotation)
   * TSR (Reversed 120 degree rotation)
   * R can be identified as phase 1 (L1), S as phase 2 (L2), T as phase 3 (L3).
   * If known, the Charge Point MAY also report the phase rotation between the grid connection and the main energymeter by using index number Zero (0).
   * Values are reported in CSL, formatted: 0.RST, 1.RST, 2.RTS
   */
  {
    key: "ConnectorPhaseRotation",
    value: "0.RST,1.RST,2.NotApplicable",
    readonly: true
  },
  /**
   * Maximum number of items in a ConnectorPhaseRotation Configuration Key.
   */
  {
    key: "ConnectorPhaseRotationMaxLength",
    value: "5",
    readonly: true
  },
  /**
   * Clock-aligned measurand(s) to be included in a MeterValues.req PDU, every ClockAlignedDataInterval seconds
   */
  {
    key: "MeterValuesAlignedData",
    value: "Energy.Active.Import.Register",
    readonly: true
  },
  /**
   * Maximum number of items in a MeterValuesAlignedData Configuration Key.
   */
  {
    key: "MeterValuesAlignedDataMaxLength",
    value: "6",
    readonly: true
  },
  /**
   * Maximum number of items in a MeterValuesSampledData Configuration Key.
   */
  {
    key: "MeterValuesSampledDataMaxLength",
    value: "6",
    readonly: true
  },
  /**
   * Interval between sampling of metering (or other) data, intended to be transmitted by "MeterValues" PDUs. 
   * For charging session data (ConnectorId>0), samples are acquired and transmitted periodically at this interval from the start of the charging transaction.
   * A value of "0" (numeric zero), by convention, is to be interpreted to mean that no sampled data should be transmitted.
   */
  {
    key: "MeterValueSampleInterval",
    value: "60",
    readonly: false
  },
  /**
   * Size (in seconds) of the clock-aligned data interval. 
   * This is the size (in seconds) of the set of evenly spaced aggregation intervals per day, starting at 00:00:00 (midnight). 
   * For example, a value of 900 (15 minutes) indicates that every day should be broken into 96 15-minute intervals.
   * When clock aligned data is being transmitted, the interval in question is identified by the start time and (optional) duration interval value, represented according to the ISO8601 standard. 
   * All "per-period" data (e.g. energy readings) should be accumulated (for "flow" type measurands such as energy), 
   * or averaged (for other values) across the entire interval (or partial interval, at the beginning or end of a Transaction), 
   * and transmitted (if so enabled) at the end of each interval, bearing the interval start time timestamp.
   * A value of "0" (numeric zero), by convention, is to be interpreted to mean that no clock-aligned data should be transmitted.
   */
  {
    key: "ClockAlignedDataInterval",
    value: "900",
    readonly: false
  },
  /**
   * Sampled measurands to be included in the TransactionData element of StopTransaction.req PDU, 
   * every MeterValueSampleInterval seconds from the start of the charging session
   */
  {
    key: "StopTxnSampledData",
    value: "Energy.Active.Import.Register",
    readonly: true
  },
  {
    key: "StopTransactionOnInvalidId",
    value: "false",
    readonly: true
  }
];
