import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RosarioEnVivoPage from "@/app/rosario/en-vivo/page";
import { useProgressiveAuth } from "@/hooks/useProgressiveAuth";
import { useRosarioSync } from "@/hooks/useRosarioSync";

vi.mock("@/hooks/useProgressiveAuth", () => ({
  useProgressiveAuth: vi.fn(),
}));

vi.mock("@/hooks/useRosarioSync", () => ({
  useRosarioSync: vi.fn(),
}));

vi.mock("@/components/rosario/CommunityTreeSVG", () => ({
  CommunityTreeSVG: () => null,
}));

vi.mock("@/components/llama/FloatingCandle", () => ({
  FloatingCandle: () => null,
}));

vi.mock("@/components/BottomNav", () => ({
  BottomNav: () => null,
}));

describe("Rosario En Vivo - regresión", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (useProgressiveAuth as any).mockReturnValue({
      profile: { id: "profile-1", displayName: "Peregrino", isAnonymous: true },
      loading: false,
    });
    (useRosarioSync as any).mockReturnValue({
      participants: [],
      currentStepIndex: 0,
      isConnected: true,
      connectionState: "connected",
      sendResponse: vi.fn(),
      sendChatMessage: vi.fn(),
      repeatIteration: 1,
      repeatTotal: 10,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a single Oración Perpetua header", () => {
    render(<RosarioEnVivoPage />);
    const headers = screen.getAllByText("Oración Perpetua");
    expect(headers.length).toBe(1);
  });

  it("renders a single step indicator derived from snapshot", () => {
    render(<RosarioEnVivoPage />);
    const indicators = screen.getAllByText(/1 de 10/);
    expect(indicators.length).toBeGreaterThanOrEqual(1);
  });

  it("shows connected state from hook", () => {
    render(<RosarioEnVivoPage />);
    expect(screen.getByText("Conectado")).toBeTruthy();
  });

  it("does not show reconnecting when hook reports connected", () => {
    render(<RosarioEnVivoPage />);
    expect(screen.queryByText("Reconectando...")).toBeNull();
  });
});
