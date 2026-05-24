'use client';
import { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { supabase } from '../lib/supabase';

type DbProject = {
  id: string;
  name: string;
  status: string;
  description: string;
  created_at: string;
  archived_at: string | null;
};

function toProject(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    status: row.status as ProjectStatus,
    description: row.description,
    createdAt: row.created_at,
    archivedAt: row.archived_at ?? undefined,
  };
}

async function fetchAll(): Promise<Project[]> {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []).map(toProject);
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll().then(data => {
      setProjects(data);
      setLoaded(true);
    }).catch(err => {
      setError(err.message);
      setLoaded(true);
    });

    const channel = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchAll().then(setProjects).catch(() => {});
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function addProject(data: Omit<Project, 'id' | 'createdAt'>) {
    const project: Project = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [project, ...prev]);
    const { error: err } = await supabase.from('projects').insert({
      id: project.id,
      name: project.name,
      status: project.status,
      description: project.description,
      created_at: project.createdAt,
      archived_at: project.archivedAt ?? null,
    });
    if (err) {
      setError(err.message);
      setProjects(prev => prev.filter(p => p.id !== project.id));
    }
    return project;
  }

  async function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
    const updates: Partial<DbProject> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.status !== undefined) updates.status = data.status;
    if (data.description !== undefined) updates.description = data.description;
    if (data.archivedAt !== undefined) updates.archived_at = data.archivedAt ?? null;
    const { error: err } = await supabase.from('projects').update(updates).eq('id', id);
    if (err) {
      setError(err.message);
      fetchAll().then(setProjects).catch(() => {});
    }
  }

  async function archiveProject(id: string) {
    const archivedAt = new Date().toISOString();
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'archivado' as ProjectStatus, archivedAt } : p))
    );
    const { error: err } = await supabase
      .from('projects')
      .update({ status: 'archivado', archived_at: archivedAt })
      .eq('id', id);
    if (err) {
      setError(err.message);
      fetchAll().then(setProjects).catch(() => {});
    }
  }

  async function deleteProject(id: string) {
    setProjects(prev => prev.filter(p => p.id !== id));
    const { error: err } = await supabase.from('projects').delete().eq('id', id);
    if (err) {
      setError(err.message);
      fetchAll().then(setProjects).catch(() => {});
    }
  }

  function getProject(id: string) {
    return projects.find(p => p.id === id) ?? null;
  }

  return { projects, loaded, error, addProject, updateProject, archiveProject, deleteProject, getProject };
}
