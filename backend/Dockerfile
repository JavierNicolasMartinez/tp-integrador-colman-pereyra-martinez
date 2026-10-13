# Etapa 1: instala todas las dependencias y compila TypeScript a JavaScript
FROM node:24-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Etapa 2: imagen final, solo con el JavaScript compilado y las dependencias de producción
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000
# Al arrancar se conecta a la base, ejecuta el seed y levanta la API
CMD ["node", "dist/main.js"]
