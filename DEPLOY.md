# 🚀 Deploy del Frontend

## Opciones de Deploy

### 1. Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Seguir las instrucciones en pantalla
```

### 2. Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### 3. GitHub Pages
```bash
# Instalar gh-pages
npm i -g gh-pages

# Deploy
gh-pages -d dist
```

## Variables de Entorno

- `VITE_API_URL`: URL del backend (ya configurado para Render)

## URLs de Deploy

- **Backend:** https://calendar-backend-4k8h.onrender.com
- **Frontend:** Se generará después del deploy

## Pruebas de Notificaciones

1. **Abrir en HTTPS** (requerido para notificaciones)
2. **Aceptar permisos** de notificación
3. **Probar notificaciones** con el panel de prueba
4. **Crear eventos** con recordatorios habilitados

## Troubleshooting

- **Notificaciones no funcionan:** Verificar que esté en HTTPS
- **CORS errors:** Verificar que el backend esté configurado correctamente
- **Build errors:** Verificar que todas las dependencias estén instaladas
