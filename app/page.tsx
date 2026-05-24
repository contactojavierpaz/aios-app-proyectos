'use client';
import { useState, useMemo } from 'react';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';
import { ProjectCard } from './components/ProjectCard';
import { ProjectModal } from './components/ProjectModal';
import { Project, ProjectStatus, getTaskUrgency, isDueToday } from './types';

const STATUS_ORDER: ProjectStatus[] = ['bloqueado', 'activo', 'completado', 'archivado'];
type FilterType = 'activos' | 'archivados';

export default function Dashboard() {
  const { projects, loaded: projectsLoaded, addProject, updateProject, archiveProject, deleteProject } = useProjects();
  const { allTasks, loaded: tasksLoaded, deleteTasksByProject } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<FilterType>('activos');
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined') return 'default';
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  const visible = useMemo(() => {
    const filtered = projects.filter(p =>
      filter === 'archivados' ? p.status === 'archivado' : p.status !== 'archivado'
    );
    return [...filtered].sort(
      (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    );
  }, [projects, filter]);

  const stats = useMemo(() => {
    const activeTasks = allTasks.filter(t => t.status !== 'completada');
    return {
      activos: projects.filter(p => p.status === 'activo').length,
      bloqueados: projects.filter(p => p.status === 'bloqueado').length,
      archivados: projects.filter(p => p.status === 'archivado').length,
      hoy: allTasks.filter(t => t.dueDate && isDueToday(t.dueDate) && t.status !== 'completada').length,
      vencidas: activeTasks.filter(t => getTaskUrgency(t) === 'overdue').length,
    };
  }, [projects, allTasks]);

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

  function handleDelete(id: string) {
    deleteProject(id);
    deleteTasksByProject(id);
  }

  async function requestNotifications() {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
  }

  if (!projectsLoaded || !tasksLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900">Mis Proyectos</h1>
            <p className="text-xs text-gray-400 mt-0.5">Dr. Javier Paz</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {notifStatus === 'default' && (
              <button
                onClick={requestNotifications}
                className="text-xs text-indigo-600 border border-indigo-200 rounded-xl px-3 py-1.5 hover:bg-indigo-50 transition-colors"
                title="Activar notificaciones"
              >
                Notificaciones
              </button>
            )}
            {notifStatus === 'granted' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Notificaciones activas" />
            )}
            <button
              onClick={openNew}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-95"
            >
              + Nuevo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Activos', count: stats.activos, color: 'text-emerald-600' },
            { label: 'Bloqueados', count: stats.bloqueados, color: 'text-red-500' },
            { label: 'Hoy', count: stats.hoy, color: 'text-indigo-600' },
            { label: 'Vencidas', count: stats.vencidas, color: stats.vencidas > 0 ? 'text-red-600' : 'text-gray-400' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['activos', 'archivados'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'activos'
                ? `Activos · ${projects.filter(p => p.status !== 'archivado').length}`
                : `Archivados · ${stats.archivados}`}
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
                tasks={allTasks.filter(t => t.projectId === p.id)}
                onEdit={openEdit}
                onArchive={archiveProject}
                onDelete={handleDelete}
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
