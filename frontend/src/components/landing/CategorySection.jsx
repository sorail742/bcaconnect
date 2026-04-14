import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Flame, Trophy, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../lib/utils';
import useCart from '../../hooks/useCart';

// Image fallbacks & Premium Guinean Context Assets
import imgAgri from '../../assets/guinea_agriculture.png';
import imgMarche from '../../assets/guinea_marketplace.png';
import imgLogistique from '../../assets/guinea_logistics.png';
import imgTech from '../../assets/guinea_tech.png';
import imgCultivateur from '../../assets/Un_cultivateur_apres_recolte_embarque_pour_le_marche.webp';
import imgBoutiqueVeste from '../../assets/boutique_Veste2.webp';
import imgMecanicien from '../../assets/mecanicien_auto.jpg';
import imgIngenieurs from '../../assets/premium_photo-ingenieurs.avif';
import imgLivraison from '../../assets/commande&&livraison-1024x683.webp';
import imgChantier from '../../assets/travailler-projet-logement_1098-17511.avif';
import imgMarcheFermier from '../../assets/Marche_fermier.jpg';
import imgBoutiqueStd from '../../assets/boutique_veste.jpg';

const MOCK_PRODUCTS = [
    {
        id: '1', title: 'Sac de Riz Local Parfumé - 50kg', image: imgMarche,
        price: '345,000', oldPrice: '380,000', rating: '4.9', sold: '5 000+',
        choice: true, deal: true, tagText: 'Top Vente de la semaine'
    },
    {
        id: '2', title: 'Panneau Solaire Monocristallin 250W', image: imgTech,
        price: '850,000', oldPrice: '1,100,000', rating: '4.8', sold: '1 200+',
        choice: true, deal: false, tagText: 'Énergie Garantie 10 ans'
    },
    {
        id: '3', title: 'Bazin Riche Premium VIP - 5 Mètres', image: imgBoutiqueVeste,
        price: '1,200,000', oldPrice: null, rating: '4.9', sold: '3 500+',
        choice: true, deal: true, tagText: 'Luxe - Le plus demandé'
    },
    {
        id: '4', title: 'Engrais NPK 15-15-15 - Sac de 50kg', image: imgAgri,
        price: '450,000', oldPrice: '520,000', rating: '4.6', sold: '15 000+',
        choice: true, deal: false, tagText: 'Produit Subventionné'
    },
    {
        id: '5', title: 'Batterie Solaire Lithium 200Ah 12V', image: imgMecanicien,
        price: '4,500,000', oldPrice: '5,200,000', rating: '4.8', sold: '500+',
        choice: false, deal: true, tagText: 'Stock Limité'
    },
    {
        id: '6', title: 'Tonne de Ciment Portland 42.5', image: imgLogistique,
        price: '1,050,000', oldPrice: '1,150,000', rating: '4.7', sold: '8 000+',
        choice: true, deal: true, tagText: 'Livraison Chantiers'
    },
    {
        id: '7', title: 'Tracteur Agricole Multifonction 4x4', image: imgCultivateur,
        price: '150,000,000', oldPrice: '180,000,000', rating: '4.9', sold: '20+',
        choice: true, deal: true, tagText: 'Approuvé par BCA Connect'
    },
    {
        id: '8', title: 'Huile d\'Arachide Vierge - Bidon 20L', image: imgMarcheFermier,
        price: '420,000', oldPrice: '450,000', rating: '4.8', sold: '4 000+',
        choice: false, deal: false, tagText: 'Production Locale'
    },
    {
        id: '9', title: 'Kit d\'Éclairage Solaire Complet', image: imgIngenieurs,
        price: '650,000', oldPrice: '800,000', rating: '4.4', sold: '2 000+',
        choice: true, deal: true, tagText: 'Le plus vendu en région'
    },
    {
        id: '10', title: 'Pompe à Eau Solaire Immergée', image: imgChantier,
        price: '2,800,000', oldPrice: '3,500,000', rating: '4.8', sold: '300+',
        choice: true, deal: true, tagText: 'Solution Forage'
    },
    {
        id: '11', title: 'Tenue Traditionnelle Lépi (Sur Mesure)', image: imgBoutiqueStd,
        price: '350,000', oldPrice: '450,000', rating: '4.9', sold: '1 500+',
        choice: true, deal: true, tagText: 'Artisanat Local'
    },
    {
        id: '12', title: 'Matériaux Acier / Fers à Béton (Tonne)', image: imgLivraison,
        price: '7,500,000', oldPrice: '8,200,000', rating: '4.7', sold: '2 500+',
        choice: false, deal: false, tagText: 'Choix des Constructeurs'
    }
];

export function CategorySection() {
    const { t, lang } = useLanguage();
    const { addToCart } = useCart();

    // CTO RULE APPLIED: Pour préserver l'intégrité visuelle de la Landing Page (vitrine) 
    // et l'effort de localisation Guinéenne des images (tracteurs, bazin, panneaux solaires),
    // nous figeons strictement l'affichage sur la flotte MOCK_PRODUCTS.
    // Le vrai inventaire dynamique est réservé au `/marketplace`.
    const displayProducts = MOCK_PRODUCTS.map((item, index) => {
        return {
            id: item.id || `mock-${index}`,
            title: item.title,
            image: item.image,
            price: item.price,
            oldPrice: item.oldPrice,
            rating: item.rating,
            sold: item.sold,
            choice: item.choice,
            deal: item.deal,
            tagText: item.tagText
        };
    });

    return (
        <section className="bg-[#f5f5f5] py-12 text-slate-900 font-sans w-full">
            <div className="w-full px-4 md:px-8 lg:px-12 2xl:px-16">
                
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Marché BCA Connect</h2>
                    <Link to="/marketplace" className="text-sm font-semibold text-[#FF6600] hover:underline">
                        Tout Parcourir
                    </Link>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                    {displayProducts.map((product) => (
                        <div 
                            key={product.id} 
                            className="bg-white rounded-[16px] overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 group cursor-pointer border border-[#f0f0f0] hover:border-transparent flex flex-col relative"
                        >
                            {/* Product Image Box */}
                            <div className="aspect-square relative overflow-hidden bg-gray-100">
                                <img 
                                    src={product.image} 
                                    alt={product.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                
                                {/* Floating Cart Button */}
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        addToCart(product);
                                    }}
                                    className="absolute bottom-2 right-2 size-8 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 hover:bg-[#FF6600] hover:text-white text-slate-700 transition-all z-10"
                                >
                                    <ShoppingCart className="size-4" />
                                </button>
                            </div>

                            {/* Info Section */}
                            <div className="p-3 flex flex-col flex-1">
                                
                                {/* Tags */}
                                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                    {product.choice && (
                                        <div className="bg-[#ffe600] text-black text-[9px] font-black px-1.5 py-[1px] rounded-sm uppercase tracking-wide flex items-center gap-0.5">
                                            <ShieldCheck className="size-2.5" />
                                            BCA Verified
                                        </div>
                                    )}
                                    {product.deal && (
                                        <div className="bg-orange-100 text-[#FF6600] text-[9px] font-bold px-1.5 py-[1px] rounded-sm border border-orange-200">
                                            Offre Flash
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="text-xs text-slate-800 leading-[1.3] line-clamp-2 mb-2 group-hover:underline font-medium">
                                    {product.title}
                                </h3>

                                <div className="mt-auto">
                                    {/* Price Line */}
                                    <div className="flex items-baseline gap-1.5 mb-0.5">
                                        <span className="text-[12px] font-bold text-slate-900 leading-none">GNF</span>
                                        <span className="text-lg font-black text-slate-900 leading-none">{product.price}</span>
                                    </div>
                                    {product.oldPrice && (
                                        <div className="text-[10px] text-slate-400 line-through mb-1">GNF {product.oldPrice}</div>
                                    )}

                                    {/* Rating & Sold Text */}
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1.5">
                                        <div className="flex items-center text-slate-800">
                                            <Star className="size-2.5 fill-black text-black" />
                                            <span className="font-bold ml-0.5">{product.rating}</span>
                                        </div>
                                        <span>|</span>
                                        <span>{product.sold} vendus</span>
                                    </div>

                                    {/* Footer Promo Text */}
                                    <div className="flex items-center gap-1 text-[9px] text-[#FF6600] font-semibold border-t border-gray-100 pt-1.5 mt-1.5">
                                        <Trophy className="size-2.5 stroke-[3]" />
                                        <span className="truncate">{product.tagText}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <Link to="/marketplace" className="bg-white border border-gray-300 text-slate-800 font-bold px-8 py-3 rounded-full hover:border-[#FF6600] hover:text-[#FF6600] transition-colors text-sm shadow-sm flex items-center gap-2">
                        Explorer le marché complet
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default CategorySection;
