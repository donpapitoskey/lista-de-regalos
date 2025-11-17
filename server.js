const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Preparar Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const httpServer = createServer(expressApp);
  
  // Configurar Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? 'http://localhost:3000' : false,
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io event handlers
  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    socket.on('disconnect', () => {
      console.log('🔌 Cliente desconectado:', socket.id);
    });

    // Eventos de personas
    socket.on('persona:created', (data) => {
      console.log('👤 Persona creada:', data);
      socket.broadcast.emit('persona:created', { persona: data });
    });

    socket.on('persona:updated', (data) => {
      console.log('👤 Persona actualizada:', data);
      socket.broadcast.emit('persona:updated', { persona: data });
    });

    socket.on('persona:deleted', (data) => {
      console.log('👤 Persona eliminada:', data);
      socket.broadcast.emit('persona:deleted', { personaNombre: data.nombre });
    });

    // Eventos de regalos
    socket.on('regalo:created', (data) => {
      console.log('🎁 Regalo creado:', data);
      socket.broadcast.emit('regalo:created', {
        regalo: data.regalo,
        personaNombre: data.personaNombre,
        personaId: data.personaId,
      });
    });

    socket.on('regalo:updated', (data) => {
      console.log('🎁 Regalo actualizado:', data);
      socket.broadcast.emit('regalo:updated', {
        regalo: data.regalo,
        personaNombre: data.personaNombre,
        personaId: data.personaId,
      });
    });

    socket.on('regalo:deleted', (data) => {
      console.log('🎁 Regalo eliminado:', data);
      socket.broadcast.emit('regalo:deleted', {
        regaloNombre: data.regaloNombre,
        personaNombre: data.personaNombre,
        personaId: data.personaId,
      });
    });
  });

  // Middleware para agregar socket.io a las requests
  expressApp.use((req, res, nextHandler) => {
    res.io = io;
    nextHandler();
  });

  // Todas las requests van a Next.js
  expressApp.use((req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`✅ Servidor listo en http://${hostname}:${port}`);
    console.log(`🔌 WebSocket server activo`);
    console.log(`📦 Ambiente: ${dev ? 'development' : 'production'}`);
  });
});
