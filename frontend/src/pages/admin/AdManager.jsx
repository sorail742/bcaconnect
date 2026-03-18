import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Plus, BarChart3, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdManager = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAd, setNewAd] = useState({
        titre: '',
        contenu: '',
        url_image: '',
        url_destination: '',
        format: 'banner',
        date_debut: '',
        date_fin: '',
        budget_total: 500000,
        ciblage: { role_cible: 'all' }
    });

    const fetchAds = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/ads/serve`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAds(response.data);
        } catch (error) {
            console.error("Erreur chargement publicités:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/ads`, newAd, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Publicité créée avec succès !");
            setIsModalOpen(false);
            fetchAds();
        } catch (error) {
            toast.error("Erreur lors de la création");
        }
    };

    return (
        <DashboardLayout title="Gestion des Publicités">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground">Gérez vos campagnes publicitaires et suivez leurs performances.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        <Plus className="size-5" />
                        Nouvelle Campagne
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p>Chargement...</p>
                    ) : ads.map(ad => (
                        <div key={ad.id} className="bg-card border border-border rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ad.statut === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {ad.statut}
                                </span>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-muted rounded-full"><Edit className="size-4" /></button>
                                    <button className="p-2 hover:bg-muted rounded-full text-destructive"><Trash2 className="size-4" /></button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold mb-2">{ad.titre}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{ad.contenu}</p>

                            <div className="flex items-center gap-4 py-4 border-y border-border mb-4">
                                <div className="flex-1 text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-black">Impressions</p>
                                    <p className="text-xl font-black">0</p>
                                </div>
                                <div className="w-px h-8 bg-border"></div>
                                <div className="flex-1 text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-black">Clics</p>
                                    <p className="text-xl font-black">0</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="size-3" />
                                    Fin le {new Date(ad.date_fin).toLocaleDateString()}
                                </div>
                                <div className="font-bold text-primary">
                                    {ad.budget_restant} / {ad.budget_total} GNF
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de création simplifiée */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black mb-6">Nouvelle Publicité</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black uppercase tracking-widest ml-1">Titre</label>
                                    <input
                                        type="text"
                                        className="w-full h-12 bg-muted/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary/50"
                                        value={newAd.titre}
                                        onChange={e => setNewAd({ ...newAd, titre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black uppercase tracking-widest ml-1">Ciblage Rôle</label>
                                    <select
                                        className="w-full h-12 bg-muted/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary/50"
                                        value={newAd.ciblage.role_cible}
                                        onChange={e => setNewAd({ ...newAd, ciblage: { ...newAd.ciblage, role_cible: e.target.value } })}
                                    >
                                        <option value="all">Tous</option>
                                        <option value="client">Clients</option>
                                        <option value="vendor">Vendeurs</option>
                                        <option value="delivery">Transporteurs</option>
                                    </select>
                                </div>
                            </div>
                            {/* Autres champs simplifiés pour le MVP */}
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-widest ml-1">Contenu</label>
                                <textarea
                                    className="w-full h-24 bg-muted/50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/50 resize-none"
                                    value={newAd.contenu}
                                    onChange={e => setNewAd({ ...newAd, contenu: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black uppercase tracking-widest ml-1">Date de fin</label>
                                    <input
                                        type="date"
                                        className="w-full h-12 bg-muted/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary/50"
                                        value={newAd.date_fin}
                                        onChange={e => setNewAd({ ...newAd, date_fin: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black uppercase tracking-widest ml-1">Budget (GNF)</label>
                                    <input
                                        type="number"
                                        className="w-full h-12 bg-muted/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary/50"
                                        value={newAd.budget_total}
                                        onChange={e => setNewAd({ ...newAd, budget_total: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-12 rounded-2xl bg-muted font-bold text-sm tracking-widest"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 h-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest"
                                >
                                    Lancer la Campagne
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdManager;
