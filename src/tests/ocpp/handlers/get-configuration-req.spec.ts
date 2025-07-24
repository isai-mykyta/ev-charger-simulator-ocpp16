import { handleGetConfigurationReq, ocppDispatcher } from "../../../ocpp";
import { simulator } from "../../../simulator";

describe("handleGetConfigurationReq", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return configuration if payload key is not provided", () => {
    const configResSpy = jest.spyOn(ocppDispatcher, "getConfigurationConf");
    const sendMsgSpy = jest.spyOn(simulator, "sendMsg").mockReturnValue();

    handleGetConfigurationReq("id", {});
    const { configurationKey, unknownKey } = configResSpy.mock.calls[0][1];

    expect(Array.isArray(configurationKey)).toBe(true);
    expect(unknownKey).not.toBeDefined();
    expect(sendMsgSpy).toHaveBeenCalledTimes(1);
  });

  test("should return configuration if payload key is provided", () => {
    const configResSpy = jest.spyOn(ocppDispatcher, "getConfigurationConf");
    const sendMsgSpy = jest.spyOn(simulator, "sendMsg").mockReturnValue();

    handleGetConfigurationReq("id", { key: ["GetConfigurationMaxKeys", "unknown"] });
    const { configurationKey, unknownKey } = configResSpy.mock.calls[0][1];

    expect(Array.isArray(configurationKey)).toBe(true);
    expect(unknownKey.includes("unknown")).toBe(true);
    expect(sendMsgSpy).toHaveBeenCalledTimes(1);
  });
});
