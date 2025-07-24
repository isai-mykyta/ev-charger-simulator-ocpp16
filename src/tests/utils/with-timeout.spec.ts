import { withTimeout } from "../../utils";

describe("withTimeout", () => {
  it("should resolve if the promise completes before timeout", async () => {
    const promise = new Promise<string>((resolve) => setTimeout(() => resolve("success"), 50));
    await expect(withTimeout(promise, 100, "timeout")).resolves.toBe("success");
  });

  it("should reject with the timeout error if the promise takes too long", async () => {
    const promise = new Promise<string>((resolve) => setTimeout(() => resolve("success"), 200));
    await expect(withTimeout(promise, 100, "timeout")).rejects.toBe("timeout");
  });

  it("should propagate the original promise rejection if it rejects before timeout", async () => {
    const promise = new Promise<string>((_, reject) => setTimeout(() => reject("original error"), 50));
    await expect(withTimeout(promise, 100, "timeout")).rejects.toBe("original error");
  });
});
