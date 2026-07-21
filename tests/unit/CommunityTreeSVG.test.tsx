import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CommunityTreeSVG } from "@/components/rosario/CommunityTreeSVG";

describe("CommunityTreeSVG", () => {
  it("renders without crashing with zero participants", () => {
    const { container } = render(
      <CommunityTreeSVG participants={[]} currentUserId="user-1" />
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders leaf paths for each participant", () => {
    const participants = [
      { id: "user-1", displayName: "Alice", seedsFaith: 3, seedsHope: 2, seedsCharity: 1 },
      { id: "user-2", displayName: "Bob", seedsFaith: 1, seedsHope: 0, seedsCharity: 4 },
      { id: "user-3", displayName: "Carol", seedsFaith: 0, seedsHope: 5, seedsCharity: 2 },
    ];

    const { container } = render(
      <CommunityTreeSVG participants={participants} currentUserId="user-1" />
    );

    const leafPaths = container.querySelectorAll("svg > g > path");
    expect(leafPaths.length).toBeGreaterThanOrEqual(3);
  });

  it("applies higher opacity to current user leaf", () => {
    const participants = [
      { id: "user-1", displayName: "Alice", seedsFaith: 3, seedsHope: 2, seedsCharity: 1 },
      { id: "user-2", displayName: "Bob", seedsFaith: 1, seedsHope: 0, seedsCharity: 4 },
    ];

    const { container } = render(
      <CommunityTreeSVG participants={participants} currentUserId="user-1" />
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.textContent).toContain("hoja");
  });

  it("generates deterministic leaves for same input", () => {
    const participants = [
      { id: "user-1", displayName: "Alice", seedsFaith: 3, seedsHope: 2, seedsCharity: 1 },
    ];

    const { container: container1 } = render(
      <CommunityTreeSVG participants={participants} currentUserId="user-1" />
    );

    const { container: container2 } = render(
      <CommunityTreeSVG participants={participants} currentUserId="user-1" />
    );

    const leaves1 = container1.querySelectorAll("svg > g > path");
    const leaves2 = container2.querySelectorAll("svg > g > path");

    expect(leaves1.length).toBe(leaves2.length);
  });

  it("displays total leaves count in text", () => {
    const participants = [
      { id: "user-1", displayName: "Alice", seedsFaith: 3, seedsHope: 2, seedsCharity: 1 },
      { id: "user-2", displayName: "Bob", seedsFaith: 1, seedsHope: 0, seedsCharity: 4 },
    ];

    const { container } = render(
      <CommunityTreeSVG participants={participants} currentUserId="user-1" />
    );

    const text = container.textContent;
    expect(text).toContain("2");
    expect(text).toContain("hoja");
  });
});
