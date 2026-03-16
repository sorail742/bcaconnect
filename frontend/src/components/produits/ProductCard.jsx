import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    // Supporte à la fois le format API (nom_produit) et le format mock (name)
    const id = product.id;
    const name = product.nom_produit || product.name || 'Produit sans nom';
    const description = product.description || '';
    const price = parseFloat(product.prix_unitaire || product.price || 0);
    const category = product.categorie?.nom_categorie || product.category || 'N/A';
    const image = product.image || 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=400';
    const isNew = product.isNew;
    const vendor = product.boutique?.nom_boutique || product.vendor;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        // On pourrait utiliser un toast ici pour plus de premium
    };

    return (
        <div className="bg-card dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] overflow-hidden border border-border/50 group hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full font-inter relative">
            <Link to={`/product/${id}`} className="relative block overflow-hidden aspect-[4/5] m-3 rounded-[1.5rem]">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />

                {/* Glass Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                    <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-700 space-y-3">
                        <p className="text-white/80 text-[10px] font-medium leading-relaxed line-clamp-3">
                            {description}
                        </p>
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            Voir plus <ArrowRight className="size-3 text-primary" />
                        </span>
                    </div>
                </div>

                {isNew && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-primary/20 border border-white/10 backdrop-blur-md">
                            Nouveau
                        </span>
                    </div>
                )}

                <div className="absolute top-4 right-4 z-10 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <button
                        onClick={handleAddToCart}
                        className="size-11 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:bg-primary hover:text-white hover:border-primary transition-all shadow-2xl"
                    >
                        <ShoppingCart className="size-5" />
                    </button>
                </div>
            </Link>

            <div className="px-6 pb-6 pt-2 flex flex-col flex-1 gap-5">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.15em] rounded-lg border border-primary/10">
                            {category}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-black text-foreground italic">4.8</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Link to={`/product/${id}`}>
                            <h3 className="text-foreground font-black text-lg leading-tight hover:text-primary transition-colors line-clamp-1 italic tracking-tight uppercase">
                                {name}
                            </h3>
                        </Link>
                        {vendor && (
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                {vendor}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-auto pt-5 flex items-center justify-between border-t border-border/30">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mb-1 opacity-60 italic">Prix certifié BCA</span>
                        <span className="text-foreground font-black text-xl tracking-tighter italic">
                            {price.toLocaleString('fr-FR')} <span className="text-xs not-italic opacity-60 font-medium">GNF</span>
                        </span>
                    </div>
                    <Link to={`/product/${id}`}>
                        <Button
                            variant="outline"
                            className="h-10 px-5 rounded-xl font-black uppercase tracking-widest text-[9px] border-border/50 bg-muted/20 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 shadow-sm"
                        >
                            Détail
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
