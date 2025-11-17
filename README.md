# 🎁 Gift List - Lista de Regalos

Aplicación minimalista con diseño wabi-sabi e industrial para gestionar listas de regalos de diferentes personas.

## 🎨 Diseño

- **Estilo**: Wabi-sabi + Industrial
- **Colores**: Tonos tierra, grises, piedra natural
- **Estética**: Minimalista, espacios generosos, bordes limpios
- **Tipografía**: System fonts, legibilidad prioritaria

## 🚀 Inicio Rápido

```bash
# Iniciar servidor de desarrollo (puerto 3000)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
gift-list/
├── app/
│   ├── api/                    # API Routes
│   │   ├── personas/           # CRUD de personas
│   │   ├── metadata/           # Extraer metadatos de URLs
│   ├── persona/[personaId]/    # Página de regalos
│   ├── page.tsx                # Landing page
│   └── globals.css             # Estilos wabi-sabi
├── components/                 # Componentes reutilizables
├── lib/                        # Utilidades
├── types/                      # Tipos TypeScript
└── db.json                     # Base de datos JSON
```

## 🔌 API Endpoints

### Personas
- `GET /api/personas` - Listar todas
- `POST /api/personas` - Crear persona
- `GET /api/personas/:id` - Obtener persona
- `PUT /api/personas/:id` - Actualizar persona
- `DELETE /api/personas/:id` - Eliminar persona

### Regalos
- `POST /api/personas/:personaId/regalos` - Crear regalo
- `GET /api/personas/:personaId/regalos/:regaloId` - Obtener regalo
- `PUT /api/personas/:personaId/regalos/:regaloId` - Actualizar regalo
- `DELETE /api/personas/:personaId/regalos/:regaloId` - Eliminar regalo

### Metadatos
- `POST /api/metadata` - Extraer og:image de URL

## ✨ Características

### Landing Page (/)
- Lista todas las personas
- Adicionar/editar/borrar personas
- Contador de regalos por persona
- Navegación a regalos

### Página de Regalos
- CRUD completo de regalos
- Extracción automática de imágenes de URLs
- Marcar regalos como tomados
- Vista previa de imágenes
- Enlaces externos

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Iconos**: Lucide React
- **Base de datos**: JSON local
- **Scraping**: Cheerio

## 🎨 Paleta de Colores

- **Stone 50-900**: Tonos tierra principales
- **Rust**: `#8b5a3c` - Acentos cálidos
- **Clay**: `#b4846c` - Tonos arcilla
- **Sage**: `#9ca986` - Verde salvia

