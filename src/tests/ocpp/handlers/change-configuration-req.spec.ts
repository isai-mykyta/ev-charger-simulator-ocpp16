import { configService } from "../../../configuration";
import { 
  ConfigurationStatus, 
  handleChangeConfigurationReq, 
  OcppMessageType 
} from "../../../ocpp";
import { simulator } from "../../../simulator";

describe("handleChangeConfigurationReq", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return not supported status if config key is not found", () => {
    const sendSpy = jest.spyOn(simulator, "sendMsg").mockReturnValue();
    const setConfigSpy = jest.spyOn(configService, "setConfig").mockReturnValue();
    const expectedRes = [OcppMessageType.RESULT, "id", { status: ConfigurationStatus.NOT_SUPPORTED }];

    jest.spyOn(configService, "getConfig").mockReturnValue(undefined);

    handleChangeConfigurationReq("id", { key: "key", value: "value" });
    expect(sendSpy).toHaveBeenCalledWith(expectedRes);
    expect(setConfigSpy).not.toHaveBeenCalled();
  });

  test("should return rejected status if config key is readonly", () => {
    const sendSpy = jest.spyOn(simulator, "sendMsg").mockReturnValue();
    const setConfigSpy = jest.spyOn(configService, "setConfig").mockReturnValue();
    const expectedRes = [OcppMessageType.RESULT, "id", { status: ConfigurationStatus.REJECTED }];

    jest.spyOn(configService, "getConfig").mockReturnValue({ key: "key", value: "value", readonly: true });

    handleChangeConfigurationReq("id", { key: "key", value: "value" });
    expect(sendSpy).toHaveBeenCalledWith(expectedRes);
    expect(setConfigSpy).not.toHaveBeenCalled();
  });

  test("should return accepted status if config key is not readonly and value is valid", () => {
    const sendSpy = jest.spyOn(simulator, "sendMsg").mockReturnValue();
    const setConfigSpy = jest.spyOn(configService, "setConfig").mockReturnValue();
    const expectedRes = [OcppMessageType.RESULT, "id", { status: ConfigurationStatus.ACCEPTED }];

    jest.spyOn(configService, "validateConfigValue").mockReturnValue(true);
    jest.spyOn(configService, "getConfig").mockReturnValue({ key: "key", value: "value", readonly: false });
    
    handleChangeConfigurationReq("id", { key: "key", value: "value" });
    expect(sendSpy).toHaveBeenCalledWith(expectedRes);
    expect(setConfigSpy).toHaveBeenCalledWith("key", "value");
  });

  test("should return rejected status if config key is not readonly and value is not valid", () => {
    const sendSpy = jest.spyOn(simulator, "sendMsg").mockReturnValue();
    const setConfigSpy = jest.spyOn(configService, "setConfig").mockReturnValue();
    const expectedRes = [OcppMessageType.RESULT, "id", { status: ConfigurationStatus.REJECTED }];

    jest.spyOn(configService, "validateConfigValue").mockReturnValue(false);
    jest.spyOn(configService, "getConfig").mockReturnValue({ key: "key", value: "value", readonly: false });
    
    handleChangeConfigurationReq("id", { key: "key", value: "value" });
    expect(sendSpy).toHaveBeenCalledWith(expectedRes);
    expect(setConfigSpy).not.toHaveBeenCalled();
  });
});
