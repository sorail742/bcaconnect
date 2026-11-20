const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const AppError = require('../../utils/AppError');
const authRepository = require('../repository/auth.repository');
const tokenService = require('../../services/tokenService');
const refreshTokenService = require('../../services/refreshTokenService');
const twoFactorService = require('../../services/twoFactorService');
const jwtService = require('../../services/jwtService');
const deletionLogService = require('../../deletion-log/service/deletionLog.service');
const { TECHNICIAN_SPECIALTIES } = require('../../constants/technicianSpecialties');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const OTP_TTL_MS = 10 * 60 * 1000;
const ALLOWED_OTP_ACTIONS = ['inscription', 'paiement', 'retrait', 'connexion', 'connexion_offline'];
const generateOtpCode = () => String(crypto.randomInt(100000, 999999));

const authService = {
    // 1. Inscription d'un nouvel utilisateur (Différenciée par rôle — Standard BCA v2.6)
    async register({
        nom_complet, email, telephone, mot_de_passe, role,
        // Champs spécifiques vendeur (fournisseur)
        nom_boutique, description_boutique, adresse_boutique, categorie_activite, registre_commerce,
        // Champs spécifiques transporteur
        type_vehicule, numero_permis, zone_couverture, disponibilite,
        // Champs spécifiques technicien
        specialites, numero_agrement, zone_intervention,
        // Champs optionnels client
        adresse,
    }) {
        const t = await authRepository.startTransaction();
        try {
            // ── Vérification unicité ──
            const existingEmail = await authRepository.findUserByEmail(email);
            if (existingEmail) {
                await t.rollback();
                return { outcome: 'email_taken' };
            }

            const existingPhone = await authRepository.findUserByPhone(telephone);
            if (existingPhone) {
                await t.rollback();
                return { outcome: 'phone_taken' };
            }

            // ── Validation spécifique par rôle ──
            if (role === 'fournisseur' && !nom_boutique) {
                await t.rollback();
                return { outcome: 'store_name_required' };
            }
            if (role === 'transporteur') {
                if (!type_vehicule || !numero_permis || !zone_couverture) {
                    await t.rollback();
                    return { outcome: 'transporteur_fields_required' };
                }
            }
            if (role === 'technicien') {
                if (!specialites || !zone_intervention) {
                    await t.rollback();
                    return { outcome: 'technicien_fields_required' };
                }
                if (!TECHNICIAN_SPECIALTIES.includes(specialites)) {
                    await t.rollback();
                    return { outcome: 'technicien_specialty_invalid' };
                }
            }

            if (['admin', 'banque'].includes(role)) {
                await t.rollback();
                return { outcome: 'role_forbidden' };
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
            const newUser = await authRepository.createUser(userData, t);

            // ── Création Wallet ──
            await authRepository.createWallet({ user_id: newUser.id }, t);

            // ── Auto-création Boutique pour les vendeurs ──
            if (role === 'fournisseur') {
                const slug = nom_boutique
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    + '-' + newUser.id.slice(0, 8);

                await authRepository.createStore({
                    proprietaire_id: newUser.id,
                    nom_boutique,
                    description: description_boutique || null,
                    slug,
                    statut: 'en_attente',
                }, t);
            }

            // ── Commit de la transaction ──
            await t.commit();

            return { outcome: 'created', user: newUser, role };
        } catch (error) {
            if (!t.finished) await t.rollback();
            console.error('[Register 500 Error]:', error);
            throw error;
        }
    },

    // 2. Connexion
    async login(email, mot_de_passe) {
        console.log(`[DEBUG] Tentative login: ${email}`);

        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            console.log(`[DEBUG] User introuvable: ${email}`);
            return { outcome: 'invalid_credentials' };
        }

        const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!isMatch) {
            console.log(`[DEBUG] Mot de passe incorrect pour: ${email}`);
            return { outcome: 'invalid_credentials' };
        }

        // 🛡️ SÉCURITÉ RENFORCÉE : 2FA obligatoire pour les admins (Audit P1)
        // Désactivé en développement pour faciliter les tests locaux
        if (user.role === 'admin' && !user.two_factor_enabled && process.env.NODE_ENV === 'production') {
            console.warn(`🚨 Accès refusé : L'admin ${user.email} n'a pas activé le 2FA.`);
            return { outcome: '2fa_setup_required', userId: user.id };
        }

        if (user.two_factor_enabled) {
            return { outcome: '2fa_required', userId: user.id };
        }

        const tokens = await tokenService.getTokens(user);
        console.log(`✅ Login réussi pour user ${user.id} - Refresh token stocké en Redis`);

        return { outcome: 'success', tokens, user };
    },

    // 🌐 Authentification Google Social
    async googleLogin(credential) {
        const t = await authRepository.startTransaction();
        try {
            if (!credential) {
                await t.rollback();
                return { outcome: 'missing_credential' };
            }

            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const { email, name, picture, sub: googleId } = ticket.getPayload();

            // 1. Chercher si l'utilisateur existe déjà
            let user = await authRepository.findUserByEmail(email);

            if (!user) {
                // Créer un nouvel utilisateur si inexistant
                // Note: Mot de passe aléatoire car géré par Google
                const randomPassword = crypto.randomBytes(16).toString('hex');
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                user = await authRepository.createUser({
                    nom_complet: name,
                    email,
                    mot_de_passe: hashedPassword,
                    role: 'client',
                    telephone: `GOOGLE_${googleId}`, // Full ID pour assurer l'unicité
                    statut: 'actif',
                    est_approuve: true, // Auto-approuvé car vérifié par Google
                    avatar_url: picture
                }, t);

                // Initialiser son portefeuille
                await authRepository.createWallet({
                    user_id: user.id,
                    solde_virtuel: 0,
                    solde_sequestre: 0
                }, t);
            }

            // check if user was disabled
            if (user.statut === 'bloque') {
                await t.rollback();
                return { outcome: 'account_suspended' };
            }

            await t.commit();

            const tokens = await tokenService.getTokens(user);
            console.log(`✅ Google Login réussi pour user ${user.id} - Refresh token stocké en Redis`);

            return { outcome: 'success', tokens, user };
        } catch (error) {
            if (!t.finished) await t.rollback();
            console.error('🔴 [GOOGLE AUTH ERROR]:', error);
            return { outcome: 'failed' };
        }
    },

    // 🔒 Étape 2 de l'authentification : Vérification du code 2FA
    async verify2FA(userId, code) {
        const user = await authRepository.findUserById(userId);

        if (!user || !user.two_factor_enabled) {
            return { outcome: 'unauthorized' };
        }

        // Vérifier si c'est un code de secours (backup)
        let isValid = twoFactorService.useBackupCode(user.two_factor_backup_codes || [], code);

        if (isValid) {
            await authRepository.saveUser(user); // Sauvegarder l'utilisation du code de backup
        } else {
            // Sinon vérifier le TOTP
            isValid = twoFactorService.verifyToken(user.two_factor_secret, code);
        }

        if (!isValid) {
            return { outcome: 'invalid_code' };
        }

        const tokens = await tokenService.getTokens(user);
        console.log(`✅ 2FA réussi pour user ${user.id} - Refresh token stocké en Redis`);

        return { outcome: 'success', tokens, user };
    },

    // ⚙️ Configuration 2FA - Étape 1 : Génération du secret
    async setup2FA(userId) {
        const user = await authRepository.findUserById(userId);
        if (!user) return null;

        const data = await twoFactorService.generateSecret(user.email);

        // On stocke temporairement le secret (non encore activé)
        user.two_factor_secret = data.secret;
        user.two_factor_backup_codes = data.backupCodes;
        await authRepository.saveUser(user);

        return data;
    },

    // ⚙️ Configuration 2FA - Étape 2 : Confirmation et Activation
    async confirm2FA(userId, code) {
        const user = await authRepository.findUserById(userId);

        if (!user.two_factor_secret) {
            return { outcome: 'secret_not_generated' };
        }

        const isValid = twoFactorService.verifyToken(user.two_factor_secret, code);
        if (!isValid) {
            return { outcome: 'invalid_code' };
        }

        user.two_factor_enabled = true;
        await authRepository.saveUser(user);

        return { outcome: 'success' };
    },

    // ⚙️ Désactivation 2FA
    async disable2FA(userId) {
        const user = await authRepository.findUserById(userId);

        if (!user.two_factor_enabled) {
            return { outcome: 'not_enabled' };
        }

        user.two_factor_enabled = false;
        user.two_factor_secret = null;
        user.two_factor_backup_codes = [];
        await authRepository.saveUser(user);

        return { outcome: 'success' };
    },

    async refreshTokenRotate(refreshToken) {
        // Décoder le token pour obtenir l'ID utilisateur (Standard BCA v2.6)
        const decoded = jwtService.verifyToken(refreshToken);
        const userId = decoded.id;

        console.log(`🔄 Refresh Token sécurisé pour userId: ${userId}`);

        const user = await authRepository.findUserById(userId);
        if (!user) {
            return { outcome: 'user_not_found' };
        }

        const newTokens = await tokenService.refresh(refreshToken, user);

        console.log(`✅ Refresh Token rotaté avec succès pour user ${userId}`);

        return { outcome: 'success', tokens: newTokens };
    },

    async logout(userId) {
        // Révoquer tous les tokens en Redis
        if (userId) {
            await refreshTokenService.revokeAllTokens(userId);
            console.log(`✅ Tous les tokens révoqués pour user ${userId}`);
        }
    },

    async getMe(userId) {
        return authRepository.findUserWithWalletSafe(userId);
    },

    async updateProfile(userId, { nom_complet, telephone, email, mot_de_passe, avatar_url }) {
        const user = await authRepository.findUserById(userId);
        if (!user) return { outcome: 'not_found' };

        if (email && email !== user.email) {
            const existingUser = await authRepository.findUserByEmail(email);
            if (existingUser) return { outcome: 'email_taken' };
            user.email = email;
        }

        if (nom_complet) user.nom_complet = nom_complet;
        if (telephone) user.telephone = telephone;
        if (avatar_url) user.avatar_url = avatar_url;
        if (mot_de_passe) {
            const salt = await bcrypt.genSalt(10);
            user.mot_de_passe = await bcrypt.hash(mot_de_passe, salt);
        }

        await authRepository.saveUser(user);

        return { outcome: 'success', user };
    },

    async deleteAccount(userId, req) {
        const t = await authRepository.startTransaction();
        try {
            const user = await authRepository.findUserByIdForUpdate(userId, t);
            if (!user) {
                await t.rollback();
                return { outcome: 'not_found' };
            }

            // Révoquer tous les tokens avant suppression
            await refreshTokenService.revokeAllTokens(user.id);

            // Le compte est anonymisé (RGPD) et non détruit, mais son identité
            // lisible disparaît dans la foulée : c'est justement l'instant où la
            // preuve doit être capturée.
            await deletionLogService.recordDeletion('User (auto-suppression RGPD)', user, { req, transaction: t });

            await authRepository.updateUser(user, {
                nom_complet: '[Compte supprimé]',
                email: `deleted_${user.id}@bca.invalid`,
                telephone: `000_${user.id.slice(0, 8)}`,
                mot_de_passe: 'DELETED',
                statut: 'supprime',
                two_factor_enabled: false,
                two_factor_secret: null
            }, t);
            await t.commit();

            return { outcome: 'success' };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    async requestOtp(telephone, typeAction) {
        if (!telephone || !typeAction) {
            throw new AppError('Téléphone et type_action requis.', 400);
        }
        if (!ALLOWED_OTP_ACTIONS.includes(typeAction)) {
            throw new AppError(`type_action invalide. Valeurs : ${ALLOWED_OTP_ACTIONS.join(', ')}`, 400);
        }

        await authRepository.invalidatePendingOtps(telephone, typeAction);

        const code = generateOtpCode();
        const expireAt = new Date(Date.now() + OTP_TTL_MS);

        const otp = await authRepository.createOtp({
            telephone,
            code,
            type_action: typeAction,
            expire_at: expireAt,
        });

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[OTP] ${telephone} (${typeAction}) → ${code} (expire ${expireAt.toISOString()})`);
        }

        return {
            id: otp.id,
            expire_at: expireAt,
            ...(process.env.NODE_ENV !== 'production' ? { code_dev: code } : {}),
        };
    },

    async verifyOtpCode(telephone, code, typeAction) {
        const otp = await authRepository.findValidOtp(telephone, code, typeAction);

        if (!otp) {
            throw new AppError('Code OTP invalide ou expiré.', 400);
        }

        otp.est_utilise = true;
        await authRepository.saveOtp(otp);
        return { verified: true, type_action: typeAction };
    },

    // ─── Mode résilience hors ligne : PIN d'authentification locale ───────────
    // L'utilisateur définit un code PIN (4-6 chiffres) haché côté serveur.
    // La PWA récupère le hash au login et l'utilise pour déverrouiller l'app
    // hors ligne (vérification locale), avec aussi une vérification serveur.
    async setOfflinePin(userId, pin) {
        if (!/^\d{4,6}$/.test(String(pin || ''))) {
            throw new AppError('Le code PIN doit contenir 4 à 6 chiffres.', 400);
        }
        const user = await authRepository.findUserById(userId);
        if (!user) throw new AppError('Utilisateur introuvable.', 404);

        const salt = await bcrypt.genSalt(10);
        user.code_pin_offline = await bcrypt.hash(String(pin), salt);
        await authRepository.saveUser(user);

        return { pin_defini: true };
    },

    // Vérifie le PIN (utilisable en ligne ; le hash sert aussi à la vérif offline côté PWA).
    async verifyOfflinePin(userId, pin) {
        const user = await authRepository.findUserById(userId);
        if (!user || !user.code_pin_offline) {
            throw new AppError('Aucun code PIN hors ligne défini.', 400);
        }
        const isMatch = await bcrypt.compare(String(pin || ''), user.code_pin_offline);
        if (!isMatch) throw new AppError('Code PIN incorrect.', 401);

        return { verified: true };
    },

    // Expose le hash du PIN pour cache local PWA (permet la vérif 100% hors ligne).
    async getOfflineCredentials(userId) {
        const user = await authRepository.findUserForOfflineCredentials(userId);
        if (!user) throw new AppError('Utilisateur introuvable.', 404);

        return {
            user_id: user.id,
            nom_complet: user.nom_complet,
            role: user.role,
            pin_hash: user.code_pin_offline || null,
            pin_defini: !!user.code_pin_offline,
        };
    },
};

module.exports = authService;
