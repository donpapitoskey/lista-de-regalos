'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/components/NotificationDock';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  dismissNotification: (id: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  dismissNotification: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket] = useState<Socket | null>(() => {
    if (typeof window !== 'undefined') {
      return io({ path: '/socket.io' });
    }
    return null;
  });
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((message: string) => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [...prev, notification]);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      setIsConnected(false);
    });

    // Escuchar eventos de personas
    socket.on('persona:created', (data: { persona: { nombre: string } }) => {
      addNotification(`La persona "${data.persona.nombre}" fue creada`);
    });

    socket.on('persona:updated', (data: { persona: { nombre: string } }) => {
      addNotification(`La persona "${data.persona.nombre}" fue actualizada`);
    });

    socket.on('persona:deleted', (data: { personaNombre: string }) => {
      addNotification(`La persona "${data.personaNombre}" fue eliminada`);
    });

    // Escuchar eventos de regalos
    socket.on('regalo:created', (data: { regalo: { nombre: string }, personaNombre: string }) => {
      addNotification(`El regalo "${data.regalo.nombre}" de ${data.personaNombre} fue creado`);
    });

    socket.on('regalo:updated', (data: { regalo: { nombre: string }, personaNombre: string }) => {
      addNotification(`El regalo "${data.regalo.nombre}" de ${data.personaNombre} fue modificado`);
    });

    socket.on('regalo:deleted', (data: { regaloNombre: string, personaNombre: string }) => {
      addNotification(`El regalo "${data.regaloNombre}" de ${data.personaNombre} fue eliminado`);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, addNotification]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications, dismissNotification }}>
      {children}
    </SocketContext.Provider>
  );
}
