const { User, Wallet } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // 1. Inscription d'un nouvel utilisateur
    register: async (req, res, next) => {
        try {
            const { nom_complet, email, telephone, mot_de_passe, role } = req.body;

            // Vérification si l'utilisateur existe déjà
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Cet email est déjà utilisé." });
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
    }
};

module.exports = authController;
