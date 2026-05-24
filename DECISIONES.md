# DECISIONES DE ARQUITECTURA

## Stack: Next.js + Tailwind CSS + localStorage (sin backend)

**Razón:** App de un solo usuario. localStorage elimina infraestructura, auth y costo operativo. Punto de migración futuro: el hook `useProjects` y `useTasks` son el único punto de cambio para migrar a Vercel KV o Supabase.

---

## Estructura de datos: Proyectos + Tareas anidadas

**Decisión:** Dos colecciones en localStorage independientes:
- `aios-proyectos` — proyectos (id, name, status, description, createdAt)
- `aios-tareas` — todas las tareas (id, projectId, title, description, dueDate, status, notified30min, notifiedOverdue)

**Razón:** Mantener las colecciones separadas permite cargar tareas por proyecto sin cargar la estructura completa desde el proyecto. Joins se hacen en cliente con filter por `projectId`.

---

## Routing: `/` + `/projects/[id]`

**Decisión:** Dashboard en raíz, detalle de proyecto en ruta dinámica.

**Razón:** La navegación entre proyectos debe ser natural y compartible (URL directa a un proyecto). Usar Next.js App Router con `use(params)` de React 19 para desempaquetar el Promise de params en client components.

---

## Notificaciones: foreground vía ClientInit en layout

**Decisión:** El chequeo de notificaciones corre en `ClientInit` (layout), leyendo y escribiendo localStorage directamente (no via React state).

**Razón:** Evita el problema de sincronización de estado entre múltiples instancias del hook useTasks (dashboard vs detalle de proyecto). Las flags `notified30min` y `notifiedOverdue` se actualizan en localStorage sin pasar por React state.

**Trade-off aceptado:** Las notificaciones solo funcionan con la app abierta (no en background). En iOS Safari, las notificaciones push de background requieren APNs + backend, lo cual está fuera del scope de un MVP sin servidor.

---

## Ordenamiento de tareas en vista de proyecto

**Decisión:** Vencidas → Próximas → OK → Completadas. Dentro de cada grupo, orden ascendente por dueDate.

**Razón:** Lo urgente siempre primero. Las completadas van al final para no contaminar la vista de trabajo pendiente.

---

## Indicadores de urgencia: borde izquierdo de color

**Decisión:** Borde izquierdo rojo (vencida), amarillo (< 2h), verde (a tiempo), sin color extra para completadas.

**Razón:** El borde es el indicador más económico en espacio y más legible en móvil. 2 horas como umbral de "próxima" es clínicamente razonable para un cirujano con agenda comprimida.

---

## Migración de datos del MVP anterior

**Decisión:** Los campos `nextStep` y `quickNote` del MVP anterior quedan sin uso. No hay migración activa.

**Razón:** La app es de un solo usuario y el rediseño es conocido. Los datos viejos seguirán en localStorage pero serán ignorados. El campo `description` del nuevo esquema estará vacío en proyectos migrados.

---

## PWA: manifest + service worker mínimo

**Decisión:** SW solo cachea el shell para offline básico. No se implementa Web Push (requiere backend).

**Razón:** La instalabilidad como PWA en iPhone (Add to Home Screen) solo requiere manifest + SW básico. Los íconos SVG son suficientes para Chrome/Edge; iOS usa el SVG como apple-touch-icon (limitación conocida).

---

## Sin login / sin sincronización multi-dispositivo (reemplazado — ver debajo)

---

## Migración a Supabase (2026-05-23)

**Decisión:** Reemplazar localStorage por Supabase con tiempo real.

**Stack de persistencia:** `@supabase/supabase-js` v2 + Postgres en Supabase cloud. Sin auth (RLS abierta con `USING (true)`). Política pública explícita en lugar de deshabilitar RLS por completo, siguiendo las recomendaciones de Supabase.

**Modelo de datos en DB:**
- `projects` — id (text PK), name, status, description, created_at (timestamptz), archived_at (timestamptz nullable)
- `tasks` — id (text PK), project_id (FK → projects ON DELETE CASCADE), title, description, due_date (date), due_time (text "HH:MM"), status, created_at (timestamptz), notified_30min (boolean), notified_overdue (boolean)

**Por qué due_date + due_time separados:** Permite consultar tareas por fecha sin parsear ISO strings. Se almacena en hora local del usuario (no UTC) para que el ORDER BY date sea intuitivo.

**Mapeo app ↔ DB:** La app sigue usando `dueDate: string` como datetime local sin zona (`"2026-05-23T14:30"`). `splitDueDateTime()` y `combineDueDateTime()` en `useTasks.ts` manejan la conversión. `new Date("2026-05-23T14:30")` en JS es interpretado como hora local, por lo que las comparaciones de urgencia funcionan correctamente.

**Tiempo real:** Suscripciones `postgres_changes` en `useProjects` y `useTasks`. En cada evento refetch completo (no diff incremental) — aceptable para el volumen de datos de un usuario único.

**Optimistic updates:** Mutaciones actualizan el estado local inmediatamente antes de confirmar con Supabase. En caso de error del servidor, revierte con un refetch completo.

**Notificaciones:** `ClientInit.tsx` migrado a leer/escribir `notified_30min` / `notified_overdue` directamente en Supabase en lugar de localStorage. El polling de 60s persiste (sin cambios en la frecuencia).

**Variables de entorno necesarias:**
- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clave pública (anon)

**Setup requerido (una vez):** Ejecutar `supabase/setup.sql` en el SQL Editor de Supabase Dashboard.
