'use client';
import { useState, useMemo } from 'react';
import { useProjects } from './hooks/useProjects';
import { ProjectCard } from './components/ProjectCard';
import { ProjectModal } from './components/ProjectModal';
import { Project, ProjectStatus } from './types';

const STATUS_ORDER: ProjectStatus[] = ['bloqueado', 'activo', 'completado', 'archivado'];

type FilterType = 'activos' | 'archivados';

export default function Dashboard() {
  const { projects, loaded, addProject, updateProject, archiveProject, deleteProject } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<FilterType>('activos');

  const visible = useMemo(() => {
    const filtered = projects.filter(p =>
      filter === 'archivados' ? p.status === 'archivado' : p.status !== 'archivado'
    );
    return [...filtered].sort(
      (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    );
  }, [projects, filter]);

  const counts = useMemo(() => ({
    activo: projects.filter(p => p.status === 'activo').length,
    bloqueado: projects.filter(p => p.status === 'bloqueado').length,
    completado: projects.filter(p => p.status === 'completado').length,
    archivado: projects.filter(p => p.status === 'archivado').length,
  }), [projects]);

  function openNew() {
    setEditingProject(null);
    setModalOpen(true);
  }

  function openEdit(p: Project) {
    setEditingProject(p);
    setModalOpen(true);
  }

  function handleSave(data: Omit<Project, 'id' | 'createdAt'>) {
    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addProject(data);
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mis Proyectos</h1>
            <p className="text-xs text-gray-400 mt-0.5">Dr. Javier Paz</p>
          </div>
          <button
            onClick={openNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-95"
          >
            + Nuevo
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Activos', count: counts.activo, color: 'text-emerald-600' },
            { label: 'Bloqueados', count: counts.bloqueado, color: 'text-red-500' },
            { label: 'Completados', count: counts.completado, color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['activos', 'archivados'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'activos'
                ? `Activos · ${projects.filter(p => p.status !== 'archivado').length}`
                : `Archivados · ${counts.archivado}`}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">📋</p>
            <p className="text-gray-500 text-sm">
              {filter === 'archivados'
                ? 'No hay proyectos archivados.'
                : 'Sin proyectos activos. Crea el primero.'}
            </p>
            {filter === 'activos' && (
              <button
                onClick={openNew}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                + Crear proyecto
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onEdit={openEdit}
                onArchive={archiveProject}
                onDelete={deleteProject}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <ProjectModal
          project={editingProject}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
