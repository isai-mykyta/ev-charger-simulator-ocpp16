import cron, { ScheduledTask } from "node-cron";

import { configService } from "../configuration";
import { Connector } from "../connector";
import { VOLTAGE } from "../constants";
import { 
  Location,
  Measurand, 
  MeterValue, 
  ocppDispatcher, 
  ReadingContext, 
  SampledValue, 
  UnitOfMeasure, 
  ValueFormat
} from "../ocpp";
import { simulator } from "../simulator";
import { 
  CurrentImport, 
  EnergyActiveImportRegister, 
  PowerActiveImport, 
  TransactionConfig, 
  Voltage
} from "./types";

export class Transaction {
  private readonly meterValueSampleInterval: number;
  private readonly clockAlignedDataInterval: number;
  
  private meterValuesInterval: NodeJS.Timeout;
  private meterValuesCron: ScheduledTask;

  private _isActive: boolean = false;

  public readonly transactionId: number;
  public readonly connector: Connector;
  public readonly meterValues: MeterValue[] = [];
  public readonly idTag: string;

  constructor (data: TransactionConfig) {
    this.transactionId = data.transactionId;
    this.connector = data.connector;
    this.idTag = data.idTag;

    this.meterValueSampleInterval = Number(configService.getConfig("MeterValueSampleInterval").value);
    this.clockAlignedDataInterval = Number(configService.getConfig("ClockAlignedDataInterval").value);
  }

  private currentImport(data: Omit<CurrentImport, "measurand" | "unit">): CurrentImport {
    return { 
      ...data, 
      measurand: Measurand.CURRENT_IMPORT, 
      unit: UnitOfMeasure.A, 
      value: Number(data.value).toFixed(2)
    };
  }

  private energyActiveImportRegister(data: Omit<EnergyActiveImportRegister, "measurand">): EnergyActiveImportRegister {
    return { 
      ...data, 
      measurand: Measurand.ENERGY_ACTIVE_IMPORT_REGISTER,
      value: Number(data.value).toFixed(2),
    };
  }

  private powerActiveImport(data: Omit<PowerActiveImport, "measurand">): PowerActiveImport {
    return { 
      ...data, 
      measurand: Measurand.POWER_ACTIVE_IMPORT,
      value: Number(data.value).toFixed(2),
    };
  }

  private voltage(data: Omit<Voltage, "measurand" | "unit" | "value">): Voltage {
    return { 
      ...data, 
      measurand: Measurand.VOLTAGE, 
      unit: UnitOfMeasure.V, 
      value: this.generateVoltage().toFixed(2) 
    };
  }

  private energyPerSample(): number {
    const currentA = this.connector.maxCurrent;
    const powerW = VOLTAGE * currentA; // Power in watts
    const timeHours = this.meterValueSampleInterval / 3600; // Convert seconds → hours
    const energyWh = powerW * timeHours; // Energy in watt-hours
    return parseFloat(energyWh.toFixed(2));
  }

  private generateVoltage(nominalVoltage: number = 230, maxFluctuation: number = 3): number {
    const fluctuation = (Math.random() * (2 * maxFluctuation)) - maxFluctuation;
    const voltage = nominalVoltage + fluctuation;
    return parseFloat(voltage.toFixed(2));
  }

  private simulateCurrent(): number {
    const current = Math.random() * (this.connector.maxCurrent - 10) + 10; // random between 10A and max
    return parseFloat(current.toFixed(2));
  }

  private simulatePowerW(): number {
    return parseFloat((this.generateVoltage() * this.simulateCurrent() * 1.0).toFixed(2)); // Assume power factor = 1.0
  }

  private genMeterValue(sampledValue: SampledValue[]): MeterValue {
    return { timestamp: new Date().toISOString(), sampledValue };
  }

  private sampleMeterValue(context: ReadingContext): MeterValue {
    const importedEnergy = this.energyPerSample();
    this.connector.incrementTotalImportedEnergy(importedEnergy);

    const energyActiveImportRegister = this.energyActiveImportRegister({ 
      unit: UnitOfMeasure.WH, 
      context,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      value: this.connector.totalEnergyImportedWh.toString(),
    });

    const currentImport = this.currentImport({
      context,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      value: this._isActive ? this.simulateCurrent().toString() : "0",
    });

    const powerActiveImport = this.powerActiveImport({
      context,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      unit: UnitOfMeasure.W,
      value: this._isActive ? this.simulatePowerW().toFixed(2) : "0"
    });

    const voltage = this.voltage({
      context,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
    });

    return this.genMeterValue([energyActiveImportRegister, currentImport, powerActiveImport, voltage]);
  }

  private initialMeterValue(): MeterValue {
    const energyActiveImportRegister = this.energyActiveImportRegister({ 
      unit: UnitOfMeasure.WH, 
      context: ReadingContext.TRANSACTION_BEGIN,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      value: this.connector.totalEnergyImportedWh.toString(),
    });

    const currentImport = this.currentImport({
      context: ReadingContext.TRANSACTION_BEGIN,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      value: "0"
    });

    const powerActiveImport = this.powerActiveImport({
      context: ReadingContext.TRANSACTION_BEGIN,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
      unit: UnitOfMeasure.W,
      value: "0"
    });

    const voltage = this.voltage({
      context: ReadingContext.TRANSACTION_BEGIN,
      format: ValueFormat.RAW,
      location: Location.OUTLET,
    });

    return this.genMeterValue([energyActiveImportRegister, currentImport, powerActiveImport, voltage]);
  }

  public getTransactionData(): MeterValue[] {
    return this.meterValues.map((meterValue) => (
      ({ 
        ...meterValue, 
        sampledValue: meterValue.sampledValue.filter((s) => s.measurand === Measurand.ENERGY_ACTIVE_IMPORT_REGISTER) 
      })
    ));
  }

  public start(): void {
    const initialMeterValue = this.initialMeterValue();

    const initialMeterValueReq = ocppDispatcher.meterValuesReq({
      connectorId: this.connector.id,
      transactionId: this.transactionId,
      meterValue: initialMeterValue
    });

    this.meterValues.push(initialMeterValue);
    simulator.sendRequest(initialMeterValueReq);
    
    this.meterValuesInterval = setInterval(() => {
      const periodicMeterValue = this.sampleMeterValue(ReadingContext.SAMPLE_PERIODIC);

      const periodicMeterValueReq = ocppDispatcher.meterValuesReq({
        connectorId: this.connector.id,
        transactionId: this.transactionId,
        meterValue: periodicMeterValue
      });

      this.meterValues.push(periodicMeterValue);
      simulator.sendRequest(periodicMeterValueReq);
    }, this.meterValueSampleInterval * 1000);

    if (this.clockAlignedDataInterval > 0) {
      this.meterValuesCron = cron.schedule(`*/${this.clockAlignedDataInterval} * * * * *`, () => {
        const clockMeterValue = this.sampleMeterValue(ReadingContext.SAMPLE_CLOCK);

        const clockMeterValueReq = ocppDispatcher.meterValuesReq({
          connectorId: this.connector.id,
          transactionId: this.transactionId,
          meterValue: clockMeterValue
        });

        this.meterValues.push(clockMeterValue);
        simulator.sendRequest(clockMeterValueReq);
      });
    }

    this._isActive = true;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public pause(): void {
    this._isActive = false;
  }

  public resume(): void {
    this._isActive = true;
  }

  public stop(): void {
    this._isActive = false;

    if (this.meterValueSampleInterval) {
      clearInterval(this.meterValuesInterval);
      this.meterValuesInterval = null;
    }

    if (this.meterValuesCron) {
      this.meterValuesCron.destroy();
      this.meterValuesCron = null;
    }
  }
}
