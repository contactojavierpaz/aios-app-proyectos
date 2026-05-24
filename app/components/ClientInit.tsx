'use client';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    async function checkNotifications() {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, status, due_date, due_time, notified_30min, notified_overdue')
        .neq('status', 'completada')
        .not('due_date', 'is', null);

      if (!tasks) return;

      for (const task of tasks) {
        const dueDate = task.due_time
          ? `${task.due_date}T${task.due_time}`
          : `${task.due_date}T00:00:00`;
        const diff = new Date(dueDate).getTime() - Date.now();

        if (diff < 0 && !task.notified_overdue) {
          new Notification('Tarea vencida', { body: task.title, tag: `overdue-${task.id}` });
          await supabase.from('tasks').update({ notified_overdue: true }).eq('id', task.id);
        } else if (diff > 0 && diff <= 30 * 60 * 1000 && !task.notified_30min) {
          new Notification('Tarea vence en 30 minutos', { body: task.title, tag: `soon-${task.id}` });
          await supabase.from('tasks').update({ notified_30min: true }).eq('id', task.id);
        }
      }
    }

    checkNotifications();
    const interval = setInterval(checkNotifications, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
