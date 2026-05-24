'use client';
import { Task, TaskStatus, getTaskUrgency } from '../types';

interface Props {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const BORDER: Record<string, string> = {
  ok: 'border-l-emerald-400',
  soon: 'border-l-yellow-400',
  overdue: 'border-l-red-500',
};

function formatDue(dueDate: string): string {
  return new Date(dueDate).toLocaleString('es-MX', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const urgency = getTaskUrgency(task);
  const isDone = task.status === 'completada';

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${BORDER[urgency]} p-4 space-y-2 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() =>
              onStatusChange(task.id, isDone ? 'pendiente' : 'completada')
            }
            className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
              isDone
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-gray-300 hover:border-emerald-400'
            }`}
            aria-label={isDone ? 'Marcar pendiente' : 'Marcar completada'}
          >
            {isDone && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <p
            className={`font-medium text-sm leading-snug ${
              isDone ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
          >
            {task.title}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Editar tarea"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (confirm(`¿Eliminar "${task.title}"?`)) onDelete(task.id);
            }}
            className="p-1 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Eliminar tarea"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 pl-7 leading-relaxed">{task.description}</p>
      )}

      {task.dueDate && (
        <div className="flex items-center gap-1.5 pl-7">
          <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span
            className={`text-xs font-medium ${
              urgency === 'overdue'
                ? 'text-red-600'
                : urgency === 'soon'
                ? 'text-yellow-600'
                : 'text-gray-500'
            }`}
          >
            {formatDue(task.dueDate)}
            {urgency === 'overdue' && ' · VENCIDA'}
            {urgency === 'soon' && ' · Próxima'}
          </span>
        </div>
      )}

      {task.status === 'en_progreso' && (
        <div className="pl-7">
          <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5 font-medium">
            En progreso
          </span>
        </div>
      )}
    </div>
  );
}
