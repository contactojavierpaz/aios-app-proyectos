'use client';
import Link from 'next/link';
import { Project, Task, getTaskUrgency } from '../types';
import { StatusBadge } from './StatusBadge';

interface Props {
  project: Project;
  tasks: Task[];
  onEdit: (p: Project) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, tasks, onEdit, onArchive, onDelete }: Props) {
  const pending = tasks.filter(t => t.status !== 'completada');
  const overdue = pending.filter(t => getTaskUrgency(t) === 'overdue');
  const soon = pending.filter(t => getTaskUrgency(t) === 'soon');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/projects/${project.id}`} className="group flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-indigo-600 transition-colors">
            {project.name}
          </h3>
        </Link>
        <StatusBadge status={project.status} />
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 leading-relaxed">{project.description}</p>
      )}

      <div className="flex items-center gap-3">
        {overdue.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            {overdue.length} vencida{overdue.length !== 1 ? 's' : ''}
          </span>
        )}
        {soon.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
            {soon.length} próxima{soon.length !== 1 ? 's' : ''}
          </span>
        )}
        {tasks.length > 0 && (
          <span className="text-xs text-gray-400">
            {tasks.filter(t => t.status === 'completada').length}/{tasks.length} completadas
          </span>
        )}
        {tasks.length === 0 && (
          <span className="text-xs text-gray-400">Sin tareas</span>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Link
          href={`/projects/${project.id}`}
          className="flex-1 text-center text-sm text-indigo-600 border border-indigo-200 rounded-xl py-1.5 hover:bg-indigo-50 transition-colors font-medium"
        >
          Ver tareas
        </Link>
        <button
          onClick={() => onEdit(project)}
          className="text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          Editar
        </button>
        {project.status !== 'archivado' && (
          <button
            onClick={() => onArchive(project.id)}
            className="text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            Archivar
          </button>
        )}
        <button
          onClick={() => {
            if (confirm(`¿Eliminar "${project.name}" y todas sus tareas?`))
              onDelete(project.id);
          }}
          className="text-sm text-red-500 border border-red-100 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
