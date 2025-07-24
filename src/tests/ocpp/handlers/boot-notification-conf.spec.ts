import { handleBootNotificationConf, RegistrationStatus } from "../../../ocpp";
import { simulator } from "../../../simulator";

describe("BootNotificationConf handler", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Should handle BootNotificationConf", () => {
    const setStatusSpy = jest.spyOn(simulator, "registrationStatus", "set").mockReturnValue();
    const setHertbeatSpy = jest.spyOn(simulator, "heartbeatInterval", "set").mockReturnValue();

    handleBootNotificationConf({
      currentTime: new Date().toISOString(),
      interval: 180,
      status: RegistrationStatus.ACCEPTED
    });

    expect(setStatusSpy).toHaveBeenCalledWith(RegistrationStatus.ACCEPTED);
    expect(setHertbeatSpy).toHaveBeenCalledWith(180);
  });
});
