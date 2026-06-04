import { z } from 'zod';

/**
 * BCA Connect Validation Schemas (v2.6 API Compliant)
 */

export const loginSchema = z.object({
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

export const registerBaseSchema = z.object({
    nom_complet: z.string()
        .min(3, "Nom complet requis (min 3 caractères)")
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
    email: z.string().email("Format d'email invalide"),
    password: z.string()
        .min(8, "Le mot de passe doit faire au moins 8 caractères")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre"),
    role: z.enum(['client', 'fournisseur', 'transporteur', 'banque', 'technicien']).default('client'),
    telephone: z.string().min(8, "Le numéro de téléphone est trop court").max(20, "Le numéro de téléphone est trop long"),
});

export const registerClientSchema = registerBaseSchema.extend({
    adresse: z.string().optional(),
});

export const registerFournisseurSchema = registerBaseSchema.extend({
    nom_boutique: z.string().min(2, "Le nom de la boutique est requis (min 2 caractères)"),
    categorie_activite: z.string().min(1, "Veuillez sélectionner une catégorie d'activité"),
    adresse_boutique: z.string().min(3, "L'adresse du commerce est requise"),
    description_boutique: z.string().optional(),
    registre_commerce: z.string().optional(),
});

export const registerTransporteurSchema = registerBaseSchema.extend({
    type_vehicule: z.string().min(1, "Veuillez sélectionner un type de véhicule"),
    numero_permis: z.string().min(3, "Le numéro de permis est requis"),
    zone_couverture: z.string().min(1, "Veuillez sélectionner une zone de couverture"),
});

export const registerTechnicienSchema = registerBaseSchema.extend({
    specialites: z.string().min(2, "Veuillez préciser vos spécialités"),
    numero_agrement: z.string().optional(),
    zone_intervention: z.string().min(2, "La zone d'intervention est requise"),
});

// Helper : retourne le bon schéma selon le rôle
export const getRegisterSchema = (role) => {
    switch (role) {
        case 'fournisseur': return registerFournisseurSchema;
        case 'transporteur': return registerTransporteurSchema;
        case 'technicien': return registerTechnicienSchema;
        default: return registerClientSchema;
    }
};

// Rétrocompatibilité
export const registerSchema = registerBaseSchema;

export const productSchema = z.object({
    nom_produit: z.string().min(3, "Nom de l'actif requis (min 3 chars)."),
    description: z.string().min(10, "Description technique requise (min 10 chars)."),
    prix_unitaire: z.number().positive("La cotation doit être un nombre positif."),
    stock_quantite: z.number().int().nonnegative("Le stock ne peut être négatif."),
    categorie_id: z.string().min(1, "Catégorie d'indexation requise."),
    unite_mesure: z.string().min(1, "Unité de mesure requise (ex: Kg, Litre)."),
    mots_cles: z.string().optional(),
});

export const ticketSchema = z.object({
    sujet: z.string().min(5, "Le sujet est trop court"),
    message: z.string().min(10, "Le message doit être plus détaillé"),
    categorie: z.enum(['technique', 'facturation', 'logistique', 'autre']),
    priorité: z.enum(['basse', 'normale', 'haute']).default('normale'),
});

export const profileSchema = z.object({
    nom_complet: z.string().min(3).optional(),
    telephone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Numéro de téléphone invalide").optional(),
    adresse: z.string().optional(),
});

export const checkoutStep1Schema = z.object({
    nom: z.string().min(2, "Le nom du destinataire est requis."),
    telephone: z.string().min(8, "Un numéro de téléphone valide est requis."),
    adresse: z.string().min(5, "L'adresse de livraison est requise."),
    quartier: z.string().min(2, "Le quartier est requis."),
});

export const profileUpdateSchema = z.object({
    nom_complet: z.string().min(3, "Le nom complet doit faire au moins 3 caractères.").optional().or(z.literal('')),
    telephone: z.string().regex(/^\+?[0-9]{8,15}$/, "Format de téléphone invalide.").optional().or(z.literal('')),
    email: z.string().email("Format d'email invalide.").optional().or(z.literal('')),
    mot_de_passe: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères.").optional().or(z.literal('')),
});

export const creditRequestSchema = z.object({
    montant_principal: z.number().min(500000, "Le montant minimum est de 500.000 GNF"),
    duree_mois: z.number().min(3).max(36),
    motif: z.string().min(10, "Veuillez détailler le motif (min 10 caractères)"),
    garanties: z.string().optional(),
});

