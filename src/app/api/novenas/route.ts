// GET /api/novenas — catálogo de novenas (siembra 3 novenas si está vacío).
import { db } from "@/db";
import { novenasCatalog } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const SEED_NOVENAS = [
  {
    slug: "sagrado-corazon",
    title: "Novena al Sagrado Corazón de Jesús",
    subtitle: "Confía tus intenciones al Corazón de Cristo",
    description:
      "Nueve días de oración confiada a la misericordia infinita del Corazón de Jesús.",
    patron: "Sagrado Corazón de Jesús",
    accentColor: "#8f2d2d",
    totalDays: 9,
    isFeatured: true,
    days: Array.from({ length: 9 }, (_, i) => ({
      day: i + 1,
      title: `Día ${i + 1}`,
      meditation:
        "El Corazón de Jesús es fuente inagotable de misericordia para quien se acerca con confianza.",
      prayer:
        "Corazón Sagrado de Jesús, en Ti confío. Acoge mi intención de estos nueve días y transfórmala según tu voluntad. Amén.",
    })),
  },
  {
    slug: "san-jose",
    title: "Novena a San José",
    subtitle: "Patrono de la Iglesia y de las familias",
    description:
      "Invoca la intercesión de San José, custodio fiel y trabajador silencioso.",
    patron: "San José",
    accentColor: "#5b6b8c",
    totalDays: 9,
    isFeatured: false,
    days: Array.from({ length: 9 }, (_, i) => ({
      day: i + 1,
      title: `Día ${i + 1}`,
      meditation:
        "San José custodió con silencio y obediencia lo más sagrado que Dios le confió.",
      prayer:
        "Glorioso San José, guarda mi hogar y mi trabajo como guardaste a la Sagrada Familia. Amén.",
    })),
  },
  {
    slug: "virgen-guadalupe",
    title: "Novena a la Virgen de Guadalupe",
    subtitle: "Madre de América, Estrella de la Evangelización",
    description:
      "Nueve días para encomendarte a la intercesión maternal de María de Guadalupe.",
    patron: "Nuestra Señora de Guadalupe",
    accentColor: "#2f6b4f",
    totalDays: 9,
    isFeatured: true,
    days: Array.from({ length: 9 }, (_, i) => ({
      day: i + 1,
      title: `Día ${i + 1}`,
      meditation:
        "¿No estoy yo aquí, que soy tu Madre? — palabras de consuelo de la Virgen a Juan Diego.",
      prayer:
        "Virgen de Guadalupe, Madre nuestra, cubre con tu manto a quienes amo y guía mis pasos. Amén.",
    })),
  },
];

export async function GET() {
  try {
    let rows = await db.select().from(novenasCatalog).where(eq(novenasCatalog.isActive, true));

    if (rows.length === 0) {
      await db.insert(novenasCatalog).values(SEED_NOVENAS).onConflictDoNothing();
      rows = await db
        .select()
        .from(novenasCatalog)
        .where(eq(novenasCatalog.isActive, true));
    }

    return Response.json({ ok: true, novenas: rows });
  } catch (err) {
    console.error("[novenas]", err);
    return Response.json(
      { ok: false, error: "No se pudo cargar el catálogo de novenas." },
      { status: 500 },
    );
  }
}
