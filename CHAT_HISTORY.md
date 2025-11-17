# Chat History - Gift List Development

## Session Overview
Building a real-time collaborative gift list application with Next.js, Express, Socket.io, and wabi-sabi/industrial design aesthetic.

---

## 1. Initial WebSocket Integration

**User Request:** Continue regalo page WebSocket integration

**Commands:**
```typescript
// Added to app/persona/[personaId]/regalos/page.tsx
import { useSocket } from '@/lib/socket';
const { socket } = useSocket();

// Added WebSocket listeners in useEffect
socket.on('regalo:updated', (data) => { if (data.personaId === parseInt(personaId)) fetchPersona(); });
socket.on('regalo:deleted', (data) => { if (data.personaId === parseInt(personaId)) fetchPersona(); });

// Added socket.emit in CRUD handlers
socket.emit('regalo:created', { personaId, personaNombre, regalo });
socket.emit('regalo:updated', { personaId, personaNombre, regalo });
socket.emit('regalo:deleted', { personaId, personaNombre, regaloNombre });
```

**Summary:** Completed WebSocket integration for regalo page following the pattern established in landing page. All CRUD operations now emit events with full context (personaId, personaNombre, regalo details) and listen for updates from other clients to trigger UI refresh.

---

## 2. Global Notification System Implementation

**User Request:** Make updates work on any page with notifications showing "El regalo REGALO de PERSONA fue modificado". Add a notification dock at the top center showing push notifications.

**Commands:**
```bash
# Created new components
components/NotificationDock.tsx
components/NotificationDockWrapper.tsx

# Updated files
lib/socket.tsx
server.js
app/layout.tsx
app/globals.css
app/page.tsx
app/persona/[personaId]/regalos/page.tsx
```

**Summary:** Implemented complete global notification system:
- **NotificationDock component** with slideDown animation, auto-dismiss after 5s, manual close button
- **SocketProvider enhanced** to manage notification queue state and listen to all WebSocket events
- **Server updated** to broadcast events with personaNombre and regaloNombre for descriptive messages
- **Frontend updated** to emit proper context in all CRUD operations
- **Layout integration** added NotificationDockWrapper to root layout for global visibility
- Messages now show: "El regalo 'Bicicleta' de María fue modificado"

---

## 3. Express 5.x Routing Fix

**User Request:** Fix error - `TypeError: Missing parameter name at index 1: *`

**Commands:**
```javascript
// server.js - Changed from expressApp.all('*') to:
expressApp.use((req, res) => {
  return handle(req, res);
});
```

**Summary:** Fixed Express 5.x routing issue. Express 5 changed wildcard syntax - replaced `expressApp.all('*', ...)` with `expressApp.use((req, res) => ...)` which is the correct way to capture all routes in Express 5.x.

---

## 4. Azure Deployment Pipeline

**User Request:** Generate GitHub pipeline to deploy to Azure

**Commands:**
```bash
# Created files
.github/workflows/azure-deploy.yml
web.config
web.config.json
AZURE_DEPLOYMENT.md

# Updated files
server.js - Added PORT environment variable support
```

**Summary:** Created complete Azure deployment infrastructure:
- **GitHub Actions workflow** for automated deployment on push to main
- **web.config** for IIS/iisnode with WebSocket support enabled
- **Comprehensive documentation** in AZURE_DEPLOYMENT.md with:
  - Azure CLI commands for resource creation
  - Configuration steps for WebSockets and environment variables
  - Deployment instructions and troubleshooting guide
  - Production considerations (database persistence, scaling with Redis)
- **Server updated** to use `process.env.PORT || 3000` for Azure compatibility

---

## 5. AI Agent Instructions Documentation

**User Request:** Analyze codebase to generate/update `.github/copilot-instructions.md`

**Commands:**
```bash
# Analyzed files
server.js, lib/socket.tsx, lib/db.ts, types/index.ts
app/globals.css, package.json, README.md
components/*.tsx, app/api/**/*.ts

# Created
.github/copilot-instructions.md
```

**Summary:** Generated comprehensive AI coding agent instructions covering:
- **Architecture overview**: Custom Express+Socket.io server wrapping Next.js, file-based JSON database, real-time sync pattern
- **Critical workflows**: Development commands, data flow pattern (API → DB → WebSocket → Notifications → UI)
- **Key conventions**: WebSocket event structure, wabi-sabi design system, component patterns, dynamic route naming
- **Integration points**: Cheerio metadata extraction, Socket.io notification system, Azure deployment
- **Common pitfalls**: Express 5.x routing, WebSocket event requirements, 10-regalo limit, Tailwind v4 syntax, React Compiler
- **File references**: Key files for types, utilities, socket context, server, and design tokens

---

## Technology Stack

- **Framework:** Next.js 16.0.3 (App Router)
- **Runtime:** Node.js 20.x with Express 5.1.0
- **Real-time:** Socket.io 4.8.1 (server + client)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 with wabi-sabi theme
- **Database:** File-based JSON with fs/promises
- **Scraping:** Cheerio 1.1.2
- **Icons:** lucide-react
- **Deployment:** Azure App Service with GitHub Actions

---

## Key Features Implemented

1. ✅ Custom Express server wrapping Next.js for WebSocket support
2. ✅ Real-time collaboration with Socket.io broadcasts
3. ✅ Global notification dock with auto-dismiss and animations
4. ✅ Descriptive notification messages with context
5. ✅ File-based JSON database with utility functions
6. ✅ og:image metadata extraction from product URLs
7. ✅ Wabi-sabi/industrial design system
8. ✅ Mobile-responsive UI with Tailwind breakpoints
9. ✅ Azure deployment pipeline with GitHub Actions
10. ✅ Comprehensive documentation for AI coding agents

---

## Final State

The application is a fully functional real-time collaborative gift list with:
- Two pages: Landing (personas list) and Regalos (gifts for person)
- Complete CRUD operations for personas and regalos
- WebSocket-based real-time updates across all connected clients
- Toast-style notification dock showing all changes from other users
- Production-ready deployment setup for Azure App Service
- Comprehensive documentation for developers and AI agents
