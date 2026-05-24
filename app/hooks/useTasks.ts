'use client';
import { useState, useEffect } from 'react';
import { Task } from '../types';
import { supabase } from '../lib/supabase';

type DbTask = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string | null;
  due_time: string | null;
  status: string;
  created_at: string;
  notified_30min: boolean;
  notified_overdue: boolean;
};

// DB stores local date ("2026-05-23") + local time ("14:30").
// App uses a local datetime string ("2026-05-23T14:30") that JS treats as local time.
function combineDueDateTime(due_date: string | null, due_time: string | null): string {
  if (!due_date) return '';
  return due_time ? `${due_date}T${due_time}` : `${due_date}T00:00:00`;
}

// Receives a UTC ISO string or local datetime string, returns local date + time parts.
function splitDueDateTime(dueDate: string): { due_date: string | null; due_time: string | null } {
  if (!dueDate) return { due_date: null, due_time: null };
  const d = new Date(dueDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return {
    due_date: `${year}-${month}-${day}`,
    due_time: `${hours}:${minutes}`,
  };
}

function toTask(row: DbTask): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    dueDate: combineDueDateTime(row.due_date, row.due_time),
    status: row.status as Task['status'],
    createdAt: row.created_at,
    notified30min: row.notified_30min,
    notifiedOverdue: row.notified_overdue,
  };
}

async function fetchAll(): Promise<Task[]> {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []).map(toTask);
}

export function useTasks(projectId?: string) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll().then(data => {
      setAllTasks(data);
      setLoaded(true);
    }).catch(err => {
      setError(err.message);
      setLoaded(true);
    });

    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchAll().then(setAllTasks).catch(() => {});
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const tasks = projectId ? allTasks.filter(t => t.projectId === projectId) : allTasks;

  async function addTask(data: Omit<Task, 'id' | 'createdAt'>) {
    const task: Task = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setAllTasks(prev => [task, ...prev]);
    const { due_date, due_time } = splitDueDateTime(data.dueDate);
    const { error: err } = await supabase.from('tasks').insert({
      id: task.id,
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      due_date,
      due_time,
      status: task.status,
      created_at: task.createdAt,
      notified_30min: false,
      notified_overdue: false,
    });
    if (err) {
      setError(err.message);
      setAllTasks(prev => prev.filter(t => t.id !== task.id));
    }
    return task;
  }

  async function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    setAllTasks(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)));
    const updates: Record<string, unknown> = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.status !== undefined) updates.status = data.status;
    if (data.projectId !== undefined) updates.project_id = data.projectId;
    if (data.dueDate !== undefined) {
      const { due_date, due_time } = splitDueDateTime(data.dueDate);
      updates.due_date = due_date;
      updates.due_time = due_time;
      // Reset notification flags when due date changes (unless caller overrides them)
      if (data.notified30min === undefined) updates.notified_30min = false;
      if (data.notifiedOverdue === undefined) updates.notified_overdue = false;
    }
    if (data.notified30min !== undefined) updates.notified_30min = data.notified30min;
    if (data.notifiedOverdue !== undefined) updates.notified_overdue = data.notifiedOverdue;

    const { error: err } = await supabase.from('tasks').update(updates).eq('id', id);
    if (err) {
      setError(err.message);
      fetchAll().then(setAllTasks).catch(() => {});
    }
  }

  async function deleteTask(id: string) {
    setAllTasks(prev => prev.filter(t => t.id !== id));
    const { error: err } = await supabase.from('tasks').delete().eq('id', id);
    if (err) {
      setError(err.message);
      fetchAll().then(setAllTasks).catch(() => {});
    }
  }

  async function deleteTasksByProject(projectId: string) {
    setAllTasks(prev => prev.filter(t => t.projectId !== projectId));
    const { error: err } = await supabase.from('tasks').delete().eq('project_id', projectId);
    if (err) {
      setError(err.message);
      fetchAll().then(setAllTasks).catch(() => {});
    }
  }

  return { tasks, allTasks, loaded, error, addTask, updateTask, deleteTask, deleteTasksByProject };
}
