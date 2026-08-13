#!/usr/bin/env node
/**
 * BCA Connect — Script de démarrage sécurisé.
 * Valide les variables d'environnement et initialise les services de sécurité.
 */
require("./instrument"); // 🛠️ Sentry (Monitoring)
require("dotenv").config();

// 🔐 Validation des variables d'environnement (P0 - Sécurité)
const { validateEnv } = require("./config/envValidation");
validateEnv();

const app = require("./app");
const { sequelize, Category } = require("./models");
const http = require("http");
const { Server } = require("socket.io");
const refreshTokenService = require("./services/refreshTokenService");
const { startCreditReminders } = require("./cron/creditReminderCron");
const { startOrderReminders } = require("./cron/orderReminderCron");
const { startStockAlerts } = require("./cron/stockAlertCron");
const { startDisputeEscalation } = require("./cron/disputeEscalationCron");
const { startAlertThresholds } = require("./cron/alertThresholdCron");
const { runMigrations } = require("./config/runMigrations");
const { initCategoryAttributes } = require("./constants/categoryAttributes");
const { ensureDefaultCategories } = require("./config/defaultCategories");

// Lancement de la tâche Cron de rappels
startCreditReminders();

const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "production"
    ? [
        "https://bcaconnect-backend.onrender.com",
        "https://bcaconnect.onrender.com",
        "https://bcaconnect.vercel.app",
      ]
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

const start = async () => {
  try {
    // Profils partagés (ESM) — avant require('./app') qui charge aiService
    await initCategoryAttributes();
    console.log("✅ Profils attributs catégories chargés.");

    const app = require("./app");
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === "production" ? ALLOWED_ORIGINS : true,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    app.set("socketio", io);

    // Expose io to controllers
    app.set('io', io);

    // Lancement de la tâche Cron pour les relances de commandes
    startOrderReminders(io);
    
    // Lancement des alertes de stocks bas
    startStockAlerts(io);

    // Lancement de l'escalade des litiges
    startDisputeEscalation(io);

    // Lancement de l'évaluation des seuils d'alerte dynamiques (3.6)
    startAlertThresholds(io);

    io.on("connection", (socket) => {
      console.log("⚡ Un utilisateur s'est connecté :", socket.id);

      socket.on("join", (data) => {
        let userId = null;
        let role = null;
        if (typeof data === 'object') {
          userId = data.id;
          role = data.role;
        } else {
          userId = data;
        }
        
        if (userId) {
          socket.join(userId);
          socket.userId = userId;
          console.log(`👤 Utilisateur ${userId} a rejoint son canal personnel.`);
        }
        if (role) {
          socket.join(`room_${role}`);
          console.log(`👤 Utilisateur ${userId} a rejoint le canal room_${role}.`);
        }
      });

      socket.on("join_conversation", (conversationId) => {
        socket.join(`conv_${conversationId}`);
      });

      socket.on("typing", ({ conversationId, isTyping }) => {
        socket.to(`conv_${conversationId}`).emit("user_typing", {
          conversationId,
          userId: socket.userId,
          isTyping,
        });
      });

      // ── Appels audio/vidéo (signaling WebRTC) ────────────────────────────
      // Relais pur : le serveur ne comprend pas le contenu SDP/ICE, il
      // transmet juste au salon personnel du destinataire (déjà rejoint via
      // "join" ci-dessus) — même convention que le reste du temps réel.
      socket.on("call_invite", ({ targetId, conversationId, callType, callerName }) => {
        if (!targetId) return;
        io.to(targetId).emit("call_invite", {
          conversationId,
          callType,
          callerName,
          callerId: socket.userId,
        });
      });

      socket.on("call_accept", ({ targetId, conversationId }) => {
        if (!targetId) return;
        io.to(targetId).emit("call_accepted", { conversationId, calleeId: socket.userId });
      });

      socket.on("call_reject", ({ targetId, conversationId }) => {
        if (!targetId) return;
        io.to(targetId).emit("call_rejected", { conversationId, calleeId: socket.userId });
      });

      socket.on("call_signal", ({ targetId, signal }) => {
        if (!targetId) return;
        io.to(targetId).emit("call_signal", { signal, fromId: socket.userId });
      });

      socket.on("call_end", ({ targetId, conversationId }) => {
        if (!targetId) return;
        io.to(targetId).emit("call_ended", { conversationId, fromId: socket.userId });
      });

      socket.on("disconnect", () => {
        console.log("🔥 Utilisateur déconnecté :", socket.id);
      });
    });

    if (process.env.REDIS_URL) {
      console.log("🔄 Initialisation de Redis...");
      try {
        await refreshTokenService.connect();
        console.log("✅ Redis initialisé avec succès");
      } catch (redisError) {
        if (process.env.NODE_ENV === "production") {
          throw redisError;
        }
        console.warn(
          "⚠️  Redis non disponible en développement - continuant sans Redis",
        );
      }
    } else {
      console.warn(
        "⚠️  REDIS_URL non configuré - refresh token rotation désactivée",
      );
    }

    await sequelize.authenticate();
    console.log("✅ Connexion base de données établie.");

    await sequelize.sync();
    console.log("✅ Modèles synchronisés.");

    await runMigrations(sequelize);

    if (process.env.NODE_ENV !== 'production') {
        await ensureDefaultCategories(Category);
    }

    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`\n🚀 BCA Connect Real-Time API v2.6 — Port ${PORT}`);
      console.log(`🔐 Sécurité: RS256 JWT + Refresh Token Rotation + Redis`);
      console.log(`📊 Environnement: ${process.env.NODE_ENV}\n`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${PORT} déjà utilisé. Arrêtez le processus qui l'occupe ou changez la variable PORT avant de relancer.`,
        );
        process.exit(1);
      } else {
        console.error("❌ Erreur serveur:", err);
        process.exit(1);
      }
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n⏹️  Signal ${signal} reçu. Arrêt gracieux...`);

      server.close(async (err) => {
        if (err) {
          console.error("❌ Erreur lors de la fermeture du serveur:", err);
          process.exit(1);
        }
        console.log("✅ Serveur HTTP arrêté.");

        try {
          await refreshTokenService.disconnect();
          await sequelize.close();
          console.log("✅ Services déconnectés.");
        } catch (error) {
          console.error(
            "❌ Erreur lors de la déconnexion des services:",
            error,
          );
        }

        process.exit(0);
      });

      setTimeout(() => {
        console.error("⚠️  Délai d'attente dépassé. Arrêt forcé.");
        process.exit(1);
      }, 5000).unref();
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Échec du démarrage du serveur :", error);
    process.exit(1);
  }
};

start();
