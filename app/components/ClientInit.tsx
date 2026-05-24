'use client';
import { useEffect } from 'react';
import { Task } from '../types';

export function ClientInit() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    function checkNotifications() {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      try {
        const raw = localStorage.getItem('aios-tareas');
        if (!raw) return;
        const tasks: Task[] = JSON.parse(raw);
        let changed = false;

        const updated = tasks.map(task => {
          if (task.status === 'completada' || !task.dueDate) return task;
          const diff = new Date(task.dueDate).getTime() - Date.now();

          if (diff < 0 && !task.notifiedOverdue) {
            new Notification('Tarea vencida', {
              body: task.title,
              tag: `overdue-${task.id}`,
            });
            changed = true;
            return { ...task, notifiedOverdue: true };
          }

          if (diff > 0 && diff <= 30 * 60 * 1000 && !task.notified30min) {
            new Notification('Tarea vence en 30 minutos', {
              body: task.title,
              tag: `soon-${task.id}`,
            });
            changed = true;
            return { ...task, notified30min: true };
          }

          return task;
        });

        if (changed) localStorage.setItem('aios-tareas', JSON.stringify(updated));
      } catch {}
    }

    checkNotifications();
    const interval = setInterval(checkNotifications, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
