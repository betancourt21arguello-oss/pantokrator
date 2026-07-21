// ============================================================================
// CAMINO · Contenido diario (servidor)
// ----------------------------------------------------------------------------
// Devuelve el contenido litúrgico/espiritual del día, sembrando (seed) una
// fila si aún no existe. En Fase 4 la generación de `aiReflection` y
// `finalPrayer` se delega a Gemini (cacheado vía Cache API / cron).
// ============================================================================

import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyContent, type DailyContent } from "@/db/schema";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Contenido semilla usado la primera vez que se pide el día (demo/fallback). */
function seedForToday(contentDate: string) {
  return {
    contentDate,
    liturgicalSeason: "Tiempo Ordinario",
    liturgicalColor: "verde",
    feastName: "San Antonio de Padua",
    saintName: "San Antonio de Padua",
    saintTitle: "Taumaturgo",
    saintBio:
      "Fraile franciscano portugués, célebre predicador y Doctor de la Iglesia, conocido como el Santo de los milagros.",
    dailyPhrase:
      "Que brille así vuestra luz delante de los hombres, para que vean vuestras buenas obras.",
    dailyPhraseRef: "Mateo 5, 16",
    firstReading: {
      ref: "1 Reyes 19, 9. 11-13",
      text: "Elías llegó a la cueva del monte Horeb y allí pasó la noche. El Señor no estaba en el huracán, ni en el terremoto, ni en el fuego, sino en el susurro de una brisa suave. Al oírlo, Elías se cubrió el rostro con el manto.",
    },
    psalm: {
      ref: "Salmo 84",
      response: "Muéstranos, Señor, tu misericordia.",
      text: "Voy a escuchar lo que dice el Señor: Él anuncia la paz a su pueblo. Su salvación está cerca de los que lo temen, y su gloria habitará en nuestra tierra.",
    },
    secondReading: {
      ref: "Romanos 9, 1-5",
      text: "Digo la verdad en Cristo, no miento; mi conciencia me lo atestigua en el Espíritu Santo: siento una gran tristeza y un dolor incesante en mi corazón por mis hermanos, mis parientes según la carne.",
    },
    gospel: {
      ref: "Mateo 14, 22-33",
      text: "Jesús se acercó a ellos caminando sobre el mar. Los discípulos, al verlo caminar sobre el mar, se asustaron. Pero enseguida Jesús les dijo: '¡Ánimo, soy yo, no teman!'",
    },
    churchGuide:
      "Como San Antonio, que encontró en el silencio la voz de Dios, hoy la Iglesia nos invita a reconocer al Señor no en el ruido, sino en la brisa suave de lo cotidiano. Deja que tu jornada sea una pequeña predicación de obras.",
    finalPrayer:
      "Señor, que este día sea un reflejo de tu amor. Guíanos en cada paso y que todas nuestras acciones sean para tu gloria. Amén.",
    journeySteps: [
      {
        order: 1,
        kind: "intro" as const,
        title: "Paso 1",
        body: "Dios te bendiga. Hoy caminas con San Antonio de Padua.",
      },
      {
        order: 13,
        kind: "closing" as const,
        title: "Paso 13",
        body: "Oración final temática.",
      },
    ],
    aiGenerated: false,
  };
}

/** Obtiene el contenido de hoy, creándolo (seed) si es la primera vez. */
export async function getOrCreateTodayContent(): Promise<DailyContent> {
  const contentDate = todayISO();

  const existing = await db
    .select()
    .from(dailyContent)
    .where(eq(dailyContent.contentDate, contentDate))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [created] = await db
    .insert(dailyContent)
    .values(seedForToday(contentDate))
    .onConflictDoNothing({ target: dailyContent.contentDate })
    .returning();

  if (created) return created;

  // Carrera con otra request concurrente: releer.
  const [row] = await db
    .select()
    .from(dailyContent)
    .where(eq(dailyContent.contentDate, contentDate))
    .limit(1);
  return row;
}
