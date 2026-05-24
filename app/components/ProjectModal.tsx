'use client';
import { useEffect, useState } from 'react';
import { Project, ProjectStatus } from '../types';

interface Props {
  project?: Project | null;
  onSave: (data: Omit<Project, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'bloqueado', label: 'Bloqueado' },
  { value: 'completado', label: 'Completado' },
];

export function ProjectModal({ project, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('activo');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setStatus(project.status === 'archivado' ? 'activo' : project.status);
      setDescription(project.description ?? '');
    } else {
      setName('');
      setStatus('activo');
      setDescription('');
    }
  }, [project]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), status, description: description.trim() });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {project ? 'Editar proyecto' : 'Nuevo proyecto'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej. Clínica satélite, Paper AANS..."
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    status === s.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Área de vida, objetivo, contexto..."
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              {project ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
