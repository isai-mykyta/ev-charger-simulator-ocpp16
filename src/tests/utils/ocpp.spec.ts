import { 
  OcppErrorCode, 
  OcppMessageAction, 
  OcppMessageType 
} from "../../ocpp";
import { 
  callErrorMessage, 
  callMessage, 
  callResultMessage, 
  mapErrorConstraintToErrorCode
} from "../../utils";

describe("OCPP utils", () => {
  test("should construct call message", () => {
    const [type,,action, payload] = callMessage(OcppMessageAction.AUTHORIZE, {});
    expect(type).toBe(OcppMessageType.CALL);
    expect(action).toBe(OcppMessageAction.AUTHORIZE);
    expect(payload).toStrictEqual({});
  });

  test("should construct call result message", () => {
    const [type, id, payload] = callResultMessage("messageId", {});
    expect(type).toBe(OcppMessageType.RESULT);
    expect(id).toBe("messageId");
    expect(payload).toStrictEqual({});
  });

  test("should construct call error message", () => {
    const [type, id, code, description, payload] = callErrorMessage("messageId", OcppErrorCode.FORMATION_VIOLATION, "Error");
    expect(type).toBe(OcppMessageType.ERROR);
    expect(id).toBe("messageId");
    expect(code).toBe(OcppErrorCode.FORMATION_VIOLATION);
    expect(description).toBe("Error");
    expect(payload).toBe("{}");
  });

  test("should construct call error message with default description", () => {
    const [type, id, code, description, payload] = callErrorMessage("messageId", OcppErrorCode.FORMATION_VIOLATION, "");
    expect(type).toBe(OcppMessageType.ERROR);
    expect(id).toBe("messageId");
    expect(code).toBe(OcppErrorCode.FORMATION_VIOLATION);
    expect(description).toBe("");
    expect(payload).toBe("{}");
  });

  describe("mapErrorConstraintToErrorCode", () => {
    test("should return FORMATION_VIOLATION error code", () => {
      const constraints = [
        "isEmail",
        "isUUID",
        "isDateString",
        "isUrl",
        "whitelistValidation",
        "maxLength",
        "minLength",
        "length",
        "isEnum",
      ];

      constraints.forEach((constraint) => {
        expect(mapErrorConstraintToErrorCode(constraint)).toBe(OcppErrorCode.FORMATION_VIOLATION);
      });
    });

    test("should return TYPE_CONSTRAINT_VIOLATION error code", () => {
      const constraints = [
        "isInt",
        "isBoolean",
        "isString",
        "isNumber",
      ];

      constraints.forEach((constraint) => {
        expect(mapErrorConstraintToErrorCode(constraint)).toBe(OcppErrorCode.TYPE_CONSTRAINT_VIOLATION);
      });
    });

    test("should return PROTOCOL_ERROR error code", () => {
      expect(mapErrorConstraintToErrorCode("isNotEmpty")).toBe(OcppErrorCode.PROTOCOL_ERROR);
    });

    test("should return NOT_IMPLEMENTED error code", () => {
      expect(mapErrorConstraintToErrorCode("customValidation")).toBe(OcppErrorCode.NOT_IMPLEMENTED);
    });

    test("should return GENERIC_ERROR error code", () => {
      expect(mapErrorConstraintToErrorCode("")).toBe(OcppErrorCode.GENERIC_ERROR);
    });
  });
});
