# ESTADO ACTUAL — aios-app-proyectos

**Fecha:** 2026-05-23  
**Estado:** MVP completo, desplegado en Vercel

## ¿Qué hace la app?

Dashboard web personal para gestionar proyectos activos. Permite:

- Ver todos los proyectos con estado visual (activo / bloqueado / completado)
- Agregar, editar y archivar proyectos
- Definir el próximo paso concreto por proyecto
- Agregar notas rápidas de contexto
- Filtrar entre proyectos activos y archivados
- Diseño mobile-first

## Stack

- **Framework:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS
- **Datos:** localStorage (sin backend)
- **Deploy:** Vercel

## Estructura

```
app/
├── page.tsx              # Dashboard principal
├── types.ts              # Tipos TypeScript
├── hooks/
│   └── useProjects.ts    # Estado + persistencia en localStorage
└── components/
    ├── ProjectCard.tsx   # Tarjeta de proyecto
    ├── ProjectModal.tsx  # Modal agregar/editar
    └── StatusBadge.tsx   # Badge de estado
```

## Próximos pasos sugeridos (post-MVP)

- [ ] Sincronización entre dispositivos (Vercel KV o Supabase)
- [ ] Fechas de vencimiento / recordatorios
- [ ] Exportar resumen como PDF o email semanal
