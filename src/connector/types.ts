export type ConnectorType = 
| "Type1"
| "Type2"
| "Type3"
| "CCS1"
| "CCS2"
| "CHAdeMO"
| "Tesla"
| "GBT_AC"
| "GBT_DC"
| "NEMA5_15"
| "NEMA6_50"
| "Other";

export type ConnectorOptions = {
  id: number;
  type: ConnectorType;
  maxCurrent: number;
}
