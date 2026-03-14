import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

const ProductCard = ({ product }) => {
    const { id, name, category, description, price, image, isNew, vendor } = product;

    return (
        <div className="bg-card dark:bg-slate-900 rounded-3xl overflow-hidden border border-border group hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full font-inter">
            <Link to={`/product/${id}`} className="relative block overflow-hidden aspect-[4/5]">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        Voir les détails <ArrowRight className="size-3" />
                    </span>
                </div>

                {isNew && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20 border border-white/20 backdrop-blur-sm">
                            Nouveau
                        </span>
                    </div>
                )}

                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="size-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-xl">
                        <ShoppingCart className="size-5" />
                    </button>
                </div>
            </Link>

            <div className="p-6 flex flex-col flex-1 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{category}</span>
                        <div className="flex items-center gap-1 text-amber-400">
                            <Star className="size-3 fill-amber-400" />
                            <span className="text-[10px] font-bold text-foreground">4.8</span>
                        </div>
                    </div>
                    <Link to={`/product/${id}`}>
                        <h3 className="text-foreground font-black text-lg leading-tight hover:text-primary transition-colors line-clamp-1 italic tracking-tight">
                            {name}
                        </h3>
                    </Link>
                    {vendor && (
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                            {vendor}
                        </p>
                    )}
                </div>

                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 font-medium">
                    {description}
                </p>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">Prix fixe</span>
                        <span className="text-foreground font-black text-xl tracking-tighter italic">
                            {price.toLocaleString('fr-FR')} <span className="text-sm not-italic opacity-70">GNF</span>
                        </span>
                    </div>
                    <Link to={`/product/${id}`}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px] border-border group-hover:border-primary group-hover:text-primary transition-all"
                        >
                            Détails
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
