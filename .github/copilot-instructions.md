# Gift List - AI Coding Agent Instructions

## Architecture Overview

This is a **real-time collaborative gift list app** with wabi-sabi/industrial design aesthetic. Key architectural decisions:

- **Custom Express + Socket.io server** (`server.js`) wraps Next.js for WebSocket support - NOT using standard Next.js dev server
- **File-based JSON database** (`db.json`) with manual read/write operations via `lib/db.ts` - no ORM
- **Real-time sync** via Socket.io broadcasts - all CRUD operations emit events to connected clients
- **Global notification system** managed in `lib/socket.tsx` - listens to all WebSocket events and displays toast-style notifications

## Critical Workflows

### Development
```bash
npm run dev          # Starts custom server (server.js) on port 3000
npm run build        # Next.js production build
npm run start        # Production mode with custom server
```

**IMPORTANT**: Always use `npm run dev`, NOT `next dev`. The app requires the custom Express server for WebSocket functionality.

### Data Flow Pattern
1. User action → Frontend calls REST API (`app/api/*`)
2. API handler updates `db.json` via `lib/db.ts` utilities
3. API returns updated data
4. Frontend emits WebSocket event with full context (personaNombre, regaloNombre)
5. `server.js` broadcasts to other clients
6. `lib/socket.tsx` receives event and shows notification
7. Other clients refetch data to update UI

## Key Conventions

### WebSocket Event Pattern
Always emit events with descriptive context for notifications:
```typescript
socket.emit('regalo:updated', {
  personaId: parseInt(personaId),
  personaNombre: persona.nombre,  // For notification message
  regalo: regaloActualizado        // Full updated object
});
```

Server broadcasts include same structure - see `server.js` event handlers.

### Design System (Wabi-Sabi/Industrial)
- **Colors**: Use stone-50 through stone-900 from `app/globals.css` CSS variables
- **Accents**: rust (#8b5a3c), clay (#b4846c), sage (#9ca986) - use sparingly
- **Typography**: System fonts only, generous spacing, -0.01em letter spacing
- **Components**: 4 Button variants (primary/secondary/danger/ghost) in `components/Button.tsx`
- **Responsive**: Mobile-first with `sm:` and `md:` breakpoints

### Component Patterns
- **Modal**: ESC key closes, click-outside handling via `useRef` - see `components/Modal.tsx`
- **Dropdown**: Three-dot menu with outside-click dismissal - see `components/Dropdown.tsx`
- **NotificationDock**: Fixed top-center, auto-dismiss after 5s, managed by SocketProvider

### Dynamic Routes
Use consistent naming: `[personaId]` throughout (not `[id]`) - Next.js requires matching segment names in nested routes.

### API Route Patterns
```typescript
// Always use async params destructuring (Next.js 15+)
const params = await props.params;
const { personaId } = params;

// Use lib/db.ts utilities
const db = await readDatabase();
const newId = generateId(db.personas);
await writeDatabase(db);
```

## Integration Points

### External Metadata Extraction
`app/api/metadata/route.ts` uses Cheerio to scrape og:image tags from product URLs - called on input blur in regalo forms.

### Real-time Notification System
`lib/socket.tsx` SocketProvider:
- Initializes Socket.io client
- Listens to 6 event types (persona/regalo created/updated/deleted)
- Manages notification queue state
- Provides `useSocket()` hook to all components

### Azure Deployment
GitHub Actions workflow in `.github/workflows/azure-deploy.yml` deploys to Azure App Service. See `AZURE_DEPLOYMENT.md` for setup. Note: `db.json` is ephemeral in Azure - recommend migrating to Azure Cosmos DB or Storage for production.

## Common Pitfalls

1. **Express 5.x routing**: Use `expressApp.use((req, res) => handle(req, res))` not `expressApp.all('*', ...)` - see `server.js`
2. **WebSocket events**: Always include personaNombre/regaloNombre for notifications, not just IDs
3. **Regalo limit**: 10 regalos per person enforced in UI - check `persona.regalos.length >= 10` before showing add button
4. **Tailwind v4**: Uses `@theme inline` syntax - CSS linter warnings are expected
5. **React Compiler**: Enabled - avoid setState in useEffect without proper dependencies

## File References

- Types: `types/index.ts` (Regalo, Persona interfaces)
- DB utilities: `lib/db.ts` (readDatabase, writeDatabase, generateId)
- Socket context: `lib/socket.tsx` (useSocket hook, notification management)
- Server: `server.js` (Express + Socket.io + Next.js handler)
- Design tokens: `app/globals.css` (wabi-sabi color palette)
