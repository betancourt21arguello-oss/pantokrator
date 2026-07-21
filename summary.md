# CAMINO - Resumen Completo del Proyecto

> **Nombre del proyecto:** CAMINO - Tu jornada espiritual (Rosario Perpetuo)
> **Dominio:** Aplicación web progresiva (PWA) católica para la oración diaria, el Rosario Comunitario en vivo y el seguimiento espiritual.
> **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.9, PostgreSQL (Supabase), Drizzle ORM, Tailwind CSS v4, Framer Motion, Vitest
> **Infraestructura Cloud:** Cloudflare Workers (Hono.js), Cloudflare Queues, Cloudflare R2, Cloudflare Cache API, Gemini AI
> **URL base del proyecto:** `d:\documentos\pantokrator`

---

## 1. ARQUITECTURA GENERAL

### 1.1 Stack Tecnológico Principal

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI | React | 19.2.6 |
| Lenguaje | TypeScript | 5.9.3 |
| Estilos | Tailwind CSS v4 | 4.1.17 |
| Animaciones | Framer Motion | 12.42.2 |
| Base de Datos | PostgreSQL (Supabase) | — |
| ORM | Drizzle ORM | 0.45.2 |
| Cliente DB | pg (node-postgres) | 8.20.0 |
| Cliente Supabase | @supabase/supabase-js | 2.110.7 |
| Testing | Vitest + Testing Library | 4.1.10 |
| Linting | ESLint (config Next.js) | 9.39.4 |

### 1.2 Infraestructura Cloud (Cloudflare Workers)

| Componente | Propósito |
|-----------|-----------|
| **Worker Hono** (`src/worker/index.ts`) | API backend para el Rosario en vivo (cron cada 10s, timeout de lectores, heartbeat) |
| **Cloudflare Queues** (`camino-events`) | Escritura diferida de eventos/métricas hacia Supabase (batch insert) |
| **Cloudflare R2** (`camino-media`) | Almacenamiento de imágenes de misterios y audios de meditación |
| **Cron Trigger** (05:00 UTC) | Generación diaria de contenido IA con Gemini, cacheado |
| **Cache API** (`caches.open("camino-ai")`) | Cacheo de respuestas de Gemini para el contenido diario |

### 1.3 Patrones de Arquitectura Clave

- **Identidad progresiva (Zero-friction auth):** El usuario entra sin registro. Se crea un perfil anónimo vinculado a un `deviceId` (cookie httpOnly de 2 años). Puede vincular email después conservando todo el progreso.
- **Escritura diferida (Deferred writes):** Las métricas no se escriben directo a DB. El Worker Hono las encola → Cloudflare Queues → Consumer hace batch insert en Supabase. Así se protege el pool de conexiones gratuito de Supabase.
- **Contenido diario semilla (Seed + Gemini):** El contenido litúrgico del día se crea con datos semilla la primera vez que se solicita. El cron de Gemini lo reemplaza con contenido generado por IA.
- **Rosario Comunitario distribuido:** El frontend se suscribe vía Supabase Realtime a cambios de sesión. El Worker Hono avanza los pasos, asigna lectores y limpia zombies. No hay WebSockets propios — todo es Realtime de Supabase.

---

## 2. ESTRUCTURA DE DIRECTORIOS

```
pantokrator/
├── .env.example                    # Variables de entorno de ejemplo
├── .env.local                      # Variables de entorno locales (ignorado por git)
├── .gitignore
├── drizzle.config.json             # Configuración de Drizzle Kit (PostgreSQL)
├── instrucciones.md                # Guía completa de implementación (1624 líneas)
├── next.config.ts                  # Config Next.js (distDir = ".next-build")
├── package.json                    # Dependencias y scripts
├── postcss.config.mjs              # PostCSS con Tailwind v4
├── tsconfig.json                   # TypeScript (paths: @/* → ./src/*)
├── vitest.config.ts                # Vitest + jsdom + @vitejs/plugin-react
├── wrangler.toml                   # Config Cloudflare Workers (producer + consumer queues)
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── globals.css             # Sistema de diseño Tailwind + animaciones
│   │   ├── layout.tsx              # Layout raíz (metadata, viewport, PWA)
│   │   ├── page.tsx                # Página principal → CaminoHome
│   │   │
│   │   ├── api/                    # API Routes (Next.js Route Handlers)
│   │   │   ├── auth/
│   │   │   │   ├── session/route.ts    # GET: inicia sesión, devuelve perfil
│   │   │   │   └── link-email/route.ts # POST: vincula email al perfil anónimo
│   │   │   ├── daily-content/route.ts  # GET: contenido litúrgico del día
│   │   │   ├── health/route.ts         # GET: health check (SELECT 1)
│   │   │   ├── tasks/
│   │   │   │   ├── today/route.ts          # GET: tareas del peregrino hoy
│   │   │   │   ├── complete/route.ts       # POST: completar tarea + virtudes
│   │   │   │   ├── progress/route.ts       # POST: autoguardado incremental
│   │   │   │   └── community-counts/route.ts # GET: cuántos rezan hoy
│   │   │   ├── novenas/
│   │   │   │   ├── route.ts                # GET: catálogo (siembra 3 si vacío)
│   │   │   │   ├── join/route.ts           # POST: inscribirse a una novena
│   │   │   │   ├── mine/route.ts           # GET: novenas del peregrino
│   │   │   │   └── progress/route.ts       # POST: marcar día rezado
│   │   │   └── queues/consume/route.ts  # POST: batch insert de métricas (emula Queue consumer)
│   │   │
│   │   ├── jornada/page.tsx           # Jornada Diaria → DailyJourney
│   │   ├── rosario/
│   │   │   ├── page.tsx               # Home del Rosario Mundial Vivo
│   │   │   └── en-vivo/page.tsx       # Rosario en vivo con Realtime
│   │   ├── comunidad/
│   │   │   ├── page.tsx               # DevotionsHub (novenas)
│   │   │   └── cien-requiem/page.tsx  # 100 Réquiem (sufragio)
│   │   └── perfil/page.tsx            # Perfil + SoulGarden
│   │
│   ├── components/
│   │   ├── CaminoHome.tsx             # Página principal con anillo, hero, momentos
│   │   ├── AnonymousBanner.tsx        # Banner + modal para vincular email
│   │   ├── BottomNav.tsx              # Navegación inferior fija (4 tabs)
│   │   ├── DailyJourney.tsx           # Jornada de 13 pasos (swipe/tap, silencio, reflexión)
│   │   ├── DevotionsHub.tsx           # Gestor de Novenas (catálogo + mis novenas)
│   │   ├── FloatingSaveBanner.tsx     # Banner flotante para guardar sufragios
│   │   ├── SoulGarden.tsx             # Jardín del Alma procedural (SVG, L-System)
│   │   ├── CienRequiem.tsx            # Sufragio 100 Réquiem (tap, vibration, cuadrícula)
│   │   │
│   │   └── rosario/
│   │       ├── CommunityTreeSVG.tsx    # Árbol comunitario SVG (hojas por participante)
│   │       ├── IntentionInput.tsx      # Input de intenciones de oración (max 40 chars)
│   │       ├── InterludeOverlay.tsx    # Overlay de interludio con misterio, chat, audio
│   │       ├── LivePrayerScreen.tsx    # Pantalla de oración en vivo (ave maría, voz, árbol)
│   │       ├── LongPressButton.tsx     # Botón de presión sostenida con anillo de progreso
│   │       └── RosaryCommunitySVG.tsx  # Visualización SVG de la comunidad rezando (400x400)
│   │
│   ├── hooks/
│   │   ├── useProgressiveAuth.ts      # Auth progresiva (anon → email, get/refresh profile)
│   │   ├── usePrayerExperience.ts     # Experiencia de oración (conteo, voz, haptics)
│   │   ├── useRosarioSync.ts          # Sincronización Realtime del Rosario
│   │   ├── useRosaryRoom.ts           # Hook de sala Realtime (presencia + broadcast)
│   │   └── useVoiceRecognition.ts     # Web Speech API wrapper
│   │
│   ├── lib/
│   │   ├── supabase.ts               # Cliente Supabase browser (singleton)
│   │   ├── identity.ts               # Gestión de identidad progresiva (server-only)
│   │   ├── metrics.ts                # Escritura diferida de eventos (batch insert)
│   │   ├── dailyContent.ts           # Contenido diario (seed + get o create)
│   │   │
│   │   ├── devotions/                # Motor genérico de devociones
│   │   │   ├── types.ts              # Tipos TS del motor de oración (PrayerProgram, etc.)
│   │   │   ├── engine.ts             # Motor: flatten, advance, assign roles, transitions
│   │   │   ├── rosary.json           # Programa del Rosario (22 steps, misterios dolorosos)
│   │   │   └── programs/
│   │   │       └── rosary-misterios-dolorosos.json  # Programa jerárquico (árbol de nodos)
│   │   │
│   │   └── rosario/
│   │       └── engine.ts             # Motor simplificado de devociones (loadProgram, advance)
│   │
│   ├── db/
│   │   ├── index.ts                  # Conexión Drizzle (pool singleton, globalThis)
│   │   └── schema.ts                 # Esquema completo Drizzle ORM (6 tablas + tipos)
│   │
//  └── worker/                        # [PLANEADO] Worker Hono para Cloudflare
│       └── index.ts                  # Hono app: cron/advance, /rosario/join, respond, chat
│
├── tests/
│   ├── setup.ts                     # Setup Vitest (@testing-library/jest-dom)
│   │
│   ├── unit/
│   │   ├── rosario-engine.test.ts   # Tests del motor de devociones (load, advance, flatten)
│   │   ├── CommunityTreeSVG.test.tsx # Tests del árbol SVG comunitario
│   │   ├── RosaryCommunitySVG.test.tsx # Tests del SVG de comunidad rezando
│   │   └── usePrayerExperience.test.ts # Tests del hook de oración (conteo, voz, progress)
│   │
│   └── integration/
│       └── rosario-realtime.test.ts  # Tests de integración Realtime (mocked Supabase)
│
└── src/types/
    └── speech.d.ts                   # TypeScript declarations para Web Speech API
```

---

## 3. BASE DE DATOS (PostgreSQL / Supabase)

### 3.1 Esquema General (Drizzle ORM)

El esquema vive en `src/db/schema.ts`. Contiene **6 tablas** en el schema `public`:

#### 3.1.1 `profiles` — Perfil del Peregrino
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | `gen_random_uuid()` |
| `is_anonymous` | boolean | Default `true` |
| `email` | text | Vinculado al vincular cuenta |
| `display_name` | text | Nombre visible |
| `avatar_seed` | text | Semilla para avatar generado (determinista) |
| `device_id` | text | Identificador de dispositivo (cookie httpOnly) |
| `streak_days` | integer | Racha de días consecutivos |
| `last_active_date` | date | Último día activo |
| `seeds_faith` | integer | Virtud FE (tallo del jardín) |
| `seeds_hope` | integer | Virtud ESPERANZA (hojas) |
| `seeds_charity` | integer | Virtud CARIDAD (flores) |
| `candles_lit` | integer | Velas encendidas (sufragios) |
| `prayers_count` | integer | Total oraciones |
| `intentions_count` | integer | Total intenciones ofrecidas |
| `preferences` | jsonb | Preferencias (notificaciones, tema, etc.) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### 3.1.2 `daily_content` — Contenido de la Jornada
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | |
| `content_date` | date | Fecha del contenido (UNIQUE) |
| `liturgical_season` | text | "Tiempo Ordinario", "Adviento"... |
| `liturgical_color` | text | "verde", "morado", "blanco" |
| `feast_name` | text | Solemnidad/fiesta del día |
| `saint_name` / `saint_title` / `saint_bio` | text | Santo del día |
| `daily_phrase` / `daily_phrase_ref` | text | Frase del día + cita |
| `first_reading` / `psalm` / `second_reading` / `gospel` | jsonb | Lecturas litúrgicas |
| `church_guide` | text | Guía/reflexión de la Iglesia |
| `ai_reflection` | text | Reflexión generada por Gemini |
| `final_prayer` | text | Oración temática |
| `journey_steps` | jsonb | Secuencia de pasos de la jornada guiada |
| `ai_generated` | boolean | Si el contenido IA fue generado |

#### 3.1.3 `spiritual_tasks` — Tareas/Momentos Espirituales
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | |
| `profile_id` | FK → profiles | Peregrino |
| `kind` | text | "laudes" \| "angelus" \| "rosario" \| "jornada" \| "share_light" \| "cien_requiem" |
| `title` / `subtitle` | text | |
| `task_date` | date | Fecha de la tarea |
| `completed` | boolean | |
| `completed_at` | timestamptz | |
| `reward_virtue` | text | "faith" \| "hope" \| "charity" \| "candle" |
| `reward_amount` | integer | |
| `metadata` | jsonb | Datos adicionales (reflexión, conteo) |
| **UNIQUE** | | (profile_id, kind, task_date) |

#### 3.1.4 `novenas_catalog` — Catálogo de Novenas
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | |
| `slug` | text | "sagrado-corazon", "san-jose", "virgen-guadalupe" |
| `title` / `subtitle` / `description` | text | |
| `patron` | text | Devoción/santo |
| `cover_image` / `accent_color` | text | |
| `total_days` | integer | Default 9 |
| `days` | jsonb | Array de 9 días (meditation, prayer) |
| `is_featured` / `is_active` | boolean | |

#### 3.1.5 `user_novenas` — Progreso en Novenas
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | |
| `profile_id` | FK → profiles | |
| `novena_id` | FK → novenas_catalog | |
| `started_at` | timestamptz | |
| `current_day` | integer | 1..9 |
| `completed_days` | jsonb | Array de números de día |
| `intention` | text | Intención personal |
| `completed` / `completed_at` | | |
| **UNIQUE** | | (profile_id, novena_id) |

#### 3.1.6 `metric_events` — Eventos de Métrica (Escritura Diferida)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID PK | |
| `profile_id` | FK → profiles | |
| `event_type` | text | "task.completed.jornada", "novena.day_completed"... |
| `payload` | jsonb | Datos del evento |
| `occurred_at` | timestamptz | Timestamp del evento original |

### 3.2 Tablas del Rosario (Worker Hono)

Estas tablas son gestionadas exclusivamente por el Worker de Cloudflare para el motor de oración en árbol:

#### `rosary_sessions` — Sesión Global del Rosario
- `id` UUID PK, `program_id` TEXT (UNIQUE), `program_slug` TEXT
- `current_node_id` TEXT — ID del nodo actual en el árbol de composición
- `current_node_type` TEXT — `step` o `module`
- `repeat_count` INTEGER — Contador de repeticiones en nodos `repeat`
- `is_paused` BOOLEAN — Si la sesión está pausada
- `reader_profile_id`, `reader_timeout_at`, `reader_assigned_at`
- `total_participants`, `total_responses`
- `started_at`, `updated_at`

#### `rosary_participants` — Participantes en Vivo
- `id` UUID PK, FK → rosary_sessions, FK → profiles
- `display_name`, `country_code`, `avatar_seed`
- `is_responding`, `last_seen_at`, `joined_at`
- UNIQUE: (session_id, profile_id)

#### `rosary_chat` — Mensajes del Interludio
- `id` UUID PK, FK → rosary_sessions, FK → profiles (nullable)
- `display_name`, `text` (max 120 chars)
- `created_at`

#### `prayer_programs` — Programas JSON de Devoción
- `id` TEXT PK, `slug` TEXT UNIQUE
- `title`, `description`, `accent_color`
- `root_json` JSONB — Árbol de composición completo (PrayerModule)
- `metadata` JSONB — Datos adicionales
- `is_active` BOOLEAN, `created_at`, `updated_at`

### 3.3 Tipos Inferidos (TypeScript)

El schema exporta tipos inferidos para cada tabla:
- `Profile`, `NewProfile`, `DailyContent`, `NewDailyContent`
- `SpiritualTask`, `NewSpiritualTask`, `NovenaCatalog`, `NewNovenaCatalog`
- `UserNovena`, `NewUserNovena`, `MetricEvent`, `NewMetricEvent`
- `RosarySession`, `RosaryParticipant`, `RosaryChat` (para Worker Hono)

---

## 4. SISTEMA DE AUTENTICACIÓN (Identidad Progresiva)

### 4.1 Flujo

1. **Usuario llega por primera vez:** `GET /api/auth/session` → `getOrCreateProfile()` en `src/lib/identity.ts` → Crea perfil anónimo con `deviceId` único → Cookie httpOnly (`camino_device_id`, 2 años)
2. **Usuario recarga:** La cookie existe → Se busca perfil por `deviceId` → Se devuelve el mismo perfil
3. **Usuario vincula email:** `POST /api/auth/link-email` → `linkEmailToProfile()` → Actualiza `is_anonymous=false`, `email`, `displayName` → Conserva racha, jardín, virtudes
4. **Supabase Auth (futuro):** La función `ensureAnonymousSupabaseSession()` en `src/lib/supabase.ts` ya está lista para hacer `signInAnonymously()` cuando el proyecto Supabase esté configurado

### 4.2 Arquitectura

- **Server-only:** `src/lib/identity.ts` usa `import "server-only"` y `next/headers` para cookies
- **Frontend:** `useProgressiveAuth` hook expone `profile`, `isAnonymous`, `loading`, `linkEmail()`, `refresh()`
- **Seguridad:** La cookie es httpOnly, sameSite lax, secure en producción

---

## 5. COMPONENTES Y PÁGINAS

### 5.1 Páginas (App Router)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `CaminoHome` | Home: anillo de progreso, frase hero, santo del día, momentos, CTA jornada |
| `/jornada` | `DailyJourney` | Jornada de 13 pasos (full-screen, swipe/tap, silencio 20s, reflexión) |
| `/rosario` | `RosarioHomePage` | Home del Rosario: misterio del día, cuentas, muro de contemplación |
| `/rosario/en-vivo` | `RosarioEnVivoPage` | Rosario en vivo: árbol SVG, paso actual, oración, reconexión |
| `/comunidad` | `DevotionsHub` | Catálogo de novenas + mis novenas en curso + modal de oración |
| `/comunidad/cien-requiem` | `CienRequiem` | Sufragio 100 Réquiem: anillo + cuadrícula + tap + autoguardado |
| `/perfil` | `PerfilPage` | Perfil: SoulGarden, métricas, virtudes, oratorio personal |

### 5.2 Componentes Principales

#### CaminoHome (src/components/CaminoHome.tsx)
- Anillo de progreso tipo Apple Activity Ring (3 momentos: jornada, laudes, angelus)
- Tarjeta Hero con frase del día (fondo `#0f1526`, sombra)
- Santo del día con inicial
- CTA "Comenzar mi jornada" → `/jornada`
- Cuadrícula de "Momentos de Hoy" con contador comunitario
- "Comparte la Luz" (Web Share API / clipboard)
- BottomNav integrado

#### DailyJourney (src/components/DailyJourney.tsx)
- 13 pasos exactos, navegación por swipe/tap con Framer Motion
- Barra de progreso tipo Instagram Stories
- Pasos: intro → respiración → invocación Espíritu Santo → oración → frase → 1ra lectura → salmo → 2da lectura → evangelio → guía Iglesia → silencio 20s (anillo) → reflexión textarea → oración final
- Al completar: POST a `/api/tasks/complete` + recompensa FE +2

#### SoulGarden (src/components/SoulGarden.tsx)
- Jardín procedural generado con L-System simplificado (recursión explícita)
- PRNG determinista (mulberry32) con semilla por peregrino → mismo jardín siempre
- `seedsFaith` → tallo (altura, grosor, profundidad de ramificación)
- `seedsHope` → hojas verdes (cantidad, tamaño)
- `seedsCharity` → flores rosas (floración en puntas)
- Límites: ≤60 ramas, ≤48 hojas, ≤36 flores
- SVG plano, animaciones GPU-friendly (pathLength, scale, opacity)

#### CienRequiem (src/components/CienRequiem.tsx)
- 100 taps de "Dale, Señor, el descanso eterno"
- Feedback háptico (Vibration API: 12ms por tap, [20,40,20] al completar)
- Anillo de progreso + cuadrícula 10×10 de cuentas
- Autoguardado incremental (debounced 400ms) via `/api/tasks/progress`
- Recompensa: 1 vela (candle) al completar

#### DevotionsHub (src/components/DevotionsHub.tsx)
- Catálogo de 3 novenas semilla: Sagrado Corazón, San José, Virgen de Guadalupe
- Inscripción (POST `/api/novenas/join`)
- Progreso visual (barra) + modal de oración diaria
- Al completar día: POST `/api/novenas/progress`

#### RosaryCommunitySVG (src/components/rosario/RosaryCommunitySVG.tsx)
- Visualización SVG 400×400 de la comunidad rezando
- Nodos circulares en órbita alrededor del centro (oro, azul mariano)
- Paleta sagrada: gold `#C6A15B`, marianBlue `#5E81AC`, ivory `#FAF8F5`
- Código de países: colores HSL por país (AR, BR, CO, ES, FR, IT, JP, MX, PE, PH, PL, PT, US, VE)
- Animaciones SVG nativas (`<animate>`) en nodos que responden
- Límite: 120 nodos máximo

#### CommunityTreeSVG (src/components/rosario/CommunityTreeSVG.tsx)
- Árbol comunitario SVG: tronco + ramas + hojas por participante
- Hoja del usuario actual: opacidad 1, scale 1.2
- Color y forma de hoja determinista por participante
- Paleta sagrada de 8 colores

### 5.3 Componentes de Interfaz

- **AnonymousBanner:** Banner persistente + modal para vincular email (validación, estado done, loading)
- **BottomNav:** 4 tabs (Camino, Rosario, Comunidad, Mi Perfil) con iconos y estado activo
- **FloatingSaveBanner:** Banner flotante para pantallas devocionales (Novenas, 100 Réquiem)
- **IntentionInput:** Input de intención (max 40 chars) para ofrecer a la comunidad
- **InterludeOverlay:** Overlay de interludio con imagen de misterio, audio, chat comunitario, temporizador
- **LivePrayerScreen:** Pantalla de oración en vivo con botón central, anillo de progreso, activación por voz
- **LongPressButton:** Botón de presión sostenida con anillo de progreso SVG (500ms por defecto)

---

## 6. HOOKS

### 6.1 `useProgressiveAuth` (src/hooks/useProgressiveAuth.ts)
- **Propósito:** Gestionar la autenticación progresiva desde el frontend
- **Retorna:** `{ profile, isAnonymous, loading, error, linkEmail, refresh }`
- **Flujo:** Al montar → GET `/api/auth/session` → establece profile
- **linkEmail:** POST `/api/auth/link-email` → actualiza profile local

### 6.2 `usePrayerExperience` (src/hooks/usePrayerExperience.ts)
- **Propósito:** Experiencia de oración con conteo, voz y haptics
- **Retorna:** `{ count, isResponding, voiceEnabled, isListening, transcript, triggerPrayer, toggleVoice, reset, progress }`
- **targetCount:** Default 10 (Ave Marías por década)
- **Voz:** Web Speech API (es-ES), detecta "amén", "ahora y en la hora de nuestra muerte amén" como avance automático
- **Haptics:** `navigator.vibrate(50)` en cada oración
- **onComplete:** Callback al alcanzar targetCount

### 6.3 `useRosarioSync` (src/hooks/useRosarioSync.ts)
- **Propósito:** Sincronización Realtime del Rosario Comunitario
- **Retorna:** `{ participants, currentStepIndex, isConnected, sendResponse, sendChatMessage }`
- **Presencia:** Supabase Realtime (channel `rosario:{programId}`)
- **Heartbeat:** Cada 25s via `/api/rosario/heartbeat`
- **Broadcast events:** "step", "response", "chat"

### 6.4 `useRosaryRoom` (src/hooks/useRosaryRoom.ts)
- **Propósito:** Hook más simple de sala Realtime (presencia + broadcast)
- **Retorna:** `{ onlineUsers, aveMariaCount, isInterlude, prayAveMaria }`
- **Eventos:** "prayer", "interlude", "presence sync"

### 6.5 `useVoiceRecognition` (src/hooks/useVoiceRecognition.ts)
- **Propósito:** Wrapper genérico para Web Speech API
- **Retorna:** `{ isListening, transcript, startListening, stopListening, toggleListening, isSupported }`
- **Idioma:** es-ES por defecto

---

## 7. API ROUTES (Next.js Route Handlers)

### 7.1 Autenticación
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/auth/session` | GET | Inicializa perfil (anónimo si no existe) y lo devuelve |
| `/api/auth/link-email` | POST | Vincula email al perfil (valida formato, detecta clash) |

### 7.2 Contenido Diario
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/daily-content` | GET | Obtiene contenido litúrgico de hoy (seed si no existe) |
| `/api/health` | GET | Health check (`SELECT 1`) |

### 7.3 Tareas Espirituales
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/tasks/today` | GET | Tareas del día del peregrino actual |
| `/api/tasks/complete` | POST | Marca tarea completada + otorga virtudes + racha + métrica |
| `/api/tasks/progress` | POST | Autoguardado incremental (sin recompensa, sin marcar completado) |
| `/api/tasks/community-counts` | GET | Agregados comunitarios: "X personas rezando" por tipo |

### 7.4 Novenas
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/novenas` | GET | Catálogo de novenas (siembra 3 si vacío) |
| `/api/novenas/join` | POST | Inscribe al peregrino en una novena |
| `/api/novenas/mine` | GET | Novenas activas del peregrino (JOIN con catálogo) |
| `/api/novenas/progress` | POST | Marca día como rezado (avanza currentDay) |

### 7.5 Métricas (Cola)
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/queues/consume` | POST | Batch insert de eventos (emula Cloudflare Queue consumer) |

---

## 8. MOTOR DE DEVOCIONES (Prayer Engine)

Arquitectura universal basada en árbol de composición. Un programa de oración no es una lista plana, sino un árbol de nodos que el motor recorre y ejecuta.

**Concepto central:**
```
Prayer (Rosario)
│
├── Introducción (Sequence)
│   ├── Por la señal (PrayerStep)
│   ├── Acto de contrición (PrayerStep)
│   └── Oraciones iniciales (Sequence)
│
├── Ciclo de Misterios ×5 (Repeat)
│   └── Misterio (Sequence)
│       ├── Misterio (MysteryStep)
│       ├── Padre Nuestro (PrayerStep)
│       ├── Ave María ×10 (RepeatedPrayer)
│       ├── Gloria (PrayerStep)
│       └── Reflexión 2 min (ReflectionStep + Chat + Audio)
│
└── Clausura (Sequence)
    ├── Salve (FinalPrayer)
    ├── Cordero de Dios (PrayerStep)
    └── Oración final (FinalPrayer)
```

El motor entiende solo 4 conceptos:
- **Sequence:** ejecuta hijos en orden
- **Repeat:** ejecuta hijos N veces
- **PrayerStep:** nodo hoja (oración, lectura, misterio, reflexión, silencio, etc.)
- **PrayerModule:** contenedor genérico para nodos compuestos

Cualquier devoción (Rosario, Coronillas, Novenas, Vía Crucis) se construye combinando estos bloques. No requiere modificar el motor.

### 8.1 Tipos (src/lib/devotions/types.ts)

Define el sistema de tipos completo:
- **PrayerProgram:** Programa completo con `root: PrayerModule`, `id`, `slug`, `title`, `accentColor`
- **PrayerModule:** Nodo contenedor (`sequence | repeat | choice | pause`) con `children: PrayerNode[]`
- **PrayerStep:** Nodo hoja con `id`, `type`, `title`, `text`, `audio`, `image`, `durationMs`, `requiresResponse`, `requiresLeader`, `roles`, `actions`, `transitions`
- **PrayerNode:** Unión `PrayerStep | PrayerModule`
- **PrayerSessionState:** `currentNodeId`, `currentNodeType`, `repeatCount`, `readerProfileId`, `isPaused`
- **PrayerRole:** `leader | assembly | everyone | silent | automatic`
- **PrayerAction:** `advance | assign_leader | open_chat | play_audio | show_image | emit_broadcast | ...`
- **PrayerTransition:** `on_complete | on_timeout | on_response | ...`
- **PrayerRealtimeBroadcast:** eventos de sincronización comunitaria

### 8.2 Engine (src/lib/devotions/engine.ts)

Funciones puras del motor:
- `loadProgram(program)` → `PrayerEngine` (programa + sesión inicializada)
- `flattenProgram(program)` → aplana el árbol en lista DFS (sin perder jerarquía)
- `getNodeById(program, nodeId)` → busca nodo por ID
- `initializeSession(program)` → apunta al primer `PrayerStep` del árbol
- `getCurrentNode()` / `getCurrentStep()` → nodo/paso actual según `currentNodeId`
- `advanceSession(program, session)` → avanza al siguiente nodo, maneja `repeat` y wrap-around
- `evaluateTransition(program, session, trigger)` → evalúa condiciones y ejecuta transiciones
- `executeAction(action)` → side effects: broadcast, assign_leader, play_audio, open_chat, etc.
- `assignRole(step, participants)` → asigna participantes a roles (leader, assembly, everyone, silent, automatic)
- `isStep()` / `isModule()` → type guards

### 8.3 Programas de Devoción (JSON)

Dos formatos:
1. **Plano** (`src/lib/devotions/rosary.json`): Array de steps (formato legacy)
2. **Jerárquico** (`src/lib/devotions/programs/*.json`): Árbol de módulos y steps (formato actual)

Ejemplo de programa jerárquico (`rosary-misterios-dolorosos.json`):
- `root` → `sequence` con 3 hijos: intro, ciclo misterios, clausura
- `module-ciclo-misterios` → `repeat` con 5 iteraciones
- Cada iteración → `sequence` con 7 steps: misterio, padrenuestro, 10 avemarías, gloria, reflexión

### 8.4 Ventajas de la nueva arquitectura

- **100% extensible:** Nueva devoción = nuevo JSON sin tocar el motor
- **100% reutilizable:** Steps comunes (Padre Nuestro, Gloria) se reutilizan en todas las devociones
- **100% mantenible:** Lógica de navegación centralizada en `advanceSession`
- **100% declarativo:** El JSON describe la experiencia completa (texto, audio, roles, transiciones)
- **Compatible Supabase Free Tier:** Session guarda solo `current_node_id`, `repeat_count` — no requiere joins complejos

### 8.5 Extender a nuevas devociones

Para agregar Coronilla de la Divina Misericordia, Novena, Vía Crucis, etc.:

1. Crear nuevo JSON en `src/lib/devotions/programs/coronilla-divina-misericordia.json`
2. Definir el árbol de módulos y steps con sus tipos, roles, acciones y transiciones
3. Registrar el programa en Supabase tabla `prayer_programs`
4. El frontend carga dinámicamente y ejecuta con el mismo engine

No se requiere modificar `types.ts`, `engine.ts`, componentes del Rosario, ni el Worker Hono.

---

## 9. SISTEMA DE DISEÑO (CSS/Tailwind)

### 9.1 Paleta de Colores
| Variable | Valor | Uso |
|----------|-------|-----|
| `--color-camino-bg` | `#f7f5f0` | Fondo general (crema claro) |
| `--color-camino-ink` | `#1c1c1e` | Texto principal (casi negro) |
| `--color-camino-muted` | `#6b6b70` | Texto secundario |
| `--color-camino-sage` | `#6f7f5f` | Verde salvia (virtudes, naturaleza) |
| `--color-camino-gold` | `#c9a24b` | Dorado (rosario, misterios) |
| `--color-camino-night` | `#0f1526` | Fondo oscuro (rosario en vivo) |
| `--radius-camino` | `16px` | Radio de esquinas redondeadas |

### 9.2 Tipografía
- **Font stack Apple:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Text rendering:** `optimizeLegibility`
- **Smoothing:** `antialiased`

### 9.3 Design Tokens
- Touch targets mínimos: 44px (Apple HIG)
- Transiciones: ≤250ms, easeOut
- Border radius consistente: 16px (cards, inputs, modals)
- Sin scrollbar en mobile (`.no-scrollbar`)
- Animación `camino-breathe`: scale 1↔1.12, opacity 0.65↔1, 6s ease-in-out

---

## 10. CONFIGURACIÓN DE INFRAESTRUCTURA

### 10.1 Cloudflare Workers (wrangler.toml)
- **Name:** `camino-api`
- **Entry:** `src/worker/index.ts`
- **Compatibility:** `nodejs_compat`
- **Cron trigger:** `0 5 * * *` (generación diaria de contenido Gemini)
- **Queues Producer:** `CAMINO_QUEUE` binding → `camino-events`
- **Queues Consumer:** `camino-events`, batch size 100, timeout 30s, max retries 3, DLQ
- **Placement:** Smart (cerca de Supabase)
- **Variables públicas:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ENVIRONMENT`, `GEMINI_MODEL`
- **Env staging:** `camino-api-staging`, cola `camino-events-staging`

### 10.2 Variables de Entorno (`.env.example`)

**Obligatorias:**
- `DATABASE_URL` — PostgreSQL connection string (Transaction pooler puerto 6543)
- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Clave pública anónima
- `SUPABASE_SERVICE_ROLE_KEY` — Clave service role (solo servidor)

**Opcionales:**
- `GEMINI_API_KEY` — Para generación de contenido con IA
- `CRON_SECRET` — Secreto para el cron del Worker
- `WHATSAPP_*` — Integración con WhatsApp (moderadores)
- `CLOUDFLARE_*` / `R2_*` — Cloudflare R2 storage
- `NEXT_PUBLIC_APP_URL` — URL de la app

### 10.3 Drizzle Config (drizzle.config.json)
- Dialect: PostgreSQL
- Schema: `./src/db/schema.ts`
- DB URL from env: `${DATABASE_URL}`

---

## 11. TESTING

### 11.1 Configuración (vitest.config.ts)
- **Environment:** jsdom
- **Globals:** true
- **Setup:** `./tests/setup.ts` (`@testing-library/jest-dom`)
- **Alias:** `@` → `./src`
- **Plugin:** `@vitejs/plugin-react`

### 11.2 Scripts (package.json)
```
npm run dev              # next dev
npm run build            # next build
npm run test             # vitest (watch)
npm run test:run         # vitest run (single pass)
npm run test:unit        # tests/unit
npm run test:integration # tests/integration
npm run lint             # eslint
npm run typecheck        # tsc --noEmit
```

### 11.3 Tests Unitarios

| Archivo | Lo que prueba |
|---------|--------------|
| `tests/unit/rosario-engine.test.ts` | Motor de devociones: loadProgram, advanceStep, flattenProgram, getCurrentStep, isStepKind |
| `tests/unit/CommunityTreeSVG.test.tsx` | Árbol SVG: render sin participantes, hojas por participante, opacidad usuario actual, deterministicismo, contador |
| `tests/unit/RosaryCommunitySVG.test.tsx` | SVG comunidad: render sin usuarios, nodos correctos, límite 120, paleta sagrada |
| `tests/unit/usePrayerExperience.test.ts` | Hook oración: estado inicial, incremento con haptics, reset, progreso, toggle voz, onComplete |

### 11.4 Tests de Integración

| Archivo | Lo que prueba |
|---------|--------------|
| `tests/integration/rosario-realtime.test.ts` | Integración Realtime: estado inicial, suscripción al canal (Supabase mockeado) |

---

## 12. SISTEMA DE RECOMPENSAS (Gamificación Espiritual)

### 12.1 Virtudes
| Virtud | Recurso del Alma | Obtenida por |
|--------|-----------------|-------------|
| **FE** (seedsFaith) | Tallo del árbol | Completar la Jornada Diaria (+2) |
| **ESPERANZA** (seedsHope) | Hojas verdes | Momentos: Laudes, Ángelus (+1 c/u) |
| **CARIDAD** (seedsCharity) | Flores rosas | Compartir la Luz (+1) |
| **VELAS** (candlesLit) | Velas contadas | 100 Réquiem (+1) |

### 12.2 Racha Diaria (Streak)
- Se incrementa cuando `lastActiveDate !== today` al completar cualquier tarea
- Se actualiza en la misma query que otorga virtudes

### 12.3 Jardín del Alma (SoulGarden)
- Representación visual SVG del progreso espiritual
- Determinista por peregrino (seed = avatarSeed o id)
- Crece con las virtudes acumuladas (nunca decrece)

---

## 13. ROSARIO COMUNITARIO EN VIVO

### 13.1 Flujo General
1. **Usuario visita `/rosario`** → Ve programa de devoción cargado desde `prayer_programs`, misterio del día, muro de contemplación
2. **Usuario hace clic "Iniciar rosario en vivo"** → Redirige a `/rosario/en-vivo`
3. **Se conecta a Supabase Realtime** → Channel `rosario:{programId}` con presencia
4. **Envía heartbeat cada 25s** → POST `/api/rosario/heartbeat`
5. **Reza con el gesto de presión sostenida** → Long press ejecuta `assignRole` + broadcast de respuesta + haptics
6. **Worker Hono avanza los nodos** → Cron cada 10s, evalúa transiciones y asigna lectores para el nodo actual
7. **Modo contemplación** → Cuando `current_node_type = module` con `type = pause` o step de reflexión, se abre overlay con imagen R2, audio, chat comunitario
8. **Antibloqueo** → Si el lector asignado no responde en 6s, `reader_timeout_at` expira y el Worker asigna otro peregrino

### 13.2 Estados del Worker
- **Nodo actual:** El Worker consulta `current_node_id` y sus acciones (`advance`, `assign_leader`, `open_chat`, `play_audio`, etc.)
- **Timeout del lector:** Si el lector no responde en 6s, se libera y se asigna otro
- **Zombies:** Participantes sin heartbeat > 30s se eliminan
- **Recálculo:** Cada tick recalcula `totalParticipants` y `totalResponses`
- **Asignación:** El lector se asigna por orden de llegada (FIFO)

### 13.3 Supabase Realtime
- Tablas con Realtime habilitado: `rosary_sessions`, `rosary_participants`, `rosary_chat`, `prayer_programs`
- RLS policies: Lectura pública (SELECT true), escritura solo service_role
- Broadcast events: "prayer", "interlude", "node_advance", "chat", "response"
- El frontend escucha cambios en `rosary_sessions.current_node_id` para navegar el árbol JSON localmente

### 13.4 Experiencia Individual vs Comunitaria
- **Individual:** El motor ejecuta el árbol local en el frontend. El usuario avanza con long press o gesto natural. No depende de conectividad.
- **Comunitaria:** El Worker mantiene `current_node_id` sincronizado para todos. El usuario que entra se incorpora en el nodo actual del grupo (no desde cero). Roles y lectores se asignan automáticamente.

---

## 14. CONTENIDO DIARIO (Integración Gemini)

### 14.1 Flujo Actual (Sin Gemini)
1. `GET /api/daily-content` → `getOrCreateTodayContent()`
2. Si no existe fila para hoy → Se crea con datos semilla (Tiempo Ordinario, San Antonio de Padua, lecturas fijas)
3. Si ya existe → Se devuelve

### 14.2 Flujo Planeado (Con Gemini)
1. Cron de Cloudflare a las 05:00 UTC activa el Worker
2. Worker llama a Gemini con prompt litúrgico
3. Gemini genera: reflexión, oración, frase del día
4. Se guarda en `daily_content.aiReflection` y `daily_content.finalPrayer`
5. Se cachea en Cache API (`caches.open("camino-ai")`)
6. El frontend sirve el contenido cacheado

---

## 15. DEPENDENCIAS COMPLETAS

### Production
```
@supabase/supabase-js ^2.110.7   # Cliente Supabase (Realtime, Auth, DB)
dotenv 17.3.1                     # Variables de entorno
drizzle-orm 0.45.2                # ORM PostgreSQL
framer-motion ^12.42.2            # Animaciones React
next 16.2.6                       # Framework React full-stack
pg 8.20.0                         # Cliente PostgreSQL
react 19.2.6                      # UI
react-dom 19.2.6                  # Render DOM
```

### Development
```
@tailwindcss/postcss 4.1.17       # PostCSS plugin Tailwind v4
@testing-library/jest-dom ^6.9.1 # Matchers DOM para tests
@testing-library/react ^16.3.2   # Render React en tests
@testing-library/user-event ^14.6.1 # Eventos de usuario simulados
@types/node 22.19.15             # Tipos Node
@types/pg 8.18.0                 # Tipos pg
@types/react 19.2.14             # Tipos React
@types/react-dom 19.2.3          # Tipos ReactDOM
@vitejs/plugin-react ^6.0.3      # Plugin Vite para React
drizzle-kit 0.31.10              # CLI de Drizzle (migraciones)
eslint 9.39.4                    # Linter
eslint-config-next 16.2.6        # Config ESLint Next.js
jsdom ^29.1.1                    # DOM simulado para tests
postcss 8.5.8                    # Procesador CSS
tailwindcss 4.1.17               # Framework CSS utility-first
typescript 5.9.3                 # Tipado estático
vitest ^4.1.10                   # Testing unitario/integración
```

---

## 16. RESUMEN POR CAPA

| Capa | Archivos | Responsabilidad |
|------|----------|----------------|
| **Config** | 10 archivos raíz | TypeScript, Next.js, PostCSS, Vitest, Drizzle, Wrangler, ESLint, env |
| **Páginas** | 8 páginas en `src/app/` | Routing, layout, metadata PWA |
| **API** | 13 route handlers en `src/app/api/` | CRUD auth, contenido, tareas, novenas, métricas |
| **Componentes** | 14 componentes en `src/components/` | UI reutilizable, visualizaciones SVG, formularios |
| **Hooks** | 5 hooks en `src/hooks/` | Lógica de estado, Realtime, voz, auth, oración |
| **Lógica de negocio** | 9 archivos en `src/lib/` | DB, identidad, métricas, motor devociones, contenido diario |
| **DB** | 2 archivos en `src/db/` | Esquema Drizzle + pool de conexiones |
| **Tipos** | 1 archivo en `src/types/` | Declaraciones Web Speech API |
| **Tests** | 6 archivos en `tests/` | Unitarios + integración |
| **Worker** | 1 archivo planeado en `src/worker/` | Hono API para rosario en vivo |

---

## 17. NOTAS DE PRODUCCIÓN (del archivo instrucciones.md)

- **Supabase Gratuito:** 50k concurrentes Realtime, 500MB BD (~1000 usuarios simultáneos)
- **Cloudflare Workers Gratuito:** 100k requests/día (cron 10s consume ~8.6k/día)
- **R2 Gratuito:** 10GB storage + 10TB/mes bandwidth
- **Seguridad:** RLS policies restrictivas antes de exponer públicamente; secrets en `wrangler secret put` o variables de servidor; nunca comitear `.env.local`
- **Escalabilidad:** Si se superan límites → Supabase Pro ($25/mes), Workers Paid ($5/mes), migrar a D1
---

## 18. MÓDULO LA LLAMA Y JARDÍN DEL ALMA (IMPLEMENTADO)

### 18.1 Tablas e Inventario Espiritual
- **`intentions_wall`**: Registra intenciones de oración comunitarias ("velas"). Expiración a las 24 horas, soporte de apoyo entre peregrinos vía `supporters` (jsonb), e incremento de intensidad (1..5) por oración realizada.
- **`spiritual_inventory`**: Inventario único por peregrino con contadores por devoción (`seedsRosary`, `seedsMercy`, `seedsJose`, `seedsGuadalupe`, `seedsRequiem`, `seedsJourney`), gotas de agua (`waterDrops`) y racha de constancia.
- **Trigger `fn_expire_intention_to_seed`**: Transforma automáticamente intenciones expiradas no transformadas en semillas de Jornada.

### 18.2 Estado Global de La Llama
- **Store Zustand (`src/lib/llama/store.ts`)**: Persistente bajo la clave `camino.llama`.
- **Rutas API**:
  - `POST /api/llama/light`: Encender vela (validación 1..40 chars, saneado HTML, prevención de duplicados 409).
  - `GET /api/llama/current`: Obtener intención viva activa.
  - `POST /api/llama/join`: Unirse a la oración de un peregrino (idempotente, otorga 1 gota de agua e incrementa intensidad si aplica).
  - `GET /api/cron/sweep`: Helper/Endpoint de barrido para oraciones expiradas (`sweepExpiredIntentions`).

### 18.3 Muro Comunitario y Componentes UI
- **`IntentionModal`**: Modal accesible para ofrecer una intención.
- **`FloatingCandle`**: Vela flotante sutil en pantallas devocionales con popover de cuenta regresiva e indicador de intensidad.
- **`CommunityWall` (`/comunidad`)**: Muro minimalista con métricas del día (formateadas con `Intention.NumberFormat('es')`) y feed de intenciones activas.
- **Novenas (`/comunidad/novenas`)**: `DevotionsHub` preservado.

### 18.4 Jardín del Alma Extendido (`SoulGarden`)
- Canvas SVG 800×600 con posicionamiento determinista de hasta 6 especies de plantas (`rosal`, `margarita`, `lirio`, `nogal`, `higuera`, `olivo`) evolutivas por etapas (semilla 🌱, brote 🌿, flor 🌼, árbol 🌳).
- **Estaciones litúrgicas (`src/lib/garden/seasons.ts`)**: Algoritmo de Gauss para Pascua, Cuaresma, Adviento, Navidad y Tiempo Ordinario con fondos y partículas temáticas (nieve, pétalos).
- **Hidratación y Agua**: Filtro de deshidratación gradual cuando no hay agua y fuente SVG al acumular ≥10 gotas.
- **Fauna Sensible**: Pájaros y paloma en vuelo según la constancia de días de caminar (streak ≥30 / ≥100).
