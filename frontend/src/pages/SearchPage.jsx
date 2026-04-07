import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Search, Loader2, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { aiService } from '../services/aiService';
import productService from '../services/productService';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    
    const query = searchParams.get('q') || '';
    const searchType = searchParams.get('type') || 'text';
    
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState(null);

    useEffect(() => {
        if (!query) {
            setIsLoading(false);
            return;
        }

        performSearch();
    }, [query, searchType]);

    const performSearch = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);
        setAiSuggestion(null);

        try {
            // 1. Recherche directe
            let directResults = [];
            try {
                const response = await productService.searchProducts(query);
                directResults = response.data || [];
            } catch (err) {
                console.log('Recherche directe échouée, utilisation de l\'IA');
            }

            // 2. Si peu de résultats, utiliser l'IA pour trouver des produits similaires
            if (directResults.length < 3) {
                try {
                    // Appel à l'IA pour interpréter la recherche
                    const aiResponse = await aiService.interpretSearch(query);
                    
                    if (aiResponse.data) {
                        setAiSuggestion({
                            interpretation: aiResponse.data.interpretation,
                            keywords: aiResponse.data.keywords,
                            category: aiResponse.data.category
                        });

                        // Recherche avec les mots-clés suggérés par l'IA
                        const aiResults = await productService.searchProducts(
                            aiResponse.data.keywords.join(' ')
                        );
                        
                        directResults = [
                            ...directResults,
                            ...(aiResults.data || [])
                        ];
                    }
                } catch (aiErr) {
                    console.error('Erreur IA:', aiErr);
                }
            }

            // 3. Dédupliquer et limiter les résultats
            const uniqueResults = Array.from(
                new Map(directResults.map(item => [item.id, item])).values()
            ).slice(0, 20);

            setResults(uniqueResults);

            if (uniqueResults.length === 0) {
                setError('Aucun produit trouvé. L\'IA a essayé de trouver des alternatives.');
            }
        } catch (err) {
            console.error('Erreur recherche:', err);
            setError('Erreur lors de la recherche. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background pt-32 pb-16">
                <div className="container mx-auto px-4 md:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Search className="size-8 text-primary" />
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                                Résultats de recherche
                            </h1>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Recherche pour : <span className="font-semibold text-foreground">"{query}"</span>
                        </p>
                    </div>

                    {/* AI Suggestion */}
                    {aiSuggestion && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-6 bg-primary/10 border-2 border-primary/30 rounded-xl space-y-3"
                        >
                            <div className="flex items-center gap-2">
                                <Zap className="size-5 text-primary" />
                                <h3 className="font-semibold text-foreground">Suggestion IA</h3>
                            </div>
                            <p className="text-sm text-foreground">
                                <span className="font-medium">Interprétation :</span> {aiSuggestion.interpretation}
                            </p>
                            <p className="text-sm text-foreground">
                                <span className="font-medium">Catégorie :</span> {aiSuggestion.category}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {aiSuggestion.keywords.map((keyword, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="size-12 text-primary animate-spin mb-4" />
                            <p className="text-lg text-muted-foreground">Recherche en cours...</p>
                            <p className="text-sm text-muted-foreground mt-2">L'IA analyse votre requête</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-destructive/10 border-2 border-destructive/30 rounded-xl flex items-center gap-4"
                        >
                            <AlertCircle className="size-6 text-destructive shrink-0" />
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">Aucun résultat exact</h3>
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Results Grid */}
                    {!isLoading && results.length > 0 && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-6">
                                {results.length} produit{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {results.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 bg-muted overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Search className="size-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 space-y-3">
                                            <h3 className="font-semibold text-foreground line-clamp-2">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {product.description}
                                            </p>

                                            {/* Price */}
                                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                                <span className="text-lg font-bold text-primary">
                                                    {product.price?.toLocaleString('fr-FR', {
                                                        style: 'currency',
                                                        currency: 'GNF'
                                                    })}
                                                </span>
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                    {product.category}
                                                </span>
                                            </div>

                                            {/* Rating */}
                                            {product.rating && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-medium text-foreground">
                                                        ⭐ {product.rating.toFixed(1)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({product.reviews || 0} avis)
                                                    </span>
                                                </div>
                                            )}

                                            {/* Button */}
                                            <button className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all duration-300">
                                                Voir détails
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && results.length === 0 && !error && (
                        <div className="text-center py-20">
                            <Search className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-2xl font-bold text-foreground mb-2">Aucun résultat</h3>
                            <p className="text-muted-foreground">Essayez une autre recherche</p>
                        </div>
                    )}
                </div>
            </main>
    );
}
