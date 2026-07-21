import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrayerExperience } from "@/hooks/usePrayerExperience";

describe("usePrayerExperience", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => usePrayerExperience());

    expect(result.current.count).toBe(0);
    expect(result.current.isResponding).toBe(false);
    expect(result.current.voiceEnabled).toBe(false);
    expect(result.current.isListening).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it("increments count and triggers haptic feedback on triggerPrayer", () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(navigator, "vibrate", {
      value: vibrateMock,
      writable: true,
    });

    const { result } = renderHook(() =>
      usePrayerExperience({ targetCount: 10 })
    );

    act(() => {
      result.current.triggerPrayer();
    });

    expect(result.current.count).toBe(1);
    expect(result.current.isResponding).toBe(true);
    expect(vibrateMock).toHaveBeenCalledWith(50);
  });

  it("resets state correctly", () => {
    const { result } = renderHook(() =>
      usePrayerExperience({ targetCount: 10 })
    );

    act(() => {
      result.current.triggerPrayer();
      result.current.triggerPrayer();
    });

    expect(result.current.count).toBe(2);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
    expect(result.current.isResponding).toBe(false);
  });

  it("calculates progress correctly", () => {
    const { result } = renderHook(() =>
      usePrayerExperience({ targetCount: 10 })
    );

    act(() => {
      result.current.triggerPrayer();
      result.current.triggerPrayer();
      result.current.triggerPrayer();
    });

    expect(result.current.count).toBe(3);
    expect(result.current.progress).toBe(30);
  });

  it("toggles voice state", () => {
    const { result } = renderHook(() =>
      usePrayerExperience({ targetCount: 10 })
    );

    expect(result.current.voiceEnabled).toBe(false);

    act(() => {
      result.current.toggleVoice();
    });

    expect(result.current.voiceEnabled).toBe(true);

    act(() => {
      result.current.toggleVoice();
    });

    expect(result.current.voiceEnabled).toBe(false);
  });

  it("calls onComplete when target is reached", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      usePrayerExperience({ targetCount: 3, onComplete })
    );

    act(() => {
      result.current.triggerPrayer();
      result.current.triggerPrayer();
      result.current.triggerPrayer();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
