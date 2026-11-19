import { describe, expect, it } from "vitest";

describe("API health", () => {
  it("has a working test harness", () => {
    expect({ status: "ok" }).toEqual({ status: "ok" });
  });
});