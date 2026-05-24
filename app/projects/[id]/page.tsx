'use client';
import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { TaskCard } from '../../components/TaskCard';
import { TaskModal } from '../../components/TaskModal';
import { ProjectModal } from '../../components/ProjectModal';
import { StatusBadge } from '../../components/StatusBadge';
import { Task, TaskStatus, Project, getTaskUrgency } from '../../types';

function sortTasks(tasks: Task[]): Task[] {
  const urgencyOrder: Record<string, number> = { overdue: 0, soon: 1, ok: 2 };
  const active = tasks
    .filter(t => t.status !== 'completada')
    .sort((a, b) => {
      const ua = urgencyOrder[getTaskUrgency(a)];
      const ub = urgencyOrder[getTaskUrgency(b)];
      if (ua !== ub) return ua - ub;
      if (a.dueDate && b.dueDate)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  const done = tasks
    .filter(t => t.status === 'completada')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return [...active, ...done];
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { projects, loaded: pLoaded, updateProject } = useProjects();
  const { tasks, loaded: tLoaded, addTask, updateTask, deleteTask } = useTasks(id);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const project = projects.find(p => p.id === id) ?? null;
  const sorted = useMemo(() => sortTasks(tasks), [tasks]);

  const taskStats = useMemo(() => ({
    pendiente: tasks.filter(t => t.status === 'pendiente').length,
    en_progreso: tasks.filter(t => t.status === 'en_progreso').length,
    completada: tasks.filter(t => t.status === 'completada').length,
    overdue: tasks.filter(t => getTaskUrgency(t) === 'overdue').length,
  }), [tasks]);

  function openNewTask() {
    setEditingTask(null);
    setTaskModalOpen(true);
  }

  function openEditTask(t: Task) {
    setEditingTask(t);
    setTaskModalOpen(true);
  }

  function handleSaveTask(data: Omit<Task, 'id' | 'createdAt'>) {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
  }

  function handleStatusChange(taskId: string, status: TaskStatus) {
    updateTask(taskId, { status });
  }

  function handleSaveProject(data: Omit<Project, 'id' | 'createdAt'>) {
    updateProject(id, data);
  }

  if (!pLoaded || !tLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-500">Proyecto no encontrado.</p>
        <button onClick={() => router.push('/')} className="text-indigo-600 text-sm font-medium hover:underline">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1 -ml-1"
              aria-label="Volver"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{project.name}</h1>
            </div>
            <StatusBadge status={project.status} />
            <button
              onClick={() => setProjectModalOpen(true)}
              className="text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors shrink-0"
            >
              Editar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {project.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
        )}

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Pendientes', count: taskStats.pendiente, color: 'text-gray-700' },
            { label: 'En progreso', count: taskStats.en_progreso, color: 'text-indigo-600' },
            { label: 'Completadas', count: taskStats.completada, color: 'text-emerald-600' },
            {
              label: 'Vencidas',
              count: taskStats.overdue,
              color: taskStats.overdue > 0 ? 'text-red-600' : 'text-gray-400',
            },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={openNewTask}
          className="w-full bg-indigo-600 text-white rounded-2xl py-3 text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-95"
        >
          + Nueva tarea
        </button>

        {sorted.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-3xl">✅</p>
            <p className="text-gray-500 text-sm">Sin tareas todavía. Agrega la primera.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(t => (
              <TaskCard
                key={t.id}
                task={t}
                onEdit={openEditTask}
                onDelete={deleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {taskModalOpen && (
        <TaskModal
          task={editingTask}
          projectId={id}
          onSave={handleSaveTask}
          onClose={() => setTaskModalOpen(false)}
        />
      )}

      {projectModalOpen && (
        <ProjectModal
          project={project}
          onSave={handleSaveProject}
          onClose={() => setProjectModalOpen(false)}
        />
      )}
    </div>
  );
}
