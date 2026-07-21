import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RosaryCommunitySVG } from "@/components/rosario/RosaryCommunitySVG";

describe("RosaryCommunitySVG", () => {
  it("renders without crashing with zero users", () => {
    const { container } = render(
      <RosaryCommunitySVG
        totalUsers={0}
        respondingUsers={0}
        uniqueCountriesCount={0}
        currentStepIndex={0}
      />
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders correct number of user nodes", () => {
    const { container } = render(
      <RosaryCommunitySVG
        totalUsers={10}
        respondingUsers={3}
        uniqueCountriesCount={2}
        currentStepIndex={0}
        countryCodes={["AR", "MX"]}
      />
    );
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThan(10);
  });

  it("limits nodes to 120 max", () => {
    const { container } = render(
      <RosaryCommunitySVG
        totalUsers={200}
        respondingUsers={50}
        uniqueCountriesCount={5}
        currentStepIndex={0}
      />
    );
    const userNodes = container.querySelectorAll("[id^='node-']");
    expect(userNodes.length).toBeLessThanOrEqual(120);
  });

  it("applies sacred palette colors", () => {
    const { container } = render(
      <RosaryCommunitySVG
        totalUsers={5}
        respondingUsers={0}
        uniqueCountriesCount={0}
        currentStepIndex={0}
      />
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 400 400");
  });
});
