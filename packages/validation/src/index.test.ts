import { describe, expect, it } from "vitest";
import { paginationSchema } from "./index.js";

describe("validation", () => {
  it("provides safe pagination defaults", () => {
    expect(paginationSchema.parse({})).toEqual({
      page: 1,
      limit: 20,
    });
  });
});