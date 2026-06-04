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
const { sequelize } = require("./models");
const http = require("http");
const { Server } = require("socket.io");
const { QueryTypes } = require("sequelize");
const refreshTokenService = require("./services/refreshTokenService");
const { startCreditReminders } = require("./cron/creditReminderCron");

/**
 * Migration douce : ajoute les colonnes manquantes sans DROP/RECREATE.
 * Compatible SQLite avec contraintes FK.
 */
async function runSafeMigrations(sequelize) {
  const qi = sequelize.getQueryInterface();

  const migrations = [
    // Table boutiques
    {
      table: "boutiques",
      column: "use_carousel",
      definition: {
        type: require("sequelize").DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      table: "boutiques",
      column: "banner_images",
      definition: {
        type: require("sequelize").DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      table: "boutiques",
      column: "is_verified",
      definition: {
        type: require("sequelize").DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      table: "boutiques",
      column: "rating",
      definition: {
        type: require("sequelize").DataTypes.FLOAT,
        defaultValue: 4.5,
      },
    },
    // Table utilisateurs
    {
      table: "utilisateurs",
      column: "avatar_url",
      definition: {
        type: require("sequelize").DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      table: "utilisateurs",
      column: "points_fidelite",
      definition: {
        type: require("sequelize").DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      table: "utilisateurs",
      column: "specialites",
      definition: {
        type: require("sequelize").DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      table: "utilisateurs",
      column: "numero_agrement",
      definition: {
        type: require("sequelize").DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      table: "utilisateurs",
      column: "zone_intervention",
      definition: {
        type: require("sequelize").DataTypes.STRING(255),
        allowNull: true,
      },
    },
    // Table produits
    {
      table: "produits",
      column: "condition",
      definition: {
        type: require("sequelize").DataTypes.STRING(20),
        defaultValue: "neuf",
      },
    },
    {
      table: "produits",
      column: "marque",
      definition: {
        type: require("sequelize").DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      table: "produits",
      column: "is_featured",
      definition: {
        type: require("sequelize").DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      table: "produits",
      column: "unite_mesure",
      definition: {
        type: require("sequelize").DataTypes.STRING(50),
        defaultValue: "Pièce",
        allowNull: true,
      },
    },
    {
      table: "produits",
      column: "mots_cles",
      definition: {
        type: require("sequelize").DataTypes.JSON,
        defaultValue: [],
        allowNull: true,
      },
    },
    // Table catégories
    {
      table: "categories",
      column: "image_url",
      definition: {
        type: require("sequelize").DataTypes.STRING,
        allowNull: true,
      },
    },
    // Table commandes
    {
      table: "commandes",
      column: "delivery_group_id",
      definition: {
        type: require("sequelize").DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      table: "details_commandes",
      column: "escrow_released",
      definition: {
        type: require("sequelize").DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      table: "litiges",
      column: "resolution_type",
      definition: {
        type: require("sequelize").DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      table: "litiges",
      column: "remboursement_montant",
      definition: {
        type: require("sequelize").DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
    },
    {
      table: "litiges",
      column: "preuves",
      definition: {
        type: require("sequelize").DataTypes.TEXT,
        allowNull: true,
      },
    },
  ];

  for (const m of migrations) {
    try {
      // Vérifier si la colonne existe déjà (Agnostique SQL)
      const tableDefinition = await qi.describeTable(m.table);
      const exists = !!tableDefinition[m.column];

      if (!exists) {
        await qi.addColumn(m.table, m.column, m.definition);
        console.log(
          `✅ Migration : colonne '${m.column}' ajoutée à '${m.table}'`,
        );
      }
    } catch (err) {
      console.warn(
        `⚠️  Migration '${m.column}' sur '${m.table}' ignorée : ${err.message}`,
      );
    }
  }
}

// Lancement de la tâche Cron de rappels
startCreditReminders();

// 🚀 Démarrage du Serveur Node
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
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

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? ALLOWED_ORIGINS : true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attacher io à l'app pour y accéder dans les contrôleurs
app.set("socketio", io);

io.on("connection", (socket) => {
  console.log("⚡ Un utilisateur s'est connecté :", socket.id);

  // Rejoindre le canal personnel
  socket.on("join", (userId) => {
    socket.join(userId);
    socket.userId = userId;
    console.log(`👤 Utilisateur ${userId} a rejoint son canal personnel.`);
  });

  // Rejoindre une room de conversation
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conv_${conversationId}`);
  });

  // Indicateur de frappe
  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(`conv_${conversationId}`).emit("user_typing", {
      conversationId,
      userId: socket.userId,
      isTyping,
    });
  });

  socket.on("disconnect", () => {
    console.log("🔥 Utilisateur déconnecté :", socket.id);
  });
});

const start = async () => {
  try {
    // 🔐 Initialiser Redis pour la rotation des refresh tokens
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

    // Connexion à la base de données
    await sequelize.authenticate();
    console.log("✅ Connexion PostgreSQL établie.");

    // Synchronisation standard (ne modifie pas les tables existantes)
    await sequelize.sync();
    console.log("✅ Modèles synchronisés.");

    // Migration douce : ajout des colonnes manquantes sans toucher aux FK
    await runSafeMigrations(sequelize);

    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`\n🚀 BCA Connect Real-Time API v2.6 — Port ${PORT}`);
      console.log(`🔐 Sécurité: RS256 JWT + Refresh Token Rotation + Redis`);
      console.log(`📊 Environnement: ${process.env.NODE_ENV}\n`);
    });

    // Handle server errors (e.g., EADDRINUSE)
    // NOTE: Ne pas basculer automatiquement vers un autre port.
    // Si le port demandé est occupé, échouer explicitement pour
    // laisser l'utilisateur relancer le projet sur le port souhaité.
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

    // Gestion de l'arrêt gracieux (Standard BCA v2.6)
    const gracefulShutdown = async (signal) => {
      console.log(`\n⏹️  Signal ${signal} reçu. Arrêt gracieux...`);

      // 1. Arrêter d'accepter de nouvelles connexions
      server.close(async (err) => {
        if (err) {
          console.error("❌ Erreur lors de la fermeture du serveur:", err);
          process.exit(1);
        }
        console.log("✅ Serveur HTTP arrêté.");

        // 2. Déconnexion des services tiers (Redis, DB...)
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

      // 3. Sécurité : Forcer l'arrêt après 5 secondes si le serveur reste bloqué
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
