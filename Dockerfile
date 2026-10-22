# ── Etapa 1: Dependencias ──────────────────────────────────────────────────────
# Usamos la imagen oficial de Node.js 20 con Alpine para reducir el tamaño.
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar solo los manifiestos de paquetes para aprovechar la caché de capas.
COPY package.json package-lock.json* ./

# Instalar dependencias de producción y desarrollo (se necesitan para el build).
RUN npm ci

# ── Etapa 2: Build ─────────────────────────────────────────────────────────────
# Compilar la aplicación Next.js con la variable de entorno correcta.
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias instaladas en la etapa anterior.
COPY --from=deps /app/node_modules ./node_modules

# Copiar el código fuente completo.
COPY . .

# Variables de entorno necesarias para el build (Next.js las necesita en tiempo de compilación).
# La API key de Gemini se inyecta en tiempo de ejecución, NO en el build.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compilar la aplicación.
RUN npm run build

# ── Etapa 3: Runner ────────────────────────────────────────────────────────────
# Imagen final mínima solo con lo necesario para ejecutar la app.
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root por seguridad.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos de la etapa de build.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario no-root.
USER nextjs

# Exponer el puerto de la aplicación.
EXPOSE 3000

# Variable de entorno para el puerto (Next.js lo respeta).
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando de inicio usando el servidor standalone de Next.js.
CMD ["node", "server.js"]
