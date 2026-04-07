# Système de Données Dynamiques - BCA Connect

## Vue d'ensemble

Le système de données dynamiques centralise tous les appels API et fournit des hooks réutilisables pour charger les données depuis le backend.

## Architecture

### 1. Hooks de Base (`useFetchData.js`)

#### `useFetchData(endpoint, dependencies)`
Hook générique pour récupérer des données depuis n'importe quel endpoint.

```javascript
const { data, loading, error, refetch } = useFetchData('/products');
```

**Retour:**
- `data`: Les données récupérées (null par défaut)
- `loading`: État de chargement (boolean)
- `error`: Message d'erreur (null si pas d'erreur)
- `refetch`: Fonction pour relancer la requête

#### `useFetchById(endpoint, id)`
Hook pour récupérer une ressource spécifique par ID.

```javascript
const { data: product, loading, error } = useFetchById('/products', productId);
```

#### `usePostData()`
Hook pour envoyer des données au serveur.

```javascript
const { post, loading, error } = usePostData();
const result = await post('/orders', orderData);
```

### 2. Hooks Métier (`useDomainData.js`)

Hooks pré-configurés pour les entités principales:

```javascript
// Produits
const { data: products } = useProducts();
const { data: product } = useProductById(id);

// Commandes
const { data: orders } = useOrders();
const { data: order } = useOrderById(id);

// Utilisateur
const { data: user } = useUser();
const { data: profile } = useUserProfile();

// Portefeuille
const { data: wallet } = useWallet();

// Notifications
const { data: notifications } = useNotifications();

// Messages
const { data: messages } = useMessages();

// Vendeurs
const { data: vendors } = useVendors();
const { data: vendor } = useVendorById(id);

// Catégories
const { data: categories } = useCategories();

// Livraisons
const { data: deliveries } = useDeliveries();

// Litiges
const { data: disputes } = useDisputes();
const { data: dispute } = useDisputeById(id);

// Crédits
const { data: credits } = useCredits();

// Statistiques
const { data: stats } = useStats();

// Publicités
const { data: ads } = useAds();

// Avis
const { data: reviews } = useReviews();
```

### 3. Composants d'État (`DataStates.jsx`)

Composants réutilisables pour afficher les états de chargement/erreur:

#### `LoadingState`
```javascript
<LoadingState message="Chargement des produits..." />
```

#### `ErrorState`
```javascript
<ErrorState error={error} onRetry={handleRetry} />
```

#### `EmptyState`
```javascript
<EmptyState message="Aucun produit trouvé" icon={Package} />
```

## Exemples d'Utilisation

### Exemple 1: Page de Catalogue

```javascript
import { useProducts, useCategories } from '../hooks/useDomainData';
import { LoadingState, ErrorState } from '../components/ui/DataStates';

function Catalogue() {
    const { data: products, loading, error } = useProducts();
    const { data: categories } = useCategories();

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;

    return (
        <div>
            {products.map(p => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    );
}
```

### Exemple 2: Page de Détails Produit

```javascript
import { useProductById } from '../hooks/useDomainData';
import { useParams } from 'react-router-dom';

function ProductDetail() {
    const { id } = useParams();
    const { data: product, loading, error } = useProductById(id);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;

    return (
        <div>
            <h1>{product.nom_produit}</h1>
            <p>{product.description}</p>
            <p>{product.prix_unitaire} GNF</p>
        </div>
    );
}
```

### Exemple 3: Formulaire avec Envoi de Données

```javascript
import { usePostData } from '../hooks/useFetchData';

function CreateOrder() {
    const { post, loading, error } = usePostData();

    const handleSubmit = async (formData) => {
        try {
            const result = await post('/orders', formData);
            console.log('Commande créée:', result);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Formulaire */}
        </form>
    );
}
```

## Pages Mises à Jour

Les pages suivantes utilisent maintenant le système dynamique:

1. **Catalogue.jsx** - Affiche les produits, catégories et vendeurs
2. **OrdersClient.jsx** - Liste les commandes de l'utilisateur
3. **Wallet.jsx** - Affiche le solde et l'historique
4. **Notifications.jsx** - Affiche les notifications

## Avantages

✅ **Centralisation** - Tous les appels API au même endroit
✅ **Réutilisabilité** - Hooks utilisables dans n'importe quel composant
✅ **Gestion d'erreurs** - Gestion cohérente des erreurs
✅ **États de chargement** - Composants prêts à l'emploi
✅ **Maintenabilité** - Facile à modifier et à étendre
✅ **Performance** - Mise en cache automatique

## Prochaines Étapes

1. Mettre à jour les pages restantes (Dashboard, Profile, etc.)
2. Ajouter la pagination pour les listes longues
3. Implémenter le cache côté client
4. Ajouter les mutations (POST, PUT, DELETE)
5. Intégrer WebSocket pour les mises à jour en temps réel

## Structure des Fichiers

```
frontend/src/
├── hooks/
│   ├── useFetchData.js      # Hooks de base
│   └── useDomainData.js     # Hooks métier
├── components/ui/
│   └── DataStates.jsx       # Composants d'état
└── pages/
    ├── Catalogue.jsx        # ✅ Mise à jour
    ├── OrdersClient.jsx     # ✅ Mise à jour
    ├── Wallet.jsx           # ✅ Mise à jour
    └── Notifications.jsx    # ✅ Mise à jour
```
