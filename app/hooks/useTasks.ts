'use client';
import { useState, useEffect } from 'react';
import { Task } from '../types';

const STORAGE_KEY = 'aios-tareas';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useTasks(projectId?: string) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAllTasks(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks));
  }, [allTasks, loaded]);

  const tasks = projectId ? allTasks.filter(t => t.projectId === projectId) : allTasks;

  function addTask(data: Omit<Task, 'id' | 'createdAt'>) {
    const task: Task = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setAllTasks(prev => [task, ...prev]);
    return task;
  }

  function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    setAllTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, ...data, notified30min: false, notifiedOverdue: false, ...data }
          : t
      )
    );
  }

  function deleteTask(id: string) {
    setAllTasks(prev => prev.filter(t => t.id !== id));
  }

  function deleteTasksByProject(projectId: string) {
    setAllTasks(prev => prev.filter(t => t.projectId !== projectId));
  }

  return { tasks, allTasks, loaded, addTask, updateTask, deleteTask, deleteTasksByProject };
}
