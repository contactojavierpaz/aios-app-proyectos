export type ProjectStatus = 'activo' | 'bloqueado' | 'completado' | 'archivado';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';
export type TaskUrgency = 'ok' | 'soon' | 'overdue';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  description: string;
  createdAt: string;
  archivedAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  notified30min?: boolean;
  notifiedOverdue?: boolean;
}

export function getTaskUrgency(task: Pick<Task, 'status' | 'dueDate'>): TaskUrgency {
  if (task.status === 'completada' || !task.dueDate) return 'ok';
  const diff = new Date(task.dueDate).getTime() - Date.now();
  if (diff < 0) return 'overdue';
  if (diff < 2 * 60 * 60 * 1000) return 'soon';
  return 'ok';
}

export function isDueToday(dueDate: string): boolean {
  const due = new Date(dueDate);
  const today = new Date();
  return (
    due.getDate() === today.getDate() &&
    due.getMonth() === today.getMonth() &&
    due.getFullYear() === today.getFullYear()
  );
}
