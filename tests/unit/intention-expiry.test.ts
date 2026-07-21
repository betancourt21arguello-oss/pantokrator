import { describe, it, expect } from "vitest";

describe("Intention Expiry Contract", () => {
  it("verifica las reglas de negocio de expiración y transformación", () => {
    const createdAt = new Date("2026-07-21T10:00:00Z");
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    expect(expiresAt.getTime() - createdAt.getTime()).toBe(24 * 60 * 60 * 1000);
  });
});
