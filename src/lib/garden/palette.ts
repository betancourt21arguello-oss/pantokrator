/**
 * Calcula el filtro CSS y la hidratación visual según las gotas de agua acumuladas.
 */
export function getGardenPalette(waterDrops: number, totalSeeds: number): {
  filter: string;
  isHydrated: boolean;
} {
  if (waterDrops === 0 && totalSeeds > 0) {
    return {
      filter: "sepia(0.65) saturate(0.5) contrast(0.95)",
      isHydrated: false,
    };
  }

  if (waterDrops > 0 && waterDrops < totalSeeds && totalSeeds > 0) {
    const ratio = waterDrops / totalSeeds;
    const sepiaVal = (0.65 * (1 - ratio)).toFixed(2);
    const satVal = (0.5 + 0.5 * ratio).toFixed(2);

    return {
      filter: `sepia(${sepiaVal}) saturate(${satVal})`,
      isHydrated: true,
    };
  }

  return {
    filter: "none",
    isHydrated: true,
  };
}
