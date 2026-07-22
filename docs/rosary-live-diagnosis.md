# Diagnóstico: Rosario en vivo

## 1. Flujo actual de extremo a extremo (reconstruido)

1. Usuario entra a `/rosario/en-vivo`
2. `RosarioEnVivoPage` monta:
   - `useProgressiveAuth()` → carga perfil anónimo
   - `useRosarioSync()` → intenta conectar a Supabase Realtime canal `rosario:rosario-misterios-dolorosos`
   - Estados locales: `participants`, `currentStepIndex = 0`, `isConnected = false`
3. `useRosarioSync` intenta suscribirse:
   - Crea canal con presencia
   - Escucha broadcast `step`
   - Escucha presencia `sync`
   - Inicia `setInterval` heartbeat cada 25s hacia `/api/rosario/heartbeat` (endpoint inexistente)
4. Si el canal se suscribe, `isConnected = true` (dentro del hook)
5. `en-vivo/page.tsx` NUNCA actualiza su propio `isConnected` local con el valor del hook
6. El usuario mantiene presionado el botón en `LivePrayerScreen`
7. `usePrayerExperience` incrementa su contador local `count`
8. `LivePrayerScreen` renderiza `Math.floor(progress / 10)` basado en `count` local
9. Al llegar a `targetCount = 10`, `onComplete` llama `sendResponse`
10. `sendResponse` hace broadcast con `{ profileId, stepIndex: currentStepIndex }` usando el valor CLIENTE del hook
11. No hay servidor que valide, persista o transicione

## 2. Inventario de archivos y responsabilidades

| Archivo | Responsabilidad actual | Problema |
|---------|------------------------|----------|
| `src/app/rosario/en-vivo/page.tsx` | Página Live; estado local de step, participantes y conexión | Duplica header e indicador; `isConnected` local huérfano |
| `src/components/rosario/LivePrayerScreen.tsx` | Pantalla de oración; contador local de repeticiones | Duplica header e indicador; contador local sin autoridad |
| `src/components/rosario/LongPressButton.tsx` | Botón de gesto long-press | No está integrado en LivePrayerScreen; usa mouse/touch no pointer events |
| `src/hooks/useRosarioSync.ts` | Suscripción Realtime + broadcast + heartbeat | Endpoint heartbeat inexistente; `currentStepIndex` viene de broadcast sin validación |
| `src/hooks/usePrayerExperience.ts` | Contador local + reconocimiento de voz | Autoridad local del contador; puede superar 10 sin restricción |
| `src/components/rosario/CommunityTreeSVG.tsx` | SVG árbol comunitario | OK; renderiza desde `participants` prop |
| `src/components/rosario/InterludeOverlay.tsx` | Overlay Reflection | No integrado en el flujo actual |
| `src/components/rosario/IntentionInput.tsx` | Input de intenciones | No integrado en el flujo actual |
| `src/components/rosario/RosaryCommunitySVG.tsx` | SVG comunidad | No usado en en-vivo/page.tsx |
| `src/lib/devotions/engine.ts` | Motor puro de devociones (local) | No consumido por en-vivo |
| `src/lib/devotions/types.ts` | Tipos del motor | No usados en en-vivo |
| `src/lib/devotions/rosary.json` | Definición Rosario (lista plana) | No consumida por en-vivo |
| `src/lib/devotions/programs/rosary-misterios-dolorosos.json` | Definición Rosario (árbol) | No consumida por en-vivo |
| `src/worker/index.ts` | Worker Cloudflare | Vacío; solo `/health` |
| `src/lib/supabase.ts` | Cliente Supabase browser | OK |
| `src/app/api/` | API routes | No hay rutas de rosario |
| `src/db/schema.ts` | Esquema Drizzle | No hay tablas de rosario |

## 3. Causa raíz de cada síntoma

### Síntoma 1: Dos encabezados superpuestos de "ORACIÓN PERPETUA"

- **Archivos y líneas**:
  - `src/app/rosario/en-vivo/page.tsx:89-91`
  - `src/components/rosario/LivePrayerScreen.tsx:66-68`
- **Estado que lo produce**: Ambos componentes renderizan su propio `<p>Oración Perpetua</p>`.
- **Fuente de verdad actual**: No hay una única fuente; cada componente es autónomo.
- **Secuencia reproducible**: Montar la página → se montan ambos componentes → dos encabezados idénticos.
- **Causa raíz**: Separación de responsabilidades rota. `LivePrayerScreen` debería ser una proyección pura del estado, no un componente con layout propio que incluye encabezado.
- **Corrección estructural**: Solo `en-vivo/page.tsx` (o un layout superior) debe renderizar el encabezado. `LivePrayerScreen` solo renderiza el contenido oracional.

### Síntoma 2: Dos indicadores de "Paso 1 de 10"

- **Archivos y líneas**:
  - `src/app/rosario/en-vivo/page.tsx:96`
  - `src/components/rosario/LivePrayerScreen.tsx:70`
- **Estado que lo produce**: `currentStepIndex` local en page (inicializado en 0) y `currentStepIndex` del hook `useRosarioSync` (también inicializado en 0). La page pasa su valor al componente.
- **Fuente de verdad actual**: Dos fuentes independientes que casualmente coinciden en 0.
- **Secuencia reproducible**: Cargar la página → se ven dos "Paso 1 de 10".
- **Causa raíz**: `LivePrayerScreen` no es una proyección; incluye su propia lógica de presentación del paso. Además, el número 10 es hardcodeado en ambos lugares.
- **Corrección estructural**: Un solo indicador derivado del snapshot versionado. El snapshot debe contener `currentSectionIndex` / `currentStepInstanceIndex` y `totalSteps`.

### Síntoma 3: Estado detenido en "Reconectando…"

- **Archivos y líneas**:
  - `src/app/rosario/en-vivo/page.tsx:46, 99-103`
  - `src/hooks/useRosarioSync.ts:84-95`
- **Estado que lo produce**: `en-vivo/page.tsx` declara `const [isConnected, setIsConnected] = useState(false)` en línea 46. Este estado NUNCA es actualizado por `useRosarioSync`. El hook devuelve su propio `isConnected`, pero la page no lo usa. El valor local permanece en `false` para siempre.
- **Fuente de verdad actual**: Estado local huérfano en la página.
- **Secuencia reproducible**: Montar página → `isConnected` permanece `false` → texto "Reconectando..." permanente.
- **Causa raíz**: Estado duplicado no sincronizado. La page define su propio `isConnected` pero nunca lo conecta al hook.
- **Corrección estructural**: Eliminar el `isConnected` local de la página. Usar exclusivamente el valor del hook.

### Síntoma 4: "AVE MARÍA 18 de 10"

- **Archivos y líneas**:
  - `src/hooks/usePrayerExperience.ts:57,69-81,89`
  - `src/components/rosario/LivePrayerScreen.tsx:89`
- **Estado que lo produce**: `count` local en `usePrayerExperience`. `triggerPrayer` ejecuta `setCount(prev => prev + 1)`. El display muestra `Math.floor(progress / 10)` donde `progress = (count / targetCount) * 100`. Si `count` supera 10, el número supera 10.
- **Fuente de verdad actual**: Contador local de React, sin autoridad del servidor.
- **Secuencia reproducible**: Clickear el botón 11 veces (o usar reconocimiento de voz que auto-detecte "amén" múltiples veces) → aparece "11 de 10", "18 de 10", etc.
- **Causa raíz**: La UI es autoridad del contador de repeticiones. No existe snapshot versionado ni servidor que valide `repeatIteration <= repeatTotal`.
- **Corrección estructural**: El cliente nunca incrementa repeticiones. Renderiza `repeatIteration` y `repeatTotal` desde el snapshot. El contador local se elimina o queda solo para feedback visual de gesto (progreso circular), no para número de avemarías.

### Síntoma 5: SVG y contenido visible no derivados de única fuente de verdad

- **Archivos y líneas**:
  - `LivePrayerScreen.tsx`: `<circle strokeDasharray>` (línea 114) deriva de `progress` local.
  - `en-vivo/page.tsx`: paso, participantes y conexión vienen de tres estados distintos.
  - `useRosarioSync.ts`: `currentStepIndex` viene de broadcast.
- **Estado que lo produce**: Al menos tres fuentes distintas (contador local, broadcast de paso, estado local de page).
- **Fuente de verdad actual**: Fragmentada.
- **Corrección estructural**: Un solo snapshot versionado por sesión. La UI es función pura del snapshot: `UI = f(snapshot)`.

## 4. Suscripciones, timers y efectos activos

| Recurso | Ubicación | Descripción | Problema |
|---------|-----------|-------------|----------|
| `setInterval` heartbeat | `useRosarioSync.ts:98` | 25s hacia `/api/rosario/heartbeat` | Endpoint no existe; error silenciado |
| Realtime channel | `useRosarioSync.ts:63` | `supabase.channel('rosario:...')` | Presencia + broadcast | 
| `setInterval` intenciones | `LivePrayerScreen.tsx:47-57` | Cada 5s muta intenciones aleatorias | No relevante para el bug, pero es estado efímero no conectado |
| `SpeechRecognition` | `usePrayerExperience.ts:95-171` | Reconocimiento de voz continuo | Reinicia solo; puede disparar `triggerPrayer` múltiples veces |
| No hay efecto de Strict Mode | `useRosarioSync.ts` | No hay `useRef` para idempotencia de suscripción | En Strict Mode, `useEffect` se ejecuta dos veces → two channels |

## 5. Recorrido exacto JOIN a render

1. Usuario abre `/rosario/en-vivo`
2. `RosarioEnVivoPage` monta
3. `useProgressiveAuth` hace `fetch('/api/auth/session')` → perfil anónimo
4. `useRosarioSync` monta:
   - Crea canal Supabase
   - Registra listeners de presencia y broadcast
   - Hace `channel.track()` y `sendHeartbeat()`
   - `setInterval` heartbeat (falla porque `/api/rosario/heartbeat` no existe)
5. Página renderiza:
   - Header local "Oración Perpetua"
   - "Paso 1 de 10" local
   - Indicador "Reconectando..." local (siempre false)
   - `LivePrayerScreen` con su propio header, indicador y contador local
6. Usuario mantiene presionado botón
7. `triggerPrayer` incrementa `count` local
8. `LivePrayerScreen` muestra `Math.floor(count)` de 10
9. Si count > 10 → síntoma "18 de 10"
10. No hay paso del servidor que valide nada

## 6. Riesgos de concurrencia y reconexión

- **Eventos duplicados**: No hay idempotencia. El mismo `HOLD_END` puede procesarse múltiples veces.
- **Reconexión**: Al reconectar, el cliente pierde el contador local y el paso local, pero no hay `resync` a snapshot autoritativo.
- **Carrera**: Dos clientes pueden emitir `step` broadcast simultáneamente; no hay CAS ni versionado.
- **Strict Mode**: Doble susceptrición Realtime por React 19 Strict Mode.
- **Heartbeat fantasma**: El intervalo heartbeat envía peticiones a endpoint inexistente, generando errores 404 silenciados.

## 7. Qué partes pueden conservarse

- `src/lib/devotions/engine.ts` y `types.ts` (motor puro)
- `src/lib/devotions/rosary.json` y `programs/rosary-misterios-dolorosos.json`
- `src/components/rosario/CommunityTreeSVG.tsx`
- `src/components/rosario/RosaryCommunitySVG.tsx`
- Estructura de identidad progresiva (`useProgressiveAuth`, cookie `camino_device_id`)
- Cliente Supabase (`src/lib/supabase.ts`)
- Patrón Worker → Queue → Supabase para métricas

## 8. Qué partes deben reemplazarse

- `src/app/rosario/en-vivo/page.tsx` (reducir a layout + proyección única)
- `src/components/rosario/LivePrayerScreen.tsx` (eliminar header local, contador local y botón onClick; convertir en proyección)
- `src/hooks/useRosarioSync.ts` (reemplazar por protocolo de snapshot/eventos con resync)
- `src/hooks/usePrayerExperience.ts` (reducir a feedback visual de gesto; eliminar autoridad de conteo)
- Crear backend: tablas `rosary_sessions`, `rosary_participants`, `rosary_chat`, endpoint `/api/rosario/heartbeat`, lógica de leader/quórum en Worker
- Crear `PrayerEngine` puro (reducer determinista) y `CommunityEngine` puro