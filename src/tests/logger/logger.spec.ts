import { logger } from "../../logger";

describe("Logger", () => {
  test("should log", () => {
    jest.spyOn(logger, "log");
    logger.log("debug", "message", {});
    expect(logger.log).toHaveBeenCalledWith("debug", "message", {});
  });

  test("should log info", () => {
    jest.spyOn(logger, "log");
    logger.info("message", {});
    expect(logger.log).toHaveBeenCalledWith("info", "message", {});
  });

  test("should log warn", () => {
    jest.spyOn(logger, "log");
    logger.warn("message", {});
    expect(logger.log).toHaveBeenCalledWith("warn", "message", {});
  });

  test("should log error", () => {
    jest.spyOn(logger, "log");
    logger.error("message", {});
    expect(logger.log).toHaveBeenCalledWith("error", "message", {});
  });

  test("should log debug", () => {
    jest.spyOn(logger, "log");
    logger.debug("message", {});
    expect(logger.log).toHaveBeenCalledWith("debug", "message", {});
  });
});
