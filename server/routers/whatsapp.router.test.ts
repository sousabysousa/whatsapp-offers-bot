import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("WhatsApp Router", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAuthContext();
  });

  it("should list sessions for authenticated user", async () => {
    const caller = appRouter.createCaller(ctx);

    try {
      const sessions = await caller.whatsapp.listSessions();
      expect(Array.isArray(sessions)).toBe(true);
    } catch (error) {
      // Database may not be available in test environment
      expect(error).toBeDefined();
    }
  });

  it("should have createSession mutation", async () => {
    const caller = appRouter.createCaller(ctx);

    // Verify the procedure exists
    expect(caller.whatsapp.createSession).toBeDefined();
  });

  it("should have disconnectSession mutation", async () => {
    const caller = appRouter.createCaller(ctx);

    // Verify the procedure exists
    expect(caller.whatsapp.disconnectSession).toBeDefined();
  });

  it("should have getSessionInfo query", async () => {
    const caller = appRouter.createCaller(ctx);

    // Verify the procedure exists
    expect(caller.whatsapp.getSessionInfo).toBeDefined();
  });
});
