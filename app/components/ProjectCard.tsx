'use client';
import { Project } from '../types';
import { StatusBadge } from './StatusBadge';

interface Props {
  project: Project;
  onEdit: (p: Project) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onArchive, onDelete }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-base leading-tight">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>

      {project.nextStep && (
        <div className="flex items-start gap-2">
          <span className="text-indigo-500 mt-0.5 shrink-0">→</span>
          <p className="text-sm text-gray-700">{project.nextStep}</p>
        </div>
      )}

      {project.quickNote && (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
          {project.quickNote}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEdit(project)}
          className="flex-1 text-sm text-indigo-600 border border-indigo-200 rounded-xl py-1.5 hover:bg-indigo-50 transition-colors font-medium"
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
            if (confirm(`¿Eliminar "${project.name}"?`)) onDelete(project.id);
          }}
          className="text-sm text-red-500 border border-red-100 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
