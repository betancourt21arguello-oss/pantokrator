import { describe, it, expect } from "vitest";
import { getLiturgicalSeason } from "@/lib/garden/seasons";

describe("Season Detection (getLiturgicalSeason)", () => {
  it("detecta la Navidad el 25 de diciembre", () => {
    const christmasDate = new Date("2026-12-25T12:00:00Z");
    const seasonInfo = getLiturgicalSeason(christmasDate);
    expect(seasonInfo.season).toBe("navidad");
    expect(seasonInfo.color).toBe("blanco");
  });

  it("detecta la Navidad el 2 de enero", () => {
    const newYearDate = new Date("2026-01-02T12:00:00Z");
    const seasonInfo = getLiturgicalSeason(newYearDate);
    expect(seasonInfo.season).toBe("navidad");
  });

  it("detecta el Adviento a mediados de diciembre", () => {
    const adventDate = new Date("2026-12-10T12:00:00Z");
    const seasonInfo = getLiturgicalSeason(adventDate);
    expect(seasonInfo.season).toBe("adviento");
    expect(seasonInfo.ambient.particles).toBe("snow");
  });

  it("detecta el Tiempo Ordinario en julio", () => {
    const ordinaryDate = new Date("2026-07-21T12:00:00Z");
    const seasonInfo = getLiturgicalSeason(ordinaryDate);
    expect(seasonInfo.season).toBe("ordinario");
    expect(seasonInfo.color).toBe("verde");
  });
});
