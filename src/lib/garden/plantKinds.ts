import type { SpiritualInventory } from "@/db/schema";

export type PlantKind =
  | "rosal"
  | "margarita"
  | "lirio"
  | "nogal"
  | "vides"
  | "higuera"
  | "olivo";

export type PlantStage = "nada" | "semilla" | "brote" | "flor" | "arbol";

export type SpiritualSeedKeys = Extract<
  keyof SpiritualInventory,
  | "seedsRosary"
  | "seedsMercy"
  | "seedsJose"
  | "seedsGuadalupe"
  | "seedsRequiem"
  | "seedsJourney"
>;

export const PLANT_BY_SEED: Record<SpiritualSeedKeys, PlantKind> = {
  seedsRosary: "rosal",
  seedsMercy: "margarita",
  seedsJose: "lirio",
  seedsGuadalupe: "nogal",
  seedsRequiem: "higuera",
  seedsJourney: "olivo",
};

export const PLANT_NAMES: Record<PlantKind, string> = {
  rosal: "Rosal (Santo Rosario)",
  margarita: "Margarita (Laudes/Ángelus)",
  lirio: "Lirio (San José)",
  nogal: "Nogal (Nuestra Señora de Guadalupe)",
  vides: "Vides",
  higuera: "Higuera (100 Réquiem)",
  olivo: "Olivo (Jornada Diaria)",
};

export function getPlantStage(count: number): PlantStage {
  if (count <= 0) return "nada";
  if (count <= 5) return "semilla";
  if (count <= 15) return "brote";
  if (count <= 40) return "flor";
  return "arbol";
}
