import React, { useEffect } from 'react';
import { usePaginatedData } from '../hooks/usePaginatedData';
import { InfiniteScrollList } from '../components/ui/InfiniteScrollList';
import { LoadingState, ErrorState } from '../components/ui/DataStates';
import { LazyImage } from '../components/ui/LazyImage';
import { Package } from 'lucide-react';

const ProductsWithLazyLoading = () => {
    const { data: products, loading, error, hasMore, loadMore } = usePaginatedData('/products', 20);

    useEffect(() => {
        // Initial load
        if (products.length === 0) {
            loadMore();
        }
    }, []);

    if (loading && products.length === 0) {
        return <LoadingState message="Chargement des produits..." />;
    }

    if (error && products.length === 0) {
        return <ErrorState error={error} />;
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                <h1 className="text-4xl font-bold text-foreground mb-12">Produits</h1>

                <InfiniteScrollList
                    items={products}
                    hasMore={hasMore}
                    isLoading={loading}
                    onLoadMore={loadMore}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    itemClassName="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-all"
                    renderItem={(product) => (
                        <div className="group cursor-pointer">
                            {/* Lazy loaded image */}
                            <LazyImage
                                src={product.image || `https://via.placeholder.com/300x300?text=${product.nom_produit}`}
                                alt={product.nom_produit}
                                className="h-48 w-full"
                                placeholder="bg-muted animate-pulse"
                            />

                            {/* Product info */}
                            <div className="p-4 space-y-3">
                                <h3 className="font-semibold text-foreground line-clamp-2">
                                    {product.nom_produit}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <span className="text-lg font-bold text-primary">
                                        {product.prix_unitaire?.toLocaleString('fr-FR', {
                                            style: 'currency',
                                            currency: 'GNF'
                                        })}
                                    </span>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                        {product.categorie?.nom_categorie || 'Autre'}
                                    </span>
                                </div>

                                <button className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all">
                                    Voir détails
                                </button>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default ProductsWithLazyLoading;
