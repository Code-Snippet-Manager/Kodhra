import { describe, expect, it } from "vitest";
import type { HealthResponse } from "./index.js";

describe("shared types", () => {
  it("describes a health response", () => {
    const response: HealthResponse = {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
    };

    expect(response.status).toBe("ok");
  });
});