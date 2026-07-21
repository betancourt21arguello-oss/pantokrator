import { describe, it, expect } from "vitest";
import {
  PLANT_BY_SEED,
  getPlantStage,
  PLANT_NAMES,
} from "@/lib/garden/plantKinds";

describe("Plant Mapping & Stages", () => {
  it("mapea correctamente las semillas a sus plantas correspondientes", () => {
    expect(PLANT_BY_SEED.seedsRosary).toBe("rosal");
    expect(PLANT_BY_SEED.seedsMercy).toBe("margarita");
    expect(PLANT_BY_SEED.seedsJose).toBe("lirio");
    expect(PLANT_BY_SEED.seedsGuadalupe).toBe("nogal");
    expect(PLANT_BY_SEED.seedsRequiem).toBe("higuera");
    expect(PLANT_BY_SEED.seedsJourney).toBe("olivo");
  });

  it("determina las etapas de crecimiento adecuadamente según el contador", () => {
    expect(getPlantStage(0)).toBe("nada");
    expect(getPlantStage(1)).toBe("semilla");
    expect(getPlantStage(5)).toBe("semilla");
    expect(getPlantStage(6)).toBe("brote");
    expect(getPlantStage(15)).toBe("brote");
    expect(getPlantStage(16)).toBe("flor");
    expect(getPlantStage(40)).toBe("flor");
    expect(getPlantStage(41)).toBe("arbol");
    expect(getPlantStage(100)).toBe("arbol");
  });

  it("proporciona nombres descriptivos para cada planta", () => {
    expect(PLANT_NAMES.rosal).toContain("Rosal");
    expect(PLANT_NAMES.olivo).toContain("Olivo");
  });
});
