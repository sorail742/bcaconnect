const { User, Wallet, Store, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const tokenService = require('../services/tokenService');
const refreshTokenService = require('../services/refreshTokenService');
const twoFactorService = require('../services/twoFactorService');

const authController = {
    // 1. Inscription d'un nouvel utilisateur (Différenciée par rôle — Standard BCA v2.6)
    register: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const {
                nom_complet, email, telephone, mot_de_passe, role,
                // Champs spécifiques vendeur (fournisseur)
                nom_boutique, description_boutique, adresse_boutique, categorie_activite, registre_commerce,
                // Champs spécifiques transporteur
                type_vehicule, numero_permis, zone_couverture, disponibilite,
    // Champs spécifiques technicien
    specialites, numero_agrement, zone_intervention,
    // Champs optionnels client
    adresse
            } = req.body;

            // ── Vérification unicité ──
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                await t.rollback();
                return res.status(400).json({ message: "Cet email est déjà utilisé." });
            }

            const existingPhone = await User.findOne({ where: { telephone } });
            if (existingPhone) {
                await t.rollback();
                return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé." });
            }

            // ── Validation spécifique par rôle ──
            if (role === 'fournisseur' && !nom_boutique) {
                await t.rollback();
                return res.status(400).json({ message: "Le nom de la boutique est requis pour les vendeurs." });
            }
            if (role === 'transporteur') {
                if (!type_vehicule || !numero_permis || !zone_couverture) {
                    await t.rollback();
                    return res.status(400).json({ message: "Type de véhicule, numéro de permis et zone de couverture sont requis pour les livreurs." });
                }
            }
            if (role === 'technicien') {
                if (!specialites || !zone_intervention) {
                    await t.rollback();
                    return res.status(400).json({ message: "Spécialités et zone d'intervention sont requises pour les techniciens." });
                }
                const { TECHNICIAN_SPECIALTIES } = require('../constants/technicianSpecialties');
                if (!TECHNICIAN_SPECIALTIES.includes(specialites)) {
                    await t.rollback();
                    return res.status(400).json({ message: "Spécialité invalide. Veuillez choisir dans la liste proposée." });
                }
            }

            if (['admin', 'banque'].includes(role)) {
                await t.rollback();
                return res.status(403).json({ message: "Ce rôle ne peut pas s'inscrire publiquement." });
            }

            // ── Hachage du mot de passe ──
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

            // ── Construction dynamique des données utilisateur ──
            const userData = {
                nom_complet,
                email,
                telephone,
                mot_de_passe: hashedPassword,
                role,
                // Clients : accès immédiat. Vendeurs/Transporteurs/Techniciens : validation admin requise (cf. docs projet)
                est_approuve: role === 'client',
                statut: role === 'client' ? 'actif' : 'en_attente',
            };

            // Champs spécifiques vendeur
            if (role === 'fournisseur') {
                userData.adresse = adresse_boutique || null;
                userData.categorie_activite = categorie_activite || null;
                userData.registre_commerce = registre_commerce || null;
            }

            // Champs spécifiques client
            if (role === 'client') {
                userData.adresse = adresse || null;
            }

            // Champs spécifiques transporteur
            if (role === 'transporteur') {
                userData.metadata_transporteur = {
                    type_vehicule,
                    numero_permis,
                    zone_couverture,
                    disponibilite: disponibilite || 'temps_plein'
                };
            }

            // Champs spécifiques technicien
            if (role === 'technicien') {
                userData.specialites = specialites || null;
                userData.numero_agrement = numero_agrement || null;
                userData.zone_intervention = zone_intervention || null;
            }

            // ── Création User (Transaction atomique) ──
            const newUser = await User.create(userData, { transaction: t });

            // ── Création Wallet ──
            await Wallet.create({ user_id: newUser.id }, { transaction: t });

            // ── Auto-création Boutique pour les vendeurs ──
            if (role === 'fournisseur') {
                const slug = nom_boutique
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    + '-' + newUser.id.slice(0, 8);

                await Store.create({
                    proprietaire_id: newUser.id,
                    nom_boutique,
                    description: description_boutique || null,
                    slug,
                    statut: 'en_attente',
                }, { transaction: t });
            }

            // ── Commit de la transaction ──
            await t.commit();

            // ── Réponse adaptée par rôle ──
            const responseMessage = role === 'client'
                ? "Compte créé avec succès"
                : "Compte créé avec succès. Votre compte sera activé après vérification par notre équipe (24-48h).";

            res.status(201).json({
                message: responseMessage,
                user: { id: newUser.id, nom_complet: newUser.nom_complet, role: newUser.role, est_approuve: newUser.est_approuve }
            });
        } catch (error) {
            await t.rollback();
            console.error('[Register 500 Error]:', error);
            next(error);
        }
    },

    // 2. Connexion
    login: async (req, res, next) => {
        try {
            const { email, mot_de_passe } = req.body;
            console.log(`[DEBUG] Tentative login: ${email}`);

            const user = await User.findOne({ where: { email } });
            if (!user) {
                console.log(`[DEBUG] User introuvable: ${email}`);
                return res.status(401).json({ message: "Identifiants invalides." });
            }

            const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
            if (!isMatch) {
                console.log(`[DEBUG] Mot de passe incorrect pour: ${email}`);
                return res.status(401).json({ message: "Identifiants invalides." });
            }

            // 🛡️ SÉCURITÉ RENFORCÉE : 2FA obligatoire pour les admins (Audit P1)
            // Désactivé en développement pour faciliter les tests locaux
            if (user.role === 'admin' && !user.two_factor_enabled && process.env.NODE_ENV === 'production') {
                console.warn(`🚨 Accès refusé : L'admin ${user.email} n'a pas activé le 2FA.`);
                return res.status(403).json({
                    message: "Accès refusé. L'authentification à deux facteurs (2FA) est obligatoire pour les administrateurs.",
                    require2FA_setup: true,
                    userId: user.id
                });
            }

            if (user.two_factor_enabled) {
                return res.json({
                    message: "Authentification à deux facteurs requise.",
                    require2FA: true,
                    userId: user.id
                });
            }

            const tokens = await tokenService.getTokens(user);

            // 🛑 SÉCURITÉ FINTECH : Stockage strict du Refresh Token en Cookie (Anti-XSS)
            res.cookie('bca_refresh_token', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
            });

            console.log(`✅ Login réussi pour user ${user.id} - Refresh token stocké en Redis`);

            res.json({
                message: "Connexion réussie",
                token: tokens.accessToken, // Alias pour le hook frontend
                accessToken: tokens.accessToken,
                user: { id: user.id, nom_complet: user.nom_complet, role: user.role }
            });
        } catch (error) {
            next(error);
        }
    },

    // 🌐 Authentification Google Social
    googleLogin: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
           for (const key of Object.keys(req.params)) {
                // On ne valide que si le nom du paramètre se termine par 'id' (ex: id, user_id, product_id)
                // et non s'il contient juste 'id' (ex: identity, provider)
                if (/(^id$|_id$)/.test(key) && req.params[key] && !uuidRegex.test(req.params[key])) {
                    return sendValidationError(res, key, `${key} doit être un UUID valide`, 'params');
                }
            }
            const { credential } = req.body;
            if (!credential) {
                await t.rollback();
                return res.status(400).json({ message: "Jeton Google manquant." });
            }

            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const { email, name, picture, sub: googleId } = ticket.getPayload();

            // 1. Chercher si l'utilisateur existe déjà
            let user = await User.findOne({ where: { email } });

            if (!user) {
                // Créer un nouvel utilisateur si inexistant
                // Note: Mot de passe aléatoire car géré par Google
                const randomPassword = require('crypto').randomBytes(16).toString('hex');
                const hashedPassword = await bcrypt.hash(randomPassword, 10);
                
                user = await User.create({
                    nom_complet: name,
                    email,
                    mot_de_passe: hashedPassword,
                    role: 'client',
                    telephone: `GOOGLE_${googleId}`, // Full ID pour assurer l'unicité
                    statut: 'actif',
                    est_approuve: true, // Auto-approuvé car vérifié par Google
                    avatar_url: picture
                }, { transaction: t });

                // Initialiser son portefeuille
                await Wallet.create({ 
                    user_id: user.id, 
                    solde_virtuel: 0,
                    solde_sequestre: 0 
                }, { transaction: t });
            }

            // check if user was disabled
            if (user.statut === 'bloque') {
                await t.rollback();
                return res.status(403).json({ message: "Votre compte est suspendu." });
            }

            await t.commit();

            const tokens = await tokenService.getTokens(user);

            res.cookie('bca_refresh_token', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            console.log(`✅ Google Login réussi pour user ${user.id} - Refresh token stocké en Redis`);

            res.json({
                message: "Connexion Google réussie",
                token: tokens.accessToken,
                accessToken: tokens.accessToken,
                user: { id: user.id, nom_complet: user.nom_complet, role: user.role }
            });
        } catch (error) {
            if (t) await t.rollback();
            console.error('🔴 [GOOGLE AUTH ERROR]:', error);
            res.status(401).json({ message: "Authentification Google échouée." });
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
            
            res.cookie('bca_refresh_token', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            console.log(`✅ 2FA réussi pour user ${user.id} - Refresh token stocké en Redis`);

            res.json({
                message: "Vérification 2FA réussie",
                token: tokens.accessToken, // Alias pour le hook frontend
                accessToken: tokens.accessToken,
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
            // SÉCURITÉ : On extrait l'identité depuis le cookie HttpOnly uniquement
            const refreshToken = req.cookies?.bca_refresh_token; 
            
            if (!refreshToken) {
                return res.status(401).json({ message: "Session expirée ou cookie introuvable." });
            }

            // Décoder le token pour obtenir l'ID utilisateur (Standard BCA v2.6)
            const jwtService = require('../services/jwtService');
            const decoded = jwtService.verifyToken(refreshToken);
            const userId = decoded.id;

            console.log(`🔄 Refresh Token sécurisé pour userId: ${userId}`);

            const user = await User.findByPk(userId);
            if (!user) {
                res.clearCookie('bca_refresh_token');
                return res.status(401).json({ message: "Utilisateur non reconnu." });
            }

            const newTokens = await tokenService.refresh(refreshToken, user);
            
            // Rotation du Cookie (Renouvellement)
            res.cookie('bca_refresh_token', newTokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            console.log(`✅ Refresh Token rotaté avec succès pour user ${userId}`);

            res.json({ accessToken: newTokens.accessToken });
        } catch (error) {
            res.clearCookie('bca_refresh_token');
            res.status(401).json({ message: error.message });
        }
    },

    logout: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            
            // Révoquer tous les tokens en Redis
            if (userId) {
                await refreshTokenService.revokeAllTokens(userId);
                console.log(`✅ Tous les tokens révoqués pour user ${userId}`);
            }

            res.clearCookie('bca_refresh_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict'
            });
            
            res.json({ message: "Déconnexion réussie." });
        } catch (error) {
            next(error);
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
            const { nom_complet, telephone, email, mot_de_passe, avatar_url } = req.body;
            const user = await User.findByPk(req.user.id);
            if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

            if (email && email !== user.email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) return res.status(400).json({ message: "Cet email est déjà utilisé." });
                user.email = email;
            }

            if (nom_complet) user.nom_complet = nom_complet;
            if (telephone) user.telephone = telephone;
            if (avatar_url) user.avatar_url = avatar_url;
            if (mot_de_passe) {
                const salt = await bcrypt.genSalt(10);
                user.mot_de_passe = await bcrypt.hash(mot_de_passe, salt);
            }

            await user.save();
            res.json({
                message: "Profil mis à jour avec succès",
                user: { 
                    id: user.id, 
                    nom_complet: user.nom_complet, 
                    email: user.email, 
                    role: user.role,
                    avatar_url: user.avatar_url 
                }
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
            
            // Révoquer tous les tokens avant suppression
            await refreshTokenService.revokeAllTokens(user.id);
            
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
            
            res.clearCookie('bca_refresh_token');
            res.json({ message: "Compte supprimé conformément au RGPD." });
        } catch (error) { await t.rollback(); next(error); }
    },

    requestOtp: async (req, res, next) => {
        try {
            const otpService = require('../services/otpService');
            const { telephone, type_action } = req.body;
            const result = await otpService.createOtp(telephone, type_action);
            res.json({ message: 'Code OTP envoyé.', ...result });
        } catch (error) {
            next(error);
        }
    },

    verifyOtp: async (req, res, next) => {
        try {
            const otpService = require('../services/otpService');
            const { telephone, code, type_action } = req.body;
            const result = await otpService.verifyOtp(telephone, code, type_action);
            res.json({ message: 'Code OTP validé.', ...result });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
