import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { LongPressButton } from "@/components/rosario/LongPressButton";

describe("LongPressButton - accesibilidad y regresión", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not trigger on complete if released early", async () => {
    const onComplete = vi.fn();
    render(<LongPressButton onComplete={onComplete} holdDurationMs={1000}>🙏</LongPressButton>);

    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { pointerId: 1, clientX: 0, clientY: 0 });

    await new Promise((resolve) => setTimeout(resolve, 100));
    fireEvent.pointerUp(btn, { pointerId: 1 });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("is focusable for keyboard users", () => {
    render(<LongPressButton onComplete={vi.fn()}>🙏</LongPressButton>);
    const btn = screen.getByRole("button");
    expect(btn.tabIndex).toBe(0);
  });

  it("renders children inside button", () => {
    render(<LongPressButton onComplete={vi.fn()}>🙏</LongPressButton>);
    expect(screen.getByText("🙏")).toBeTruthy();
  });
});
