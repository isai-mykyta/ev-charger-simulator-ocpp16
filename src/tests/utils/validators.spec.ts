import { inRange, isBoolString, isFiveOrTenDivisible, isValidIntString } from "../../utils";

describe("isValidIntString", () => {
  test("should validate int string", () => {
    expect(isValidIntString("1")).toBe(true);
    expect(isValidIntString("0")).toBe(true);
    expect(isValidIntString("1.1")).toBe(false);
    expect(isValidIntString("fff")).toBe(false);
  });

  test("should validate if number is in allowed range", () => {
    expect(inRange(10, 0, 10)).toBe(true);
    expect(inRange(8.4, 0, 10)).toBe(true);
    expect(inRange(11, 20, 100)).toBe(false);
    expect(inRange(11, 0, 5)).toBe(false);
  });

  test("shoudl validate if string is boolean", () => {
    expect(isBoolString("true")).toBe(true);
    expect(isBoolString("false")).toBe(true);
    expect(isBoolString("1")).toBe(false);
    expect(isBoolString("ff")).toBe(false);
  });

  test("should validate if number is 5 or 10 divisible", () => {
    expect(isFiveOrTenDivisible(10)).toBe(true);
    expect(isFiveOrTenDivisible(40)).toBe(true);
    expect(isFiveOrTenDivisible(5)).toBe(true);
    expect(isFiveOrTenDivisible(65)).toBe(true);
    expect(isFiveOrTenDivisible(1)).toBe(false);
    expect(isFiveOrTenDivisible(4)).toBe(false);
    expect(isFiveOrTenDivisible(66)).toBe(false);
  });
});
