import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shirt, Home, ShoppingCart, Zap, LayoutGrid } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

import imgAgri from '../../assets/Marche_fermier.jpg';
import imgVeste from '../../assets/boutique_Veste2.webp';
import imgMaison from '../../assets/travailler-projet-logement_1098-17511.avif';
import imgMecanique from '../../assets/mecanicien_auto.jpg';

export function CategorySection() {
    const { t, lang } = useLanguage();

    const categories = [
        {
            id: 'agri',
            title: t('catAgri') || "Agriculture",
            count: `1.2k+ ${t('catProducts')?.toLowerCase() || "produits"}`,
            icon: ShoppingCart,
            image: imgAgri,
        },
        {
            id: 'mode',
            title: t('catMode') || "Mode & Beauté",
            count: `850+ ${t('catProducts')?.toLowerCase() || "articles"}`,
            icon: Shirt,
            image: imgVeste,
        },
        {
            id: 'maison',
            title: t('catHome') || "Immobilier",
            count: `430+ ${t('catProperties')?.toLowerCase() || "propriétés"}`,
            icon: Home,
            image: imgMaison,
        },
        {
            id: 'auto',
            title: t('catAuto') || "Mécanique",
            count: `600+ ${t('catServices')?.toLowerCase() || "services"}`,
            icon: Zap,
            image: imgMecanique,
        }
    ];

    return (
        <section className="relative py-24 bg-background">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                            Explorez nos catégories
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm md:text-base">
                            Trouvez exactement ce que vous cherchez parmi notre vaste catalogue d'équipements et services professionnels.
                        </p>
                    </div>
                    
                    <Link to="/marketplace" className="shrink-0 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        Voir tout le catalogue
                        <ArrowRight className="size-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((cat, i) => (
                        <Link
                            key={cat.id}
                            to={`/marketplace?category=${cat.id}`}
                            className="group flex flex-col items-center p-4 bg-card rounded-2xl border border-border hover:shadow-md hover:border-primary/40 transition-all duration-300"
                        >
                            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-muted relative">
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground text-center group-hover:text-primary transition-colors">
                                {cat.title}
                            </h3>
                            <p className="text-xs text-muted-foreground text-center mt-1">
                                {cat.count}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
