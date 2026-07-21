/**
/**
 * Detección de estaciones litúrgicas y cálculo dinámico de la fecha de Pascua (Algoritmo de Gauss).
 */

export type LiturgicalSeasonKind = "adviento" | "cuaresma" | "pascua" | "ordinario" | "navidad";

export interface LiturgicalSeasonInfo {
  season: LiturgicalSeasonKind;
  name: string;
  color: string; // "verde" | "morado" | "blanco" | "dorado" | "rojo"
  ambient: {
    skyColor: string;
    groundColor: string;
    particles?: "snow" | "sand" | "petals" | null;
  };
}

/**
 * Algoritmo de Gauss para calcular la fecha del Domingo de Resurrección.
 */
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = marzo, 4 = abril
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(Date.UTC(year, month - 1, day));
}

export function getLiturgicalSeason(date: Date = new Date()): LiturgicalSeasonInfo {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth(); // 0-indexed
  const d = date.getUTCDate();
  const current = new Date(Date.UTC(y, m, d));

  // 1) Navidad: 25 de diciembre a 8 de enero
  if ((m === 11 && d >= 25) || (m === 0 && d <= 8)) {
    return {
      season: "navidad",
      name: "Tiempo de Navidad",
      color: "blanco",
      ambient: {
        skyColor: "#fef3c7", // dorado suave
        groundColor: "#fef08a",
        particles: null,
      },
    };
  }

  // 2) Adviento: 4 domingos antes de Navidad (aprox. 27 nov - 24 dic)
  const dec25 = new Date(Date.UTC(y, 11, 25));
  const dec25DayOfWeek = dec25.getUTCDay(); // 0 = dom
  const adventStartDays = 21 + (dec25DayOfWeek === 0 ? 7 : dec25DayOfWeek);
  const adventStart = new Date(dec25.getTime() - adventStartDays * 24 * 60 * 60 * 1000);

  if (current >= adventStart && current < dec25) {
    return {
      season: "adviento",
      name: "Tiempo de Adviento",
      color: "morado",
      ambient: {
        skyColor: "#e2e8f0", // gris frío
        groundColor: "#cbd5e1",
        particles: "snow",
      },
    };
  }

  // 3) Cuaresma y Pascua basados en el Domingo de Resurrección
  const easter = getEasterSunday(y);
  // Miércoles de Ceniza: 46 días antes de Pascua
  const ashWednesday = new Date(easter.getTime() - 46 * 24 * 60 * 60 * 1000);
  // Jueves Santo: 3 días antes de Pascua
  const holyThursday = new Date(easter.getTime() - 3 * 24 * 60 * 60 * 1000);
  // Pentecostés: 49 días después de Pascua
  const pentecost = new Date(easter.getTime() + 49 * 24 * 60 * 60 * 1000);

  if (current >= ashWednesday && current <= holyThursday) {
    return {
      season: "cuaresma",
      name: "Tiempo de Cuaresma",
      color: "morado",
      ambient: {
        skyColor: "#fef2f2", // tonos desérticos cálidos
        groundColor: "#fecaca",
        particles: "sand",
      },
    };
  }

  if (current >= easter && current <= pentecost) {
    return {
      season: "pascua",
      name: "Tiempo de Pascua",
      color: "blanco",
      ambient: {
        skyColor: "#f0fdf4", // estallido fresco y vivo
        groundColor: "#dcfce7",
        particles: "petals",
      },
    };
  }

  // 4) Tiempo Ordinario (resto del año)
  return {
    season: "ordinario",
    name: "Tiempo Ordinario",
    color: "verde",
    ambient: {
      skyColor: "#f7f5f0", // crema natural
      groundColor: "#e5e0d2",
      particles: null,
    },
  };
}
