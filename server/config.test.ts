import { describe, expect, it } from "vitest";

describe("Environment Configuration", () => {
  it("should have WAHA_API_URL configured", () => {
    const wahaUrl = process.env.WAHA_API_URL;
    expect(wahaUrl).toBeDefined();
    expect(wahaUrl).toMatch(/^https?:\/\//);
  });

  it("should have WAHA_API_KEY configured", () => {
    const wahaKey = process.env.WAHA_API_KEY;
    expect(wahaKey).toBeDefined();
    expect(wahaKey?.length).toBeGreaterThan(0);
  });

  it("should have REDIS_URL configured", () => {
    const redisUrl = process.env.REDIS_URL;
    expect(redisUrl).toBeDefined();
    expect(redisUrl).toMatch(/^redis:\/\//);
  });

  it("should have DATABASE_URL configured", () => {
    const dbUrl = process.env.DATABASE_URL;
    expect(dbUrl).toBeDefined();
    expect(dbUrl).toMatch(/^mysql:\/\//);
  });

  it("should have JWT_SECRET configured", () => {
    const jwtSecret = process.env.JWT_SECRET;
    expect(jwtSecret).toBeDefined();
    expect(jwtSecret?.length).toBeGreaterThan(0);
  });
});
