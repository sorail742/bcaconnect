# Rôles Utilisateurs - BCA Connect 👥

Le système repose sur 5 rôles distincts définis dans la base de données :

1. **Admin** : Gestion globale de la plateforme, validation des fournisseurs et transporteurs.
2. **Fournisseur** : Création de boutique, gestion du catalogue de produits et des stocks.
3. **Transporteur** : Gestion des livraisons et mise à jour des statuts de commande.
4. **Client** : Achat de produits via le portefeuille virtuel.
5. **Banque** : Supervision des flux financiers et validation des retraits (Cash-out).

## Sécurité des Rôles
Chaque rôle possède des permissions spécifiques vérifiées par des middlewares dans l'API.
Score de confiance initial : 100/100.
