# Matrice des Permissions BCA Connect (RBAC)

Ce document dtaille les droits d'accs pour chaque rle au sein de la plateforme, conformment aux spécifications de la **Phase 1**.

| Fonctionnalit | Client | Marchand | Transporteur | Banque | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Consultation Catalogue | ✅ | ✅ | ✅ | ✅ | ✅ |
| Passage de Commande | ✅ | ❌ | ❌ | ❌ | ✅ |
| Gestion Propre Boutique | ❌ | ✅ | ❌ | ❌ | ✅ |
| Gestion des Stocks | ❌ | ✅ | ❌ | ❌ | ✅ |
| Suivi Logistique | ✅ | ✅ | ✅ | ❌ | ✅ |
| Validation Livraison | ✅ | ❌ | ✅ | ❌ | ✅ |
| Consultation Soldes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approbation Crdits | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gestion des Litiges | ✅ | ✅ | ✅ | ❌ | ✅ |
| Audit Systme | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gestion Utilisateurs | ❌ | ❌ | ❌ | ❌ | ✅ |

### Dtails des Rles

#### 1. Client (Mnages/TPE)
*   Peut acheter des produits.
*   Peut demander des crdits.
*   Suivi de ses propres commandes.

#### 2. Marchand (Fournisseur)
*   Gre ses produits et son stock.
*   Reoit les paiements aprs confirmation de livraison.
*   Accde aux statistiques de vente.

#### 3. Transporteur
*   Gre les expditions qui lui sont assignes.
*   Met  jour le statut GPS en temps rel.
*   Valide la remise du colis au client.

#### 4. Banque (Finance)
*   Supervise les flux financiers.
*   Approuve ou rejette les demandes de crdit bases sur le score de solvabilit.
*   Audit les transactions du réseau.

#### 5. Administrateur
*   Contrle total sur la plateforme.
*   Gestion de la taxonomie (catgories).
*   Rsolution finale des litiges.
