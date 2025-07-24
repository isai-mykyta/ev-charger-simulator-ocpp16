import { Connector } from "../connector";
import { 
  Location,
  Measurand,
  ReadingContext, 
  UnitOfMeasure, 
  ValueFormat 
} from "../ocpp";

export type TransactionConfig = {
  transactionId: number;
  connector: Connector;
  idTag: string;
}

export type CurrentImport = {
  value: string;
  measurand: Measurand.CURRENT_IMPORT;
  unit: UnitOfMeasure.A;
  format: ValueFormat;
  context: ReadingContext;
  location?: Location;
}

export type EnergyActiveImportRegister = {
  value: string;
  measurand: Measurand.ENERGY_ACTIVE_IMPORT_REGISTER;
  unit: UnitOfMeasure.WH | UnitOfMeasure.KWH;
  format: ValueFormat;
  context: ReadingContext;
  location?: Location;
}

export type PowerActiveImport = {
  value: string;
  measurand: Measurand.POWER_ACTIVE_IMPORT;
  unit: UnitOfMeasure.W | UnitOfMeasure.KW;
  format: ValueFormat;
  context: ReadingContext;
  location?: Location;
}

export type Voltage = {
  value: string;
  measurand: Measurand.VOLTAGE;
  unit: UnitOfMeasure.V
  format: ValueFormat;
  context: ReadingContext;
  location?: Location;
}
