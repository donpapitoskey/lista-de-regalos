'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
}

interface NotificationDockProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export default function NotificationDock({ notifications, onDismiss }: NotificationDockProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timers = notifications.map((notif) => {
      return setTimeout(() => {
        onDismiss(notif.id);
      }, 5000);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="bg-stone-800 text-stone-50 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 animate-slideDown"
        >
          <p className="text-sm flex-1">{notif.message}</p>
          <button
            onClick={() => onDismiss(notif.id)}
            className="text-stone-400 hover:text-stone-200 transition-colors"
            aria-label="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
