import { ProjectStatus } from '../types';

const config: Record<ProjectStatus, { label: string; className: string }> = {
  activo: { label: 'Activo', className: 'bg-emerald-100 text-emerald-800' },
  bloqueado: { label: 'Bloqueado', className: 'bg-red-100 text-red-800' },
  completado: { label: 'Completado', className: 'bg-blue-100 text-blue-800' },
  archivado: { label: 'Archivado', className: 'bg-gray-100 text-gray-500' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
