# ESTADO ACTUAL — aios-app

**Fecha:** 2026-05-23  
**Estado:** v2 completa — proyectos + tareas anidadas + notificaciones + PWA

---

## ¿Qué hace la app?

Sistema de gestión personal con dos niveles: **proyectos** como contenedores y **tareas** con fecha/hora de vencimiento dentro de cada proyecto.

### Dashboard (`/`)
- Resumen: activos / bloqueados / tareas que vencen hoy / tareas vencidas
- Lista de proyectos con mini-indicadores de urgencia por proyecto (vencidas en rojo, próximas en amarillo)
- Filtro activos / archivados
- Botón "Activar notificaciones" si no han sido autorizadas

### Vista de proyecto (`/projects/[id]`)
- Stats del proyecto: pendientes / en progreso / completadas / vencidas
- Lista de tareas ordenada por urgencia (vencidas primero, luego próximas, luego a tiempo, completadas al final)
- Indicador visual por borde izquierdo: rojo (vencida), amarillo (< 2h), verde (a tiempo)
- CRUD completo de tareas con título, descripción, fecha+hora de vencimiento y estado
- Marcado rápido de tarea completada con un toque

### Notificaciones
- Notifica cuando una tarea vence en ≤ 30 minutos
- Notifica cuando una tarea ya venció y sigue pendiente
- Flags `notified30min` / `notifiedOverdue` persisten en localStorage para no repetir
- Solo funciona con la app abierta (sin backend para Web Push)

### PWA
- Instalable desde Safari/Chrome ("Agregar a pantalla de inicio")
- `manifest.json` + service worker básico
- Ícono SVG para pantalla de inicio

---

## Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Estilos:** Tailwind CSS v4
- **Datos:** localStorage (sin backend)
- **Deploy:** Vercel

---

## Estructura de archivos

```
app/
├── layout.tsx                    # PWA meta + ClientInit (SW + notificaciones)
├── page.tsx                      # Dashboard
├── globals.css
├── types.ts                      # Project, Task, getTaskUrgency, isDueToday
├── hooks/
│   ├── useProjects.ts            # CRUD proyectos → localStorage
│   └── useTasks.ts               # CRUD tareas → localStorage (filtrable por projectId)
├── components/
│   ├── ClientInit.tsx            # Registro SW + loop de notificaciones
│   ├── ProjectCard.tsx           # Card con mini-stats de tareas
│   ├── ProjectModal.tsx          # Modal crear/editar proyecto
│   ├── TaskCard.tsx              # Card con borde de urgencia + check rápido
│   ├── TaskModal.tsx             # Modal crear/editar tarea con datetime-local
│   └── StatusBadge.tsx           # Badge de estado de proyecto
└── projects/
    └── [id]/
        └── page.tsx              # Vista detalle de proyecto + tareas

public/
├── manifest.json                 # PWA manifest
├── sw.js                         # Service worker mínimo
└── icon.svg                      # Ícono PWA
```

---

## Datos en localStorage

| Clave | Contenido |
|-------|-----------|
| `aios-proyectos` | `Project[]` — proyectos |
| `aios-tareas` | `Task[]` — todas las tareas de todos los proyectos |

---

## Próximos pasos sugeridos

- [ ] Sincronización entre dispositivos (Vercel KV / Supabase)
- [ ] Vista de agenda: todas las tareas del día en una sola vista cronológica
- [ ] Exportar resumen semanal (PDF o email)
- [ ] Filtros por área de vida (etiquetas en proyectos)
