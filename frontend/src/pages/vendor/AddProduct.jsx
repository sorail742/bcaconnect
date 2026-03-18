import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Package,
    Image as ImageIcon,
    Tag,
    Layers,
    ArrowLeft,
    Save,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Box
} from 'lucide-react';
import axios from 'axios';

const AddProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // État du formulaire
    const [formData, setFormData] = useState({
        nom_produit: '',
        description: '',
        prix_unitaire: '',
        prix_ancien: '',
        stock_quantite: '',
        image_url: '',
        categorie_id: '',
        est_local: true
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Chargement des données (Initialisation)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Charger les catégories
                const catRes = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
                setCategories(catRes.data);

                // 2. Si mode édition, charger le produit
                if (isEditMode) {
                    const prodRes = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`);
                    const p = prodRes.data;
                    setFormData({
                        nom_produit: p.nom_produit,
                        description: p.description || '',
                        prix_unitaire: p.prix_unitaire,
                        prix_ancien: p.prix_ancien || '',
                        stock_quantite: p.stock_quantite,
                        image_url: p.image_url || '',
                        categorie_id: p.categorie_id || '',
                        est_local: p.est_local
                    });
                }
            } catch (err) {
                console.error("Erreur de chargement:", err);
                setError("Impossible de charger les données nécessaires.");
            }
        };

        fetchData();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const endpoint = isEditMode
                ? `${import.meta.env.VITE_API_URL}/products/${id}`
                : `${import.meta.env.VITE_API_URL}/products`;

            const method = isEditMode ? 'put' : 'post';

            await axios[method](endpoint, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setSuccess(true);
            setTimeout(() => navigate('/vendor/products'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-lg border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 text-slate-600"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Retour</span>
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">
                        {isEditMode ? "Modifier le produit" : "Ajouter un nouveau produit"}
                    </h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                        <CheckCircle2 size={20} />
                        <p className="text-sm font-medium">Produit enregistré avec succès ! Redirection...</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Colonne Gauche : Infos Générales */}
                    <div className="md:col-span-2 space-y-6">
                        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                <Package size={18} />
                                <h2 className="font-semibold">Informations de base</h2>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NOM DU PRODUIT</label>
                                <input
                                    type="text"
                                    name="nom_produit"
                                    required
                                    value={formData.nom_produit}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Ex: Sac de Riz 50kg..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">DESCRIPTION</label>
                                <textarea
                                    name="description"
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                    placeholder="Décrivez les caractéristiques du produit..."
                                ></textarea>
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                                <ImageIcon size={18} />
                                <h2 className="font-semibold">Médias & Image</h2>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URL DE L'IMAGE</label>
                                <input
                                    type="url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Lien de l'image (Ex: https://...)"
                                />
                            </div>
                            {formData.image_url && (
                                <div className="mt-4 aspect-video rounded-2xl border border-slate-100 overflow-hidden bg-slate-50">
                                    <img
                                        src={formData.image_url}
                                        alt="Aperçu"
                                        className="w-full h-full object-contain"
                                        onError={(e) => e.target.src = 'https://placehold.co/600x400?text=Image+Invalide'}
                                    />
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Colonne Droite : Prix, Stock, Catégorie */}
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                <DollarSign size={18} />
                                <h2 className="font-semibold">Prix & Stock</h2>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PRIX DE VENTE (GNF)</label>
                                <input
                                    type="number"
                                    name="prix_unitaire"
                                    required
                                    value={formData.prix_unitaire}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PRIX BARRÉ (OPTIONNEL)</label>
                                <input
                                    type="number"
                                    name="prix_ancien"
                                    value={formData.prix_ancien}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-400"
                                />
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">STOCK DISPONIBLE</label>
                                <div className="flex items-center gap-3">
                                    <Box className="text-slate-400" size={20} />
                                    <input
                                        type="number"
                                        name="stock_quantite"
                                        required
                                        value={formData.stock_quantite}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-purple-600 mb-2">
                                <Layers size={18} />
                                <h2 className="font-semibold">Classification</h2>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CATÉGORIE</label>
                                <select
                                    name="categorie_id"
                                    value={formData.categorie_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="est_local"
                                    name="est_local"
                                    checked={formData.est_local}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="est_local" className="text-sm font-medium text-slate-700">Produit local (Guinée)</label>
                            </div>
                        </section>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-3xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save size={20} />
                            )}
                            {isEditMode ? "Enregistrer les modifications" : "Publier le produit"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AddProduct;
