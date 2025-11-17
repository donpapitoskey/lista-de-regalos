# Despliegue en Azure App Service

Esta aplicación está configurada para desplegarse automáticamente en Azure App Service mediante GitHub Actions.

## Prerrequisitos

1. **Cuenta de Azure** con una suscripción activa
2. **Repositorio de GitHub** con el código de la aplicación
3. **Azure App Service** creado (Node.js 20 LTS)

## Configuración Inicial en Azure

### 1. Crear App Service

```bash
# Login a Azure
az login

# Crear un Resource Group
az group create --name gift-list-rg --location eastus

# Crear un App Service Plan (Linux)
az appservice plan create \
  --name gift-list-plan \
  --resource-group gift-list-rg \
  --sku B1 \
  --is-linux

# Crear el Web App con Node.js 20
az webapp create \
  --name gift-list-app \
  --resource-group gift-list-rg \
  --plan gift-list-plan \
  --runtime "NODE:20-lts"
```

### 2. Habilitar WebSockets

```bash
az webapp config set \
  --name gift-list-app \
  --resource-group gift-list-rg \
  --web-sockets-enabled true
```

### 3. Configurar Variables de Entorno

```bash
az webapp config appsettings set \
  --name gift-list-app \
  --resource-group gift-list-rg \
  --settings \
    NODE_ENV=production \
    WEBSITE_NODE_DEFAULT_VERSION=20-lts \
    PORT=8080
```

### 4. Obtener Publish Profile

Desde Azure Portal:
1. Ve a tu App Service
2. Click en "Get publish profile" en el menú superior
3. Se descargará un archivo XML

O mediante CLI:
```bash
az webapp deployment list-publishing-profiles \
  --name gift-list-app \
  --resource-group gift-list-rg \
  --xml
```

## Configuración de GitHub

### 1. Agregar Secret en GitHub

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Nombre: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. Valor: Pega el contenido completo del archivo publish profile XML

### 2. Actualizar el Workflow

Edita `.github/workflows/azure-deploy.yml` y cambia:
```yaml
env:
  AZURE_WEBAPP_NAME: 'gift-list-app' # Pon el nombre de tu App Service
```

## Despliegue

### Automático
- Cada push a `main` despliega automáticamente
- O ejecuta manualmente desde GitHub: Actions → Deploy to Azure App Service → Run workflow

### Manual con Azure CLI

```bash
# Build local
npm run build

# Deploy
az webapp deploy \
  --resource-group gift-list-rg \
  --name gift-list-app \
  --src-path deploy.zip \
  --type zip
```

## Verificación

1. Visita: `https://gift-list-app.azurewebsites.net`
2. Verifica logs:
```bash
az webapp log tail \
  --name gift-list-app \
  --resource-group gift-list-rg
```

## Troubleshooting

### Ver logs en tiempo real
```bash
az webapp log tail --name gift-list-app --resource-group gift-list-rg
```

### Verificar configuración
```bash
az webapp config show --name gift-list-app --resource-group gift-list-rg
```

### Reiniciar la app
```bash
az webapp restart --name gift-list-app --resource-group gift-list-rg
```

### Problemas comunes

1. **WebSockets no funcionan**: Verifica que esté habilitado
2. **Puerto incorrecto**: Azure usa PORT=8080 automáticamente
3. **Node version**: Asegúrate de usar Node 20 LTS
4. **Build falla**: Verifica que `npm run build` funcione localmente

## Estructura de Archivos para Deployment

```
deploy/
├── .next/          # Build de Next.js
├── node_modules/   # Dependencias
├── public/         # Assets estáticos
├── lib/            # Librerías compartidas
├── server.js       # Servidor Express + Socket.io
├── db.json         # Base de datos (considera Azure Storage para producción)
├── package.json
└── package-lock.json
```

## Consideraciones de Producción

1. **Base de datos**: `db.json` se pierde en cada deploy. Considera:
   - Azure Cosmos DB
   - Azure Storage Blob
   - Azure SQL Database

2. **Escalabilidad**: Socket.io con múltiples instancias requiere:
   - Redis adapter para Socket.io
   - Azure Cache for Redis

3. **HTTPS**: Azure App Service provee SSL automático

4. **Custom Domain**: Configura en Azure Portal → Custom domains

## Monitoreo

Habilita Application Insights:
```bash
az monitor app-insights component create \
  --app gift-list-insights \
  --location eastus \
  --resource-group gift-list-rg
```

## Costos Estimados

- **B1 Plan**: ~$13 USD/mes
- **Free Tier**: Disponible con limitaciones (sin custom domains, menor CPU/RAM)
