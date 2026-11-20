const catchAsync = require('../../utils/catchAsync');
const authService = require('../service/auth.service');

// 🛑 SÉCURITÉ FINTECH : Stockage strict du Refresh Token en Cookie (Anti-XSS)
const setRefreshCookie = (res, refreshToken) => {
    res.cookie('bca_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });
};

const authController = {
    // 1. Inscription d'un nouvel utilisateur (Différenciée par rôle — Standard BCA v2.6)
    register: catchAsync(async (req, res) => {
        const result = await authService.register(req.body);

        switch (result.outcome) {
            case 'email_taken':
                return res.status(400).json({ message: "Cet email est déjà utilisé." });
            case 'phone_taken':
                return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé." });
            case 'store_name_required':
                return res.status(400).json({ message: "Le nom de la boutique est requis pour les vendeurs." });
            case 'transporteur_fields_required':
                return res.status(400).json({ message: "Type de véhicule, numéro de permis et zone de couverture sont requis pour les livreurs." });
            case 'technicien_fields_required':
                return res.status(400).json({ message: "Spécialités et zone d'intervention sont requises pour les techniciens." });
            case 'technicien_specialty_invalid':
                return res.status(400).json({ message: "Spécialité invalide. Veuillez choisir dans la liste proposée." });
            case 'role_forbidden':
                return res.status(403).json({ message: "Ce rôle ne peut pas s'inscrire publiquement." });
        }

        const { user: newUser, role } = result;
        const responseMessage = role === 'client'
            ? "Compte créé avec succès"
            : "Compte créé avec succès. Votre compte sera activé après vérification par notre équipe (24-48h).";

        res.status(201).json({
            message: responseMessage,
            user: { id: newUser.id, nom_complet: newUser.nom_complet, role: newUser.role, est_approuve: newUser.est_approuve }
        });
    }),

    // 2. Connexion
    login: catchAsync(async (req, res) => {
        const { email, mot_de_passe } = req.body;
        const result = await authService.login(email, mot_de_passe);

        if (result.outcome === 'invalid_credentials') {
            return res.status(401).json({ message: "Identifiants invalides." });
        }
        if (result.outcome === '2fa_setup_required') {
            return res.status(403).json({
                message: "Accès refusé. L'authentification à deux facteurs (2FA) est obligatoire pour les administrateurs.",
                require2FA_setup: true,
                userId: result.userId
            });
        }
        if (result.outcome === '2fa_required') {
            return res.json({
                message: "Authentification à deux facteurs requise.",
                require2FA: true,
                userId: result.userId
            });
        }

        setRefreshCookie(res, result.tokens.refreshToken);

        res.json({
            message: "Connexion réussie",
            token: result.tokens.accessToken, // Alias pour le hook frontend
            accessToken: result.tokens.accessToken,
            user: { id: result.user.id, nom_complet: result.user.nom_complet, role: result.user.role }
        });
    }),

    // 🌐 Authentification Google Social
    googleLogin: catchAsync(async (req, res) => {
        const { credential } = req.body;
        const result = await authService.googleLogin(credential);

        switch (result.outcome) {
            case 'missing_credential':
                return res.status(400).json({ message: "Jeton Google manquant." });
            case 'account_suspended':
                return res.status(403).json({ message: "Votre compte est suspendu." });
            case 'failed':
                return res.status(401).json({ message: "Authentification Google échouée." });
        }

        setRefreshCookie(res, result.tokens.refreshToken);

        res.json({
            message: "Connexion Google réussie",
            token: result.tokens.accessToken,
            accessToken: result.tokens.accessToken,
            user: { id: result.user.id, nom_complet: result.user.nom_complet, role: result.user.role }
        });
    }),

    // 🔒 Étape 2 de l'authentification : Vérification du code 2FA
    verify2FA: catchAsync(async (req, res) => {
        const { userId, code } = req.body;
        const result = await authService.verify2FA(userId, code);

        if (result.outcome === 'unauthorized') {
            return res.status(401).json({ message: "Action non autorisée." });
        }
        if (result.outcome === 'invalid_code') {
            return res.status(401).json({ message: "Code de sécurité invalide." });
        }

        setRefreshCookie(res, result.tokens.refreshToken);

        res.json({
            message: "Vérification 2FA réussie",
            token: result.tokens.accessToken, // Alias pour le hook frontend
            accessToken: result.tokens.accessToken,
            user: { id: result.user.id, nom_complet: result.user.nom_complet, role: result.user.role }
        });
    }),

    // ⚙️ Configuration 2FA - Étape 1 : Génération du secret
    setup2FA: catchAsync(async (req, res) => {
        const data = await authService.setup2FA(req.user.id);
        if (!data) return res.status(404).json({ message: "Utilisateur non trouvé." });

        res.json({
            qrCode: data.qrCode,
            secret: data.secret,
            backupCodes: data.backupCodes
        });
    }),

    // ⚙️ Configuration 2FA - Étape 2 : Confirmation et Activation
    confirm2FA: catchAsync(async (req, res) => {
        const { code } = req.body;
        const result = await authService.confirm2FA(req.user.id, code);

        if (result.outcome === 'secret_not_generated') {
            return res.status(400).json({ message: "Le secret 2FA n'a pas été généré." });
        }
        if (result.outcome === 'invalid_code') {
            return res.status(401).json({ message: "Code invalide. Activation échouée." });
        }

        res.json({ message: "Authentification 2FA activée avec succès." });
    }),

    // ⚙️ Désactivation 2FA
    disable2FA: catchAsync(async (req, res) => {
        const result = await authService.disable2FA(req.user.id);

        if (result.outcome === 'not_enabled') {
            return res.status(400).json({ message: "L'authentification 2FA n'est pas activée." });
        }

        res.json({ message: "Authentification 2FA désactivée avec succès." });
    }),

    refreshToken: async (req, res) => {
        try {
            // SÉCURITÉ : On extrait l'identité depuis le cookie HttpOnly uniquement
            const refreshToken = req.cookies?.bca_refresh_token;

            if (!refreshToken) {
                return res.status(401).json({ message: "Session expirée ou cookie introuvable." });
            }

            const result = await authService.refreshTokenRotate(refreshToken);

            if (result.outcome === 'user_not_found') {
                res.clearCookie('bca_refresh_token');
                return res.status(401).json({ message: "Utilisateur non reconnu." });
            }

            // Rotation du Cookie (Renouvellement)
            setRefreshCookie(res, result.tokens.refreshToken);

            res.json({ accessToken: result.tokens.accessToken });
        } catch (error) {
            res.clearCookie('bca_refresh_token');
            res.status(401).json({ message: error.message });
        }
    },

    logout: catchAsync(async (req, res) => {
        await authService.logout(req.user?.id);

        res.clearCookie('bca_refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.json({ message: "Déconnexion réussie." });
    }),

    getMe: catchAsync(async (req, res) => {
        const user = await authService.getMe(req.user.id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
        res.json(user);
    }),

    updateProfile: catchAsync(async (req, res) => {
        const { nom_complet, telephone, email, mot_de_passe, avatar_url } = req.body;
        const result = await authService.updateProfile(req.user.id, { nom_complet, telephone, email, mot_de_passe, avatar_url });

        if (result.outcome === 'not_found') {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        if (result.outcome === 'email_taken') {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        const { user } = result;
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
    }),

    deleteAccount: catchAsync(async (req, res) => {
        const result = await authService.deleteAccount(req.user.id, req);

        if (result.outcome === 'not_found') {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        res.clearCookie('bca_refresh_token');
        res.json({ message: "Compte supprimé conformément au RGPD." });
    }),

    requestOtp: catchAsync(async (req, res) => {
        const { telephone, type_action } = req.body;
        const result = await authService.requestOtp(telephone, type_action);
        res.json({ message: 'Code OTP envoyé.', ...result });
    }),

    verifyOtp: catchAsync(async (req, res) => {
        const { telephone, code, type_action } = req.body;
        const result = await authService.verifyOtpCode(telephone, code, type_action);
        res.json({ message: 'Code OTP validé.', ...result });
    }),

    // 📴 Mode résilience hors ligne — PIN d'authentification locale
    setOfflinePin: catchAsync(async (req, res) => {
        const result = await authService.setOfflinePin(req.user.id, req.body.pin);
        res.json({ message: 'Code PIN hors ligne défini avec succès.', ...result });
    }),

    verifyOfflinePin: catchAsync(async (req, res) => {
        const result = await authService.verifyOfflinePin(req.user.id, req.body.pin);
        res.json({ message: 'Code PIN validé.', ...result });
    }),

    getOfflineCredentials: catchAsync(async (req, res) => {
        const result = await authService.getOfflineCredentials(req.user.id);
        res.json(result);
    }),
};

module.exports = authController;
