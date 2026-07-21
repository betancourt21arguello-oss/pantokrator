// ============================================================================
// CAMINO · Esquema de base de datos (Drizzle ORM · PostgreSQL / Supabase)
// ----------------------------------------------------------------------------
// Diseñado para Supabase (PostgreSQL). Usa `pg-core` de Drizzle para máxima
// compatibilidad. Todas las tablas viven en el schema `public` para que sean
// consumibles tanto por el Worker de Hono (vía Drizzle) como por Supabase
// Realtime / RLS.
//
// NOTA DE ARQUITECTURA: en producción, `profiles.id` referencia a
// `auth.users.id` de Supabase. En este sandbox (Postgres puro sin el schema
// `auth`) usamos un UUID autónomo con default, lo que mantiene el mismo
// contrato de datos y permite migrar a Supabase Auth sin cambiar el esquema.
// ============================================================================

import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// profiles
// Perfil del peregrino. Nace anónimo (is_anonymous = true) y se "vincula"
// cuando el usuario asocia un email vía Supabase Auth.
// ---------------------------------------------------------------------------
export const profiles = pgTable(
  "profiles",
  {
    // En producción: default -> auth.uid(); aquí generamos un UUID propio.
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),

    // Identidad progresiva
    isAnonymous: boolean("is_anonymous").notNull().default(true),
    email: text("email"),
    displayName: text("display_name"),
    avatarSeed: text("avatar_seed"), // semilla para avatar generado

    // Identificador de dispositivo para recuperar la sesión anónima
    // (se guarda también en una cookie httpOnly en el cliente).
    deviceId: text("device_id"),

    // --- SoulGarden / gamificación espiritual ---
    // El "jardín del alma" se compone de virtudes teologales:
    streakDays: integer("streak_days").notNull().default(0),
    lastActiveDate: date("last_active_date"),
    seedsFaith: integer("seeds_faith").notNull().default(0), // FE  (tallo)
    seedsHope: integer("seeds_hope").notNull().default(0), // ESPERANZA (hojas)
    seedsCharity: integer("seeds_charity").notNull().default(0), // CARIDAD (flores)
    candlesLit: integer("candles_lit").notNull().default(0), // VELAS

    // Contadores de actividad
    prayersCount: integer("prayers_count").notNull().default(0),
    intentionsCount: integer("intentions_count").notNull().default(0),

    // Preferencias (litúrgicas, notificaciones, etc.)
    preferences: jsonb("preferences")
      .$type<{
        notifications?: boolean;
        angelusReminder?: boolean;
        laudesReminder?: boolean;
        theme?: "light" | "dark" | "system";
      }>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("profiles_email_uidx").on(t.email),
    index("profiles_device_id_idx").on(t.deviceId),
    index("profiles_is_anonymous_idx").on(t.isAnonymous),
  ],
);

// ---------------------------------------------------------------------------
// daily_content
// Contenido de la jornada espiritual de un día concreto. Generado/curado
// (parcialmente vía Gemini cacheado) y servido a todos los peregrinos.
// Una fila por fecha litúrgica.
// ---------------------------------------------------------------------------
export const dailyContent = pgTable(
  "daily_content",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),

    // Fecha del contenido (clave natural única).
    contentDate: date("content_date").notNull(),

    // --- Contexto litúrgico ---
    liturgicalSeason: text("liturgical_season"), // "Tiempo Ordinario", "Adviento"...
    liturgicalColor: text("liturgical_color"), // "verde", "morado", "blanco"...
    feastName: text("feast_name"), // solemnidad / fiesta del día

    // Santo del día
    saintName: text("saint_name"), // "San Antonio de Padua"
    saintTitle: text("saint_title"), // "Taumaturgo", "Doctor de la Iglesia"
    saintBio: text("saint_bio"), // biografía breve

    // --- Frase del día (hero) ---
    dailyPhrase: text("daily_phrase"), // "Que brille así vuestra luz..."
    dailyPhraseRef: text("daily_phrase_ref"), // "Mateo 5, 16"

    // --- Lecturas de la jornada ---
    firstReading: jsonb("first_reading").$type<{
      ref?: string;
      text?: string;
    }>(),
    psalm: jsonb("psalm").$type<{
      ref?: string;
      response?: string;
      text?: string;
    }>(),
    secondReading: jsonb("second_reading").$type<{
      ref?: string;
      text?: string;
    }>(),
    gospel: jsonb("gospel").$type<{
      ref?: string;
      text?: string;
    }>(),

    // --- Guía / reflexión de la Iglesia (magisterio, homilía, comentario) ---
    churchGuide: text("church_guide"),

    // --- Reflexión generada por IA (Gemini, cacheada) ---
    aiReflection: text("ai_reflection"),

    // --- Oración final temática de la jornada ---
    finalPrayer: text("final_prayer"),

    // Pasos de la jornada guiada (secuencia 1..N vista en los mockups)
    journeySteps: jsonb("journey_steps")
      .$type<
        Array<{
          order: number;
          title: string;
          body?: string;
          kind: "intro" | "breathing" | "invocation" | "prayer" | "closing";
          repeat?: number;
        }>
      >()
      .default(sql`'[]'::jsonb`),

    // Marca si el contenido IA ya fue generado y cacheado por el cron.
    aiGenerated: boolean("ai_generated").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("daily_content_date_uidx").on(t.contentDate)],
);

// ---------------------------------------------------------------------------
// spiritual_tasks
// "Momentos de hoy" / tareas espirituales del peregrino (Laudes, Ángelus,
// Rosario, Comparte la Luz...). Registro por usuario y día.
// ---------------------------------------------------------------------------
export const spiritualTasks = pgTable(
  "spiritual_tasks",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),

    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    // Tipo de tarea / momento
    kind: text("kind").notNull(), // "laudes" | "angelus" | "rosario" | "jornada" | "share_light" | ...
    title: text("title").notNull(),
    subtitle: text("subtitle"),

    taskDate: date("task_date").notNull(),

    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    // Virtud recompensada al completar (para el SoulGarden)
    rewardVirtue: text("reward_virtue"), // "faith" | "hope" | "charity" | "candle"
    rewardAmount: integer("reward_amount").notNull().default(1),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("spiritual_tasks_profile_idx").on(t.profileId),
    index("spiritual_tasks_date_idx").on(t.taskDate),
    uniqueIndex("spiritual_tasks_unique_per_day").on(
      t.profileId,
      t.kind,
      t.taskDate,
    ),
  ],
);

// ---------------------------------------------------------------------------
// novenas_catalog
// Catálogo maestro de novenas disponibles (contenido curado, 9 días).
// ---------------------------------------------------------------------------
export const novenasCatalog = pgTable(
  "novenas_catalog",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),

    slug: text("slug").notNull(), // "sagrado-corazon", "san-jose"...
    title: text("title").notNull(), // "Novena al Sagrado Corazón"
    subtitle: text("subtitle"),
    description: text("description"),
    patron: text("patron"), // devoción / santo
    coverImage: text("cover_image"),
    accentColor: text("accent_color"),

    totalDays: integer("total_days").notNull().default(9),

    // Contenido diario de la novena: 9 días de oraciones/meditaciones.
    days: jsonb("days")
      .$type<
        Array<{
          day: number;
          title: string;
          meditation?: string;
          prayer: string;
        }>
      >()
      .notNull()
      .default(sql`'[]'::jsonb`),

    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("novenas_catalog_slug_uidx").on(t.slug)],
);

// ---------------------------------------------------------------------------
// user_novenas
// Inscripción y progreso de un peregrino en una novena concreta.
// ---------------------------------------------------------------------------
export const userNovenas = pgTable(
  "user_novenas",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),

    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    novenaId: uuid("novena_id")
      .notNull()
      .references(() => novenasCatalog.id, { onDelete: "cascade" }),

    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    currentDay: integer("current_day").notNull().default(1), // 1..9
    // Días completados (array de números de día) para permitir huecos.
    completedDays: jsonb("completed_days")
      .$type<number[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    lastPrayedAt: timestamp("last_prayed_at", { withTimezone: true }),

    // Intención personal que el peregrino ofrece con esta novena.
    intention: text("intention"),

    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("user_novenas_profile_idx").on(t.profileId),
    uniqueIndex("user_novenas_unique_active").on(t.profileId, t.novenaId),
  ],
);

// ---------------------------------------------------------------------------
// metric_events  (soporte para la ESCRITURA DIFERIDA vía Cloudflare Queues)
// El Worker de Hono NO escribe métricas directamente: las encola y un worker
// consumidor hace batch insert aquí. Fuente de verdad para analítica ligera.
// ---------------------------------------------------------------------------
export const metricEvents = pgTable(
  "metric_events",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    profileId: uuid("profile_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    eventType: text("event_type").notNull(), // "prayer.completed", "rosary.joined"...
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`),
    // Marca de tiempo en que ocurrió el evento (cliente/worker), no la de inserción.
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("metric_events_profile_idx").on(t.profileId),
    index("metric_events_type_idx").on(t.eventType),
    index("metric_events_occurred_idx").on(t.occurredAt),
  ],
);

// ---------------------------------------------------------------------------
// intentions_wall
// Almacena cada vela de intención encendida por la comunidad.
// Regla de negocio: expires_at = created_at + interval '24 hours'.
// intensity_level sube a medida que el usuario reza por esa intención.
// ---------------------------------------------------------------------------
export const intentionsWall = pgTable(
  "intentions_wall",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id").references(() => profiles.id, {
      onDelete: "set null",
    }),

    content: text("content").notNull(), // máx 40 chars (validar en server action)

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    intensityLevel: integer("intensity_level").notNull().default(1), // 1..5

    transformedToSeed: boolean("transformed_to_seed")
      .notNull()
      .default(false),

    supporters: jsonb("supporters")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
  },
  (t) => ({
    expiresIdx: index("intentions_wall_expires_idx").on(t.expiresAt),
    userIdx: index("intentions_wall_user_idx").on(t.userId),
  }),
);

// ---------------------------------------------------------------------------
// spiritual_inventory
// Una fila por peregrino. Almacena contadores de semillas (por devoción)
// y gotas de agua. Es la fuente de verdad para renderizar el Jardín del Alma.
// ---------------------------------------------------------------------------
export const spiritualInventory = pgTable(
  "spiritual_inventory",
  {
    profileId: uuid("profile_id")
      .primaryKey()
      .references(() => profiles.id, { onDelete: "cascade" }),

    // Semillas por devoción. Añadir columnas por cada tipo de devoción soportado.
    seedsRosary: integer("seeds_rosary").notNull().default(0),
    seedsMercy: integer("seeds_mercy").notNull().default(0),
    seedsJose: integer("seeds_jose").notNull().default(0), // San José
    seedsGuadalupe: integer("seeds_guadalupe").notNull().default(0),
    seedsRequiem: integer("seeds_requiem").notNull().default(0), // 100 Réquiem
    seedsJourney: integer("seeds_journey").notNull().default(0), // Jornada Diaria

    // Agua (multiplicador visual y fruto de orar por otros)
    waterDrops: integer("water_drops").notNull().default(0),

    // Liturgia y racha (para fauna sensible y estaciones)
    currentStreak: integer("current_streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    inventoryProfileIdx: index("spiritual_inventory_profile_idx").on(
      t.profileId,
    ),
  }),
);

// ---------------------------------------------------------------------------
// Tipos inferidos (para uso en el frontend y las API routes)
// ---------------------------------------------------------------------------
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type DailyContent = typeof dailyContent.$inferSelect;
export type NewDailyContent = typeof dailyContent.$inferInsert;

export type SpiritualTask = typeof spiritualTasks.$inferSelect;
export type NewSpiritualTask = typeof spiritualTasks.$inferInsert;

export type NovenaCatalog = typeof novenasCatalog.$inferSelect;
export type NewNovenaCatalog = typeof novenasCatalog.$inferInsert;

export type UserNovena = typeof userNovenas.$inferSelect;
export type NewUserNovena = typeof userNovenas.$inferInsert;

export type MetricEvent = typeof metricEvents.$inferSelect;
export type NewMetricEvent = typeof metricEvents.$inferInsert;

export type Intention = typeof intentionsWall.$inferSelect;
export type NewIntention = typeof intentionsWall.$inferInsert;

export type SpiritualInventory = typeof spiritualInventory.$inferSelect;
export type NewSpiritualInventory = typeof spiritualInventory.$inferInsert;

// Prevent unused primaryKey import from failing lint in strict setups while
// keeping it available for future composite keys.
export const __schemaMeta = { primaryKey };
