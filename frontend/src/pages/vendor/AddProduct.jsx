import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
    ChevronRight,
    Upload,
    Bold,
    Italic,
    List,
    Link as LinkIcon,
    Plus,
    Minus,
    Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AddProduct = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 pb-24">
                {/* Header */}
                <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                            <Link to="/vendor/products" className="hover:text-primary transition-colors font-medium">Produits</Link>
                            <ChevronRight className="size-4" />
                            <span className="text-slate-900 dark:text-white font-bold">Nouveau produit</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Ajouter un produit</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/vendor/products"
                            className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            Annuler
                        </Link>
                        <button className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                            <Check className="size-4" />
                            Publier le produit
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Primary Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Basic Information */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20">1</span>
                                <h2 className="text-lg font-bold">Informations de base</h2>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Nom du produit</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                        placeholder="Ex: Casque Bluetooth Premium v2"
                                        type="text"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Catégorie</label>
                                        <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-medium cursor-pointer">
                                            <option value="">Sélectionner une catégorie</option>
                                            <option value="electronics">Électronique</option>
                                            <option value="home">Maison & Jardin</option>
                                            <option value="fashion">Mode</option>
                                            <option value="toys">Jeux & Jouets</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Code SKU</label>
                                        <input
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-medium"
                                            placeholder="PROD-00000"
                                            type="text"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Detailed Description */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20">2</span>
                                <h2 className="text-lg font-bold">Description détaillée</h2>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Description du produit</label>
                                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 border-b border-slate-200 dark:border-slate-800 flex gap-2">
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400" type="button">
                                                <Bold className="size-4" />
                                            </button>
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400" type="button">
                                                <Italic className="size-4" />
                                            </button>
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400" type="button">
                                                <List className="size-4" />
                                            </button>
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400" type="button">
                                                <LinkIcon className="size-4" />
                                            </button>
                                        </div>
                                        <textarea
                                            className="w-full px-4 py-4 border-none bg-white dark:bg-slate-950 focus:ring-0 transition-all font-medium text-sm leading-relaxed"
                                            placeholder="Décrivez les points forts de votre produit..."
                                            rows="6"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Specifications */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20">3</span>
                                <h2 className="text-lg font-bold">Spécifications</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Marque</label>
                                        <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="Ex: Sony" type="text" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Poids (kg)</label>
                                        <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="0.5" type="number" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Dimensions (cm)</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="Long." type="number" />
                                            <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="Larg." type="number" />
                                            <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="Haut." type="number" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Secondary Data */}
                    <div className="space-y-6">
                        {/* 4. Pricing & Inventory */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20">4</span>
                                <h2 className="text-lg font-bold">Prix & Inventaire</h2>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Prix de vente (GNF)</label>
                                    <div className="relative">
                                        <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-black text-lg pr-12" placeholder="0" type="number" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">GNF</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Prix promo (GNF)</label>
                                    <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold" placeholder="Facultatif" type="number" />
                                </div>
                                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Quantité en stock</label>
                                    <div className="flex items-center gap-3">
                                        <button className="w-12 h-12 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <Minus className="size-4" />
                                        </button>
                                        <input
                                            className="flex-1 px-4 py-3 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 font-black text-lg"
                                            type="number"
                                            defaultValue="0"
                                        />
                                        <button className="w-12 h-12 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <Plus className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 5. Product Media */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20">5</span>
                                <h2 className="text-lg font-bold">Médias</h2>
                            </div>
                            <div className="p-6">
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center group hover:border-primary/50 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-800/20">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                                        <Upload className="size-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">Cliquer ou glisser l'image</p>
                                        <p className="text-[10px] text-slate-500 mt-1 font-medium font-bold uppercase tracking-widest">PNG, JPG <span className="text-slate-400 opacity-50">•</span> MAX 10MB</p>
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-2 w-full">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="aspect-square bg-slate-200/50 dark:bg-slate-800/50 rounded-lg border border-slate-300/30 dark:border-slate-700/30 flex items-center justify-center relative overflow-hidden group/item">
                                                <Plus className="size-4 text-slate-400 group-hover/item:text-primary transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Visibility Settings */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Statut de visibilité</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Activé après publication</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input defaultChecked className="sr-only peer" type="checkbox" />
                                    <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddProduct;
