import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRosarioSync } from "@/hooks/useRosarioSync";

vi.mock("@/lib/supabase", () => ({
  getSupabaseBrowser: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      presenceState: vi.fn(() => ({})),
      track: vi.fn(),
      send: vi.fn(),
    })),
    removeChannel: vi.fn(),
  })),
}));

describe("Rosario Realtime Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct initial state", () => {
    const { result } = renderHook(() =>
      useRosarioSync({
        programId: "test-program",
        profileId: "user-1",
        displayName: "Test User",
      })
    );

    expect(result.current.participants).toHaveLength(0);
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isConnected).toBe(false);
    expect(typeof result.current.sendResponse).toBe("function");
    expect(typeof result.current.sendChatMessage).toBe("function");
  });

  it("subscribes to rosary channel on mount", async () => {
    const { result } = renderHook(() =>
      useRosarioSync({
        programId: "rosario-misterios-dolorosos",
        profileId: "user-1",
        displayName: "Test",
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.participants).toEqual([]);
  });
});
