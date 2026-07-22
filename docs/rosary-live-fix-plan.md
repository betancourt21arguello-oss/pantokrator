# Plan de corrección: Rosario en vivo

## Orden de cambios por archivo

| # | Archivo | Cambio mínimo | Motivo | Riesgo | Test asociado | Reversión |
|---|---------|--------------|--------|--------|---------------|-----------|
| 1 | `tests/integration/rosario-realtime.test.ts` | Añadir tests de regresión: conexión state, step event, heartbeat 404, Strict Mode | Antes de tocar código, demostrar fallos | Bajo | N/A (son los tests nuevos) | Eliminar archivo |
| 2 | `src/hooks/useRosarioSync.ts` | Eliminar estado local `currentStepIndex` del hook; dejar que el snapshot sea la fuente de verdad. Añadir resync. Sincronizar `isConnected` con page. | Hook es fuente de paso broadcast sin validación | Medio | Test: resync descarta estado local; broadcast actualiza snapshot | Revertir git |
| 3 | `src/app/rosario/en-vivo/page.tsx` | Eliminar `currentStepIndex`, `participants` y `isConnected` locales. Consumir snapshot único desde hook. Eliminar header/indicador duplicado. | Página mezcla layout y estado | Bajo | Test: un solo "Paso X de 10" visible | Revertir |
| 4 | `src/hooks/usePrayerExperience.ts` | Eliminar `count` como autoridad de repeticiones. Convertir en hook puro de feedback visual del gesto (`progress` solo para animación circular). | Hook autoritario de conteo | Medio | Test: count local no puede exceder repeatTotal | Revertir |
| 5 | `src/components/rosario/LivePrayerScreen.tsx` | Eliminar header interno. Recibir `snapshot` o `{ repeatIteration, repeatTotal, stepTitle, stepType, isResponding }` como props. Eliminar botón onClick; usar `LongPressButton` con eventos de intención (no optimistas). | Componente duplica layout y tiene autoridad local | Medio | Test: render único desde snapshot; no hay "18 de 10" | Revertir |
| 6 | `src/components/rosario/LongPressButton.tsx` | Cambiar a eventos `pointerdown/pointerup/pointercancel`. Añadir `onHoldEnd` como intención (no como evento directo al servidor). Cumplir accesibilidad (teclado). | Gestos deben emitir intención, no mutar estado | Bajo | Test: pointer events + keyboard | Revertir |
| 7 | `src/app/api/rosario/heartbeat/route.ts` | Implementar endpoint POST que actualize `last_heartbeat_at`. | Endpoint faltante | Bajo | Test: heartbeat actualiza timestamp | Eliminar archivo |
| 8 | `src/app/api/rosario/snapshot/route.ts` | Implementar GET que devuelva snapshot actual por `programId`. | Resync necesario | Bajo | Test: snapshot completo en reconexión | Eliminar archivo |
| 9 | `src/app/api/rosario/transition/route.ts` | Implementar POST con idempotencia (`eventId`), CAS (`sessionVersion`) y guarda (`stepInstanceId`). Llamar a `atomicTransition`. | Autoridad servidor | Alto | Test: CAS rechaza versiones antiguas; idempotencia previene doble avance | Revertir |
| 10 | `src/db/schema.ts` | Añadir tablas `rosary_sessions`, `rosary_participants`, `rosary_chat`. Migración reversible. | Esquema faltante | Alto | Test: schema válido; migración up/down | Revertir migración |
| 11 | `src/worker/index.ts` | Añadir rutas Hono para rosario: `/rosario/snapshot`, `/rosario/heartbeat`, `/rosario/transition`. Orquestar `atomicTransition`. | Backend vacío | Alto | Test: Worker maneja 100 requests concurrentes | Revertir commit |
| 12 | `src/lib/devotions/engine.ts` (o nuevo `src/lib/rosary/engine.ts`) | Extraer/crear `PrayerEngine` puro con `reduce(snapshot, event)` determinista. Usar JSON existente como definición. | Motor orquestral central | Medio | Test: ejecución completa Rosario sin condicionales | Revertir |
| 13 | `src/lib/devotions/types.ts` | Añadir `RosarySnapshot`, `TransitionRequest`, `StepInstance`, `RosaryParticipant`. | Tipos faltantes | Bajo | Test: tipos compilan | Revertir |
| 14 | `src/hooks/useRosarioSync.ts` (segunda fase) | Sustituir broadcast propio por protocolo snapshot/transition: suscripción a `session:<id>` y polling/refresh del snapshot. | Protocolo actual es broadcast sin garantías | Alto | Test: 1, 2, 100 participantes; reconexión resync | Revertir |
| 15 | Integración: Reflection + Chat | Al recibir `phase=reflection` en snapshot, montar `InterludeOverlay`; al salir, desmontar listeners/audio. Chat solo existe en this phase. | Frontera Reflection/Chat no implementada | Medio | Test: chat inexistente fuera de reflection | Revertir overlay |

## Prerrequisitos antes de implementar

1. Base de datos Supabase desplegada con tablas nuevas (migración).
2. Worker Cloudflare actualizado y accesible.
3. Variables de entorno: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
4. Entorno de staging válido para pruebas de integración.

## Divide en PRs pequeños

### PR 1: Tests de regresión (1-2 días)
- Añadir `tests/integration/rosario-realtime.test.ts` casos de:
  - `isConnected` huérfano
  - Doble header detectado
  - `usePrayerExperience` count supera 10
  - Strict Mode duplica canal
  - Broadcast sin validación avanza stepIndex

### PR 2: Tipos y definición (2-3 días)
- Tipos en `src/lib/devotions/types.ts`
- Usar JSON existente como definición canónica
- Validación runtime simple (schema check)

### PR 3: Reducer puro PrayerEngine (3-4 días)
- `src/lib/rosary/engine.ts` con `reduce(snapshot, event)`
- Tests unitarios: 1, 2, 100 participantes; repeat exactamente 10
- Ninguna dependencia de React/Supabase/Hono

### PR 4: Autoridad servidor (4-5 días)
- Migración tablas `rosary_*`
- Worker rutas `/rosario/snapshot` y `/rosario/heartbeat`
- `atomicTransition` con idempotencia y CAS

### PR 5: CommunityEngine y presencia (3-4 días)
- Lógica leader round-robin
- Heartbeat fresco (30s)
- Reasignación leader en 5s
- Limpieza participantes al salir

### PR 6: Protocolo Realtime y resync (2-3 días)
- Cliente suscribe a `session:<id>`
- Al reconectar, GET snapshot completo
- Sustituir broadcast `step` por snapshot versionado

### PR 7: Adaptación hooks/store cliente (2-3 días)
- `useRosarioSync` consume snapshot
- `usePrayerExperience` se reduce a feedback visual
- Página y componentes consumen props derivados de snapshot único

### PR 8: UI como proyección del snapshot (1-2 días)
- Eliminar headers duplicados
- Eliminar contadores locales
- Un solo indicador de paso derivado de snapshot
- Reemplazar botón onClick por LongPress con emisión de intención

### PR 9: Limpieza duplicados visuales (1 día)
- `CommunityTreeSVG` vs `RosaryCommunitySVG` unificar uso
- Eliminar intenciones aleatorias sin conexión al flujo (hasta Reflection)

### PR 10: Pruebas integrales y observabilidad (2-3 días)
- Tests: 1, 2, 100 participantes simulados
- React Strict Mode no duplica suscriptores
- Desmontaje limpio (channel, heartbeat, listeners)
- Logs estructurados en Worker para auditoría

## Resumen de decisiones que necesitan aprobación

1. **¿Mover el motor existente `src/lib/devotions/engine.ts` a `src/lib/rosary/engine.ts`** o extenderlo in-place?  
   Recomendado: extenderlo manteniendo compatibilidad, dado que `tests/unit/rosario-engine.test.ts` ya depende de su API pública.

2. **¿Crear tablas nuevas (`rosary_sessions`, `rosary_participants`, `rosary_chat`) o reutilizar tablas existentes?**  
   Recomendado: tablas nuevas para separar el dominio del Rosario en vivo de `spiritual_tasks` y `daily_content`.

3. **¿Protocolo Realtime vía broadcast propio o suscripción a tabla Realtime de Supabase?**  
   Recomendado: broadcast propio sobre canal `session:<id>` para baja latencia, con resync HTTP como fallback.

4. **¿LongPressButton acceso por teclado (focus + space/enter) ahora o después?**  
   Requerido: debe implementarse en PR 8 para accesibilidad básica.

5. **¿Reflection con chat y notas de voz en este fix o posponer?**  
   Frontera: diseñar pero implementar chat/audio solo después de tener el flujo funcional.

## Archivos propuestos cambiar

- `src/app/rosario/en-vivo/page.tsx`
- `src/components/rosario/LivePrayerScreen.tsx`
- `src/components/rosario/LongPressButton.tsx`
- `src/components/rosario/CommunityTreeSVG.tsx` (posible limpieza)
- `src/hooks/useRosarioSync.ts`
- `src/hooks/usePrayerExperience.ts`
- `src/worker/index.ts`
- `src/db/schema.ts`
- `src/lib/devotions/engine.ts` (extensión)
- `src/lib/devotions/types.ts` (extensión)
- Nuevo: `src/lib/rosary/engine.ts` (si se separa)
- Nuevo: `src/app/api/rosario/heartbeat/route.ts`
- Nuevo: `src/app/api/rosario/snapshot/route.ts`
- Nuevo: `src/app/api/rosario/transition/route.ts`
- Nuevo: `supabase/migrations/YYYYMMDD_add_rosary_tables.sql`

## Riesgos de migración

1. **Tabla nueva requiere migración en staging primero**: revertible, pero downtime si se rompe el Worker.
2. **React Strict Mode**: sin `useRef` para idempotencia de suscripción, doble canal en desarrollo.
3. **Endpoints nuevos no existen**: el heartbeat actual falla silenciosamente; al crear el endpoint, el intervalo comenzará a funcionar y puede generar carga inesperada si no se limita.
4. **Protocolo broadcast actual no tiene resync**: al cambiar a snapshot+transition, clientes en vivo podrían desconectarse momentáneamente.
5. **Supabase Realtime no garantiza orden estricto**: necesitamos `eventId` + `sessionVersion` para ordenar en el Worker.

## Preguntas bloqueantes reales

1. ¿Existe ya el proyecto Supabase desplegado con tablas actuales? Necesitamos confirmar el entorno para generar y aplicar la migración.
2. ¿El Worker actual (`src/worker/index.ts`) se despliega independientemente o forma parte de un monorepo? Necesitamos el flujo de CI/CD para agregar rutas de rosario.
3. ¿El endpoint `/api/rosario/heartbeat` debe ser público (sin auth) o requiere cookie `camino_device_id`? Actualmente el código envía `profileId` y `displayName` sin autenticación adicional.
4. ¿Cuál es el límite real de participantes simultáneos esperado? Actualmente no hay límite en el código, y 100 participantes simulados es parte del target.
5. ¿Debe el Rosario Mundial iniciarse automáticamente (cron) o solo cuando un participante hace JOIN y no hay sesión activa?
