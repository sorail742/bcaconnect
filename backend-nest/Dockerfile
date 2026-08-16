# STAGE 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# STAGE 2: Production
FROM node:20-slim
WORKDIR /app

# Installation de curl pour le healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Sécurité : on n'installe que les dépendances de prod
COPY package*.json ./
RUN npm install --production

# dist/ contient à la fois le code applicatif compilé (src/) et le client
# Prisma généré (generated/prisma/), tsconfig.json n'exclut aucun des deux —
# rien d'autre à copier depuis le builder côté code applicatif.
COPY --from=builder /app/dist ./dist

# prisma.config.ts + prisma/ (schema + migrations) : nécessaires à
# `prisma migrate deploy` au démarrage du conteneur (voir CMD) — même
# principe que runMigrations(sequelize) dans backend/src/index.js, chaque
# service applique ses propres migrations à son propre boot.
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma

# Sécurité : exécution en tant qu'utilisateur non-privilégié
RUN useradd -m nestuser
RUN chown -R nestuser:nestuser /app
USER nestuser

ENV PORT=4001
EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4001/ || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
