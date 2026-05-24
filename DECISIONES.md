# DECISIONES DE ARQUITECTURA

## Stack elegido: Next.js 14 + Tailwind CSS + localStorage

**Decisión:** App puramente cliente (sin backend ni base de datos).

**Razón:** MVP de un solo usuario. localStorage es suficiente, elimina toda la infraestructura (DB, API, auth), y permite deploy instantáneo en Vercel sin variables de entorno ni configuración extra.

**Trade-off aceptado:** Los datos viven en el navegador de la misma máquina. Si en el futuro se necesita sincronización entre dispositivos, se migra a Supabase o Vercel KV con mínimo refactor (el hook `useProjects` es el único punto de cambio).

---

## Orden de proyectos: bloqueado → activo → completado → archivado

**Razón:** Los proyectos bloqueados requieren atención inmediata; el dashboard debe mostrarlos primero.

---

## Sin login

**Razón:** Usuario único confirmado. Agregar auth en esta etapa sería puro overhead sin valor.

---

## Campos del proyecto: nombre, estado, próximo paso, nota rápida

**Razón:** Mínimo viable para tomar decisiones en 30 segundos. No se agregaron fechas de vencimiento ni prioridades numéricas para no añadir fricción al ingreso de datos.
