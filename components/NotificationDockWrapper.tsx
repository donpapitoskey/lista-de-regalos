'use client';

import { useSocket } from '@/lib/socket';
import NotificationDock from './NotificationDock';

export default function NotificationDockWrapper() {
  const { notifications, dismissNotification } = useSocket();

  return (
    <NotificationDock
      notifications={notifications}
      onDismiss={dismissNotification}
    />
  );
}
