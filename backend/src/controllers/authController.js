const { User, Wallet, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const tokenService = require('../services/tokenService');
const twoFactorService = require('../services/twoFactorService');

const authController = {
    // 1. Inscription d'un nouvel utilisateur
    register: async (req, res, next) => {
        try {
            const { nom_complet, email, telephone, mot_de_passe, role } = req.body;

            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) return res.status(400).json({ message: "Cet email est déjà utilisé." });

            const existingPhone = await User.findOne({ where: { telephone } });
            if (existingPhone) return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé." });

            const salt = await bcrypt.genSalt(10);
            const hashedContext = await bcrypt.hash(mot_de_passe, salt);

            const newUser = await User.create({
                nom_complet,
                email,
                telephone,
                mot_de_passe: hashedContext,
                role
            });

            await Wallet.create({ user_id: newUser.id });

            res.status(201).json({
                message: "Utilisateur créé avec succès",
                user: { id: newUser.id, nom_complet: newUser.nom_complet, role: newUser.role }
            });
        } catch (error) {
            next(error);
        }
    },

    // 2. Connexion
    login: async (req, res, next) => {
        try {
            const { email, mot_de_passe } = req.body;

            const user = await User.findOne({ where: { email } });
            if (!user) return res.status(401).json({ message: "Identifiants invalides." });

            const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
            if (!isMatch) return res.status(401).json({ message: "Identifiants invalides." });

            // 🛡️ Vérification 2FA obligatoire pour les admins (Standard BCA v2.5)
            if (user.two_factor_enabled) {
                return res.json({
                    message: "Authentification à deux facteurs requise.",
                    require2FA: true,
                    userId: user.id
                });
            }

            const tokens = await tokenService.getTokens(user);

            res.json({
                message: "Connexion réussie",
                ...tokens,
                user: { id: user.id, nom_complet: user.nom_complet, role: user.role }
            });
        } catch (error) {
            next(error);
        }
    },

    // 🔒 Étape 2 de l'authentification : Vérification du code 2FA
    verify2FA: async (req, res, next) => {
        try {
            const { userId, code } = req.body;
            const user = await User.findByPk(userId);
            
            if (!user || !user.two_factor_enabled) {
                return res.status(401).json({ message: "Action non autorisée." });
            }

            // Vérifier si c'est un code de secours (backup)
            let isValid = twoFactorService.useBackupCode(user.two_factor_backup_codes || [], code);
            
            if (isValid) {
                await user.save(); // Sauvegarder l'utilisation du code de backup
            } else {
                // Sinon vérifier le TOTP
                isValid = twoFactorService.verifyToken(user.two_factor_secret, code);
            }

            if (!isValid) {
                return res.status(401).json({ message: "Code de sécurité invalide." });
            }

            const tokens = await tokenService.getTokens(user);
            res.json({
                message: "Vérification 2FA réussie",
                ...tokens,
                user: { id: user.id, nom_complet: user.nom_complet, role: user.role }
            });
        } catch (error) {
            next(error);
        }
    },

    // ⚙️ Configuration 2FA - Étape 1 : Génération du secret
    setup2FA: async (req, res, next) => {
        try {
            const user = await User.findByPk(req.user.id);
            if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

            const data = await twoFactorService.generateSecret(user.email);
            
            // On stocke temporairement le secret (non encore activé)
            user.two_factor_secret = data.secret;
            user.two_factor_backup_codes = data.backupCodes;
            await user.save();

            res.json({
                qrCode: data.qrCode,
                secret: data.secret,
                backupCodes: data.backupCodes
            });
        } catch (error) {
            next(error);
        }
    },

    // ⚙️ Configuration 2FA - Étape 2 : Confirmation et Activation
    confirm2FA: async (req, res, next) => {
        try {
            const { code } = req.body;
            const user = await User.findByPk(req.user.id);
            
            if (!user.two_factor_secret) {
                return res.status(400).json({ message: "Le secret 2FA n'a pas été généré." });
            }

            const isValid = twoFactorService.verifyToken(user.two_factor_secret, code);
            if (!isValid) {
                return res.status(401).json({ message: "Code invalide. Activation échouée." });
            }

            user.two_factor_enabled = true;
            await user.save();

            res.json({ message: "Authentification 2FA activée avec succès." });
        } catch (error) {
            next(error);
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken, userId } = req.body;
            if (!refreshToken) return res.status(400).json({ message: "Refresh token requis." });

            const user = await User.findByPk(userId);
            if (!user) return res.status(401).json({ message: "Utilisateur non reconnu." });

            const newTokens = await tokenService.refresh(refreshToken, user);
            res.json(newTokens);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    },

    getMe: async (req, res, next) => {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['mot_de_passe', 'two_factor_secret'] },
                include: [{ model: Wallet, as: 'portefeuille' }]
            });
            if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
            res.json(user);
        } catch (error) { next(error); }
    },

    updateProfile: async (req, res, next) => {
        try {
            const { nom_complet, telephone, email, mot_de_passe } = req.body;
            const user = await User.findByPk(req.user.id);
            if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

            if (email && email !== user.email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) return res.status(400).json({ message: "Cet email est déjà utilisé." });
                user.email = email;
            }

            if (nom_complet) user.nom_complet = nom_complet;
            if (telephone) user.telephone = telephone;
            if (mot_de_passe) {
                const salt = await bcrypt.genSalt(10);
                user.mot_de_passe = await bcrypt.hash(mot_de_passe, salt);
            }

            await user.save();
            res.json({
                message: "Profil mis à jour avec succès",
                user: { id: user.id, nom_complet: user.nom_complet, email: user.email, role: user.role }
            });
        } catch (error) { next(error); }
    },

    deleteAccount: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const user = await User.findByPk(req.user.id, { transaction: t });
            if (!user) {
                await t.rollback();
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }
            await user.update({
                nom_complet: '[Compte supprimé]',
                email: `deleted_${user.id}@bca.invalid`,
                telephone: `000_${user.id.slice(0, 8)}`,
                mot_de_passe: 'DELETED',
                statut: 'supprime',
                two_factor_enabled: false,
                two_factor_secret: null
            }, { transaction: t });
            await t.commit();
            res.json({ message: "Compte supprimé conformément au RGPD." });
        } catch (error) { await t.rollback(); next(error); }
    }
};

module.exports = authController;
