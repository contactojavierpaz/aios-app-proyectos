'use client';
import { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';

const STORAGE_KEY = 'aios-proyectos';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProjects(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects, loaded]);

  function addProject(data: Omit<Project, 'id' | 'createdAt'>) {
    const project: Project = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [project, ...prev]);
    return project;
  }

  function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
  }

  function archiveProject(id: string) {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, status: 'archivado' as ProjectStatus, archivedAt: new Date().toISOString() }
          : p
      )
    );
  }

  function deleteProject(id: string) {
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  function getProject(id: string) {
    return projects.find(p => p.id === id) ?? null;
  }

  return { projects, loaded, addProject, updateProject, archiveProject, deleteProject, getProject };
}
