# STAGE 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# STAGE 2: Production
# Force Update Version: 2.6.2 (Harmonisation Port 5000)
FROM node:20-slim
WORKDIR /app

# Installation de curl pour le healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Sécurité : On n'installe que les dépendances de prod
COPY package*.json ./
RUN npm install --production

# Copie du code depuis le builder
COPY . .

# SÉCURITÉ : Exécution en tant qu'utilisateur non-privilégié
RUN useradd -m bcauser
RUN chown -R bcauser:bcauser /app
USER bcauser

# Synchronisation avec docker-compose (Port 5000)
ENV PORT=5000
EXPOSE 5000

# Healthcheck standardisé
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/ping || exit 1

CMD ["node", "src/index.js"]
