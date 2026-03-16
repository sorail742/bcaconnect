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

import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';

const AddProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Pour une éventuelle édition plus tard

    const [categories, setCategories] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        nom_produit: '',
        description: '',
        prix_unitaire: '',
        stock_quantite: 0,
        categorie_id: ''
    });
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data);
            } catch (err) {
                console.error("Erreur catégories:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStockChange = (amount) => {
        setFormData(prev => ({
            ...prev,
            stock_quantite: Math.max(0, parseInt(prev.stock_quantite || 0) + amount)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!formData.categorie_id) {
                throw new Error("Veuillez sélectionner une catégorie.");
            }

            await productService.create(formData);
            navigate('/vendor/dashboard'); // Rediriger vers le dashboard après succès
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Erreur lors de la création du produit.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 pb-24">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                                <Link to="/vendor/dashboard" className="hover:text-primary transition-colors font-medium">Dashboard</Link>
                                <ChevronRight className="size-4" />
                                <span className="text-slate-900 dark:text-white font-bold">Nouveau produit</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Ajouter un produit</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/vendor/dashboard"
                                className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : <Check className="size-4" />}
                                {isLoading ? 'Publication...' : 'Publier le produit'}
                            </button>
                        </div>
                    </header>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

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
                                            name="nom_produit"
                                            value={formData.nom_produit}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                            placeholder="Ex: Riz local de Boké - 50kg"
                                            type="text"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Catégorie</label>
                                            <select
                                                name="categorie_id"
                                                value={formData.categorie_id}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-medium cursor-pointer"
                                            >
                                                <option value="">Sélectionner une catégorie</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Code SKU (Facultatif)</label>
                                            <input
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-medium"
                                                placeholder="REF-001"
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
                                            </div>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="w-full px-4 py-4 border-none bg-white dark:bg-slate-950 focus:ring-0 transition-all font-medium text-sm leading-relaxed"
                                                placeholder="Détails sur la qualité, la provenance, etc..."
                                                rows="6"
                                            ></textarea>
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
                                    <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20">3</span>
                                    <h2 className="text-lg font-bold">Prix & Inventaire</h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Prix de vente (GNF)</label>
                                        <div className="relative">
                                            <input
                                                name="prix_unitaire"
                                                value={formData.prix_unitaire}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-black text-lg pr-12"
                                                placeholder="0"
                                                type="number"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">GNF</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Quantité en stock</label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleStockChange(-1)}
                                                className="w-12 h-12 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Minus className="size-4" />
                                            </button>
                                            <input
                                                name="stock_quantite"
                                                value={formData.stock_quantite}
                                                onChange={handleChange}
                                                className="flex-1 px-4 py-3 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 font-black text-lg"
                                                type="number"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleStockChange(1)}
                                                className="w-12 h-12 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Plus className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 5. Product Media (Placeholder pour la Phase 1) */}
                            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20">4</span>
                                    <h2 className="text-lg font-bold">Médias</h2>
                                </div>
                                <div className="p-6 text-center">
                                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                                        <Upload className="size-8 text-slate-400" />
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                            Le téléchargement d'images sera activé prochainement.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AddProduct;
