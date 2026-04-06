const { User, Wallet, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // 1. Inscription d'un nouvel utilisateur
    register: async (req, res, next) => {
        try {
            const { nom_complet, email, telephone, mot_de_passe, role } = req.body;

            // Vérification si l'utilisateur existe déjà (email)
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({ message: "Cet email est déjà utilisé." });
            }

            // Vérification si l'utilisateur existe déjà (téléphone)
            const existingPhone = await User.findOne({ where: { telephone } });
            if (existingPhone) {
                return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé." });
            }

            // Hachage du mot de passe
            const salt = await bcrypt.genSalt(10);
            const hashedContext = await bcrypt.hash(mot_de_passe, salt);

            // Création de l'utilisateur
            const newUser = await User.create({
                nom_complet,
                email,
                telephone,
                mot_de_passe: hashedContext,
                role
            });

            // Création automatique du portefeuille vide pour l'utilisateur
            await Wallet.create({ user_id: newUser.id });

            res.status(201).json({
                message: "Utilisateur créé avec succès",
                user: {
                    id: newUser.id,
                    nom_complet: newUser.nom_complet,
                    role: newUser.role
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // 2. Connexion
    login: async (req, res, next) => {
        try {
            const { email, mot_de_passe } = req.body;

            // Trouver l'utilisateur
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: "Identifiants invalides." });
            }

            // Vérifier le mot de passe
            const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
            if (!isMatch) {
                return res.status(401).json({ message: "Identifiants invalides." });
            }

            // Génération du JWT
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: "Connexion réussie",
                token,
                user: {
                    id: user.id,
                    nom_complet: user.nom_complet,
                    role: user.role
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // 3. Récupérer le profil de l'utilisateur connecté
    getMe: async (req, res, next) => {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['mot_de_passe'] },
                include: [{ model: Wallet, as: 'portefeuille' }]
            });
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }
            res.json(user);
        } catch (error) {
            next(error);
        }
    },

    // 4. Mettre à jour le profil
    updateProfile: async (req, res, next) => {
        try {
            const { nom_complet, telephone, email, mot_de_passe } = req.body;
            const user = await User.findByPk(req.user.id);

            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            // Vérifier si l'email est déjà pris par un autre utilisateur
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(400).json({ message: "Cet email est déjà utilisé." });
                }
                user.email = email;
            }

            if (nom_complet) user.nom_complet = nom_complet;
            if (telephone) user.telephone = telephone;

            // Si un nouveau mot de passe est fourni, le hacher
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
                    telephone: user.telephone,
                    role: user.role
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // 5. Supprimer le compte (RGPD - droit à l'oubli)
    deleteAccount: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const user = await User.findByPk(req.user.id, { transaction: t });
            if (!user) {
                await t.rollback();
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            // Anonymiser plutôt que supprimer pour préserver l'intégrité des commandes/transactions
            await user.update({
                nom_complet: '[Compte supprimé]',
                email: `deleted_${user.id}@bca.invalid`,
                telephone: `000_${user.id.slice(0, 8)}`,
                mot_de_passe: 'DELETED',
                statut: 'supprime',
                metadata_securite: null,
                preferences_ia: null
            }, { transaction: t });

            await t.commit();
            res.json({ message: "Compte supprimé conformément au RGPD." });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }
};

module.exports = authController;
