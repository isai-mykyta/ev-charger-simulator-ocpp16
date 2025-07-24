import { configService } from "../../configuration";

describe("Config Service", () => {
  test("should return configuration", () => {
    const configuration = configService.configuration;
    expect(configuration.length).toBeGreaterThan(1);
    expect(Array.isArray(configuration)).toBe(true);
  });

  test("should return config by key", () => {
    const config = configService.getConfig("HeartbeatInterval");
    expect(config).toBeDefined();
    expect(config.key).toBeDefined();
    expect(config.value).toBeDefined();
    expect(config.readonly).toBeDefined();
  });

  test("should set value for existing config", () => {
    configService.setConfig("HeartbeatInterval", "180");
    expect(configService.getConfig("HeartbeatInterval").value).toBe("180");
  });

  test("should validate config value", () => {
    expect(configService.validateConfigValue("HeartbeatInterval", "120")).toBe(true);
    expect(configService.validateConfigValue("WebSocketPingInterval", "120")).toBe(true);
    expect(configService.validateConfigValue("GetConfigurationMaxKeys", "50")).toBe(true);
    expect(configService.validateConfigValue("MeterValueSampleInterval", "60")).toBe(true);
    expect(configService.validateConfigValue("AuthorizeRemoteTxRequests", "true")).toBe(true);
    expect(configService.validateConfigValue("UknownKey", "true")).toBe(false);
  });
});
