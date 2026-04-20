import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, Star, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import useCart from '../../hooks/useCart';
import { toast } from 'sonner';

export const FeaturedProducts = () => {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productService.getFeatured(8);
                const items = Array.isArray(data) ? data : (data.data || []);
                setProducts(items);
            } catch (error) {
                console.error("Failed to fetch featured products", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(`${product.nom_produit} ajouté au panier`);
    };

    if (isLoading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="size-10 text-primary animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t('loading') || 'Immersion...'}</p>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-32 bg-background relative overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            <Zap className="size-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('featuredBadge')}</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {t('featuredTitle1')} <span className="text-primary italic">{t('featuredTitle2')}</span>
                        </h2>
                        <p className="text-lg text-muted-foreground font-medium max-w-xl">
                            {t('featuredDesc')}
                        </p>
                    </div>
                    <Link to="/marketplace">
                        <Button variant="outline" className="h-16 px-8 rounded-2xl border-2 border-border hover:border-primary/30 group text-[10px] font-black tracking-widest uppercase">
                            {t('viewFullCatalog')}
                            <ArrowRight className="size-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product, idx) => {
                        const price = parseFloat(product.prix_unitaire || 0);
                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <Link 
                                    to={`/product/${product.id}`}
                                    className="group block relative bg-card/40 backdrop-blur-xl border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-xl shadow-black/5"
                                >
                                    {/* Image Container */}
                                    <div className="aspect-[4/5] overflow-hidden relative bg-muted">
                                        <img 
                                            src={product.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=600'} 
                                            alt={product.nom_produit}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-6 left-6 px-4 py-2 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl">
                                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{t('flashDeal')}</span>
                                        </div>

                                        {/* Quick Action */}
                                        <button 
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="absolute bottom-6 right-6 size-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 translate-y-20 group-hover:translate-y-0 transition-transform duration-500 hover:scale-110 active:scale-95 z-20"
                                        >
                                            <ShoppingCart className="size-6" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 space-y-4">
                                        <div className="flex items-center gap-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="size-3 fill-amber-500 text-amber-500" />
                                            ))}
                                            <span className="text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-widest">{t('featuredVerified')}</span>
                                        </div>
                                        
                                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight line-clamp-2 leading-none min-h-[2.5rem] group-hover:text-primary transition-colors">
                                            {product.nom_produit}
                                        </h3>

                                        <div className="flex items-end justify-between pt-4 border-t border-border">
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('featuredUnitPrice')}</p>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-2xl font-black text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                        {price.toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-black text-primary uppercase">GNF</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">{t('featuredStock')}</p>
                                                <p className="text-sm font-black text-foreground">{product.stock_quantite || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 size-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        </section>
    );
};
