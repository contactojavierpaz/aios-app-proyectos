export type ProjectStatus = 'activo' | 'bloqueado' | 'completado' | 'archivado';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  nextStep: string;
  quickNote: string;
  createdAt: string;
  archivedAt?: string;
}
