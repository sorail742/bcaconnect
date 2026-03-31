import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import {
    Search,
    Plus,
    Package,
    CheckCircle2,
    Filter,
    Download,
    Edit3,
    Trash2,
    AlertTriangle,
    Image as ImageIcon,
    ChevronDown,
    RefreshCcw,
    Zap
} from 'lucide-react';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const formatGNF = (n) => n?.toLocaleString('fr-GN') + ' GNF';

const STOCK_COLOR = (n) => {
    if (n === 0) return 'text-rose-500';
    if (n <= 10) return 'text-amber-500';
    return 'text-emerald-500';
};

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0, lowStock: 0 });

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        nom_produit: '',
        description: '',
        prix_unitaire: '',
        prix_ancien: '',
        stock_quantite: '',
        categorie_id: '',
        image_url: '',
        statut: 'Publié'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [prods, cats] = await Promise.all([
                productService.getAll(),
                categoryService.getAll()
            ]);
            setProducts(prods || []);
            setCategories(cats || []);

            const total = prods.length;
            const active = prods.filter(p => !p.est_supprime).length;
            const low = prods.filter(p => p.stock_quantite <= 10).length;
            setStats({ total, active, lowStock: low });
        } catch (error) {
            toast.error("Échec de la synchronisation du catalogue.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Révoquer définitivement ce produit du catalogue officiel ?")) return;
        try {
            await productService.delete(id);
            toast.success("Produit révoqué.");
            fetchData();
        } catch (error) {
            toast.error("Erreur d'opération.");
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                nom_produit: product.nom_produit || '',
                description: product.description || '',
                prix_unitaire: product.prix_unitaire || '',
                prix_ancien: product.prix_ancien || '',
                stock_quantite: product.stock_quantite || '',
                categorie_id: product.categorie_id || '',
                image_url: product.image_url || '',
                statut: product.statut || 'Publié'
            });
        } else {
            setEditingProduct(null);
            setFormData({
                nom_produit: '',
                description: '',
                prix_unitaire: '',
                prix_ancien: '',
                stock_quantite: '',
                categorie_id: categories[0]?.id || '',
                image_url: '',
                statut: 'Publié'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await productService.update(editingProduct.id, formData);
                toast.success("Catalogue mis à jour.");
            } else {
                await productService.create(formData);
                toast.success("Nouvelle référence ajoutée.");
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error("Échec de l'enregistrement.");
        }
    };

    const filtered = products.filter(
        (p) =>
            p.nom_produit.toLowerCase().includes(search.toLowerCase()) ||
            p.Store?.nom_boutique?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            label: 'Référence Produit',
            render: (row) => (
                <div className="flex items-center gap-6">
                    <div className="relative group/img">
                        <div
                            className="size-16 rounded-[1.5rem] bg-accent border-4 border-border bg-cover bg-center shadow-premium overflow-hidden group-hover/img:scale-110 group-hover/img:rotate-3 transition-all duration-500"
                            style={{ backgroundImage: `url('${row.image_url || 'https://api.dicebear.com/7.x/abstract/svg?seed=' + row.id}')` }}
                        />
                        {row.stock_quantite === 0 && (
                            <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-[2px] flex items-center justify-center rounded-[1.5rem]">
                                <AlertTriangle className="size-6 text-white drop-shadow-lg" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-xl font-black text-foreground italic tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">
                            {row.nom_produit}
                        </p>
                        <p className="text-executive-label text-muted-foreground/40 font-black uppercase tracking-[0.2em] italic leading-none">{row.Category?.nom || 'CLASSIFICATION N/A'}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Entité Émettrice',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-foreground italic uppercase tracking-widest leading-none">
                        {row.Store?.nom_boutique || 'BCA NETWORK'}
                    </span>
                    <span className="text-[10px] text-muted-foreground/30 font-black tracking-[0.1em] italic">SID: {row.store_id?.slice(0, 8).toUpperCase()}</span>
                </div>
            )
        },
        {
            label: 'Cotation Actuelle',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-lg font-black text-primary italic tracking-tighter text-executive-data leading-none mb-1">{formatGNF(row.prix_unitaire)}</span>
                    {row.prix_ancien && (
                        <span className="text-[10px] text-muted-foreground/30 line-through font-black italic tracking-widest">{formatGNF(row.prix_ancien)}</span>
                    )}
                </div>
            )
        },
        {
            label: 'Inventaire Réel',
            render: (row) => (
                <div className="flex items-center gap-4 px-4 py-2 bg-background border-2 border-border rounded-2xl w-fit shadow-inner group-hover:border-primary/20 transition-colors">
                    <span className={cn("text-xl font-black tracking-tighter italic text-executive-data leading-none pt-0.5", STOCK_COLOR(row.stock_quantite))}>
                        {row.stock_quantite}
                    </span>
                    {row.stock_quantite <= 5 && <Zap className="size-3 text-primary animate-pulse" />}
                </div>
            )
        },
        {
            label: 'Opérations',
            render: (row) => (
                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button
                        onClick={() => handleOpenModal(row)}
                        className="size-12 bg-background border-4 border-border rounded-[1rem] text-muted-foreground/40 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center shadow-premium active:scale-95"
                    >
                        <Edit3 className="size-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="size-12 bg-background border-4 border-border rounded-[1rem] text-muted-foreground/40 hover:text-rose-500 hover:border-rose-500/40 transition-all flex items-center justify-center shadow-premium active:scale-95"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="SUPERVISION DU CATALOGUE">
            <div className="space-y-12 animate-in fade-in duration-700 pb-20">

                {/* ── Header Executive ──────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-border pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                            <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none pt-0.5">Directoire de l'Offre Réseau</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">Gestion des <br /><span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">Stocks.</span></h2>
                        <p className="text-muted-foreground/60 font-medium text-lg italic border-l-4 border-primary/20 pl-8 max-w-xl">Audit, classification et gestion des actifs marchands circulant sur la plateforme BCA Connect.</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchData}
                            className="h-24 w-24 bg-background border-4 border-border rounded-[2.5rem] flex items-center justify-center text-muted-foreground/30 hover:border-primary/40 hover:text-primary transition-all shadow-premium group"
                        >
                            <RefreshCcw className="size-8 group-hover:rotate-180 transition-transform duration-700" />
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="h-24 px-12 bg-primary text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs flex items-center gap-6 shadow-premium-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <Plus className="size-6 group-hover:rotate-90 transition-transform duration-500" />
                            <span className="leading-none pt-1">Nouvelle Réf.</span>
                        </button>
                    </div>
                </div>

                {/* ── Key Indicators ───────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DashboardCard title="RÉFÉRENCES" value={stats.total} icon={Package} trend="up" trendValue="+12.5%" />
                    <DashboardCard title="UNITÉS ACTIVES" value={stats.active} icon={CheckCircle2} trend="up" trendValue="+5.2%" />
                    <div className={cn(
                        "glass-card p-10 rounded-[3rem] border-4 transition-all group shadow-premium hover:shadow-premium-lg",
                        stats.lowStock > 0 ? "border-rose-500/20" : "border-border"
                    )}>
                        <div className="flex justify-between items-start mb-8">
                            <p className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Alerte Ruptures</p>
                            <AlertTriangle className={cn("size-6 transition-transform group-hover:scale-125", stats.lowStock > 0 ? "text-rose-500 animate-bounce" : "text-emerald-500")} />
                        </div>
                        <h3 className={cn("text-4xl font-black italic tracking-tighter text-executive-data", stats.lowStock > 0 ? "text-rose-500" : "text-foreground")}>
                            {stats.lowStock}
                        </h3>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic opacity-40">
                             SEUIL CRITIQUE : 10 UNITÉS
                        </div>
                    </div>
                </div>

                {/* ── Ledger Section ────────────────────────────────── */}
                <div className="glass-card rounded-[4rem] border-4 border-border shadow-premium-lg overflow-hidden">
                    
                    {/* Advanced Toolbar */}
                    <div className="p-10 border-b-4 border-border flex flex-col xl:flex-row gap-10 bg-accent/20">
                        <div className="relative group/search flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 size-6 group-focus-within/search:text-primary transition-all" />
                            <input
                                className="w-full h-20 pl-16 pr-8 bg-background border-4 border-transparent focus:border-primary/40 rounded-[1.5rem] text-sm font-black italic uppercase tracking-widest placeholder:text-muted-foreground/20 shadow-inner outline-none transition-all"
                                placeholder="INDEXER UNE RÉFÉRENCE, BOUTIQUE..."
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button className="h-20 w-20 bg-background border-4 border-border rounded-[1.5rem] flex items-center justify-center text-muted-foreground/30 hover:border-primary/40 hover:text-primary transition-all shadow-inner group">
                                <Filter className="size-6 group-hover:scale-110 transition-transform" />
                            </button>
                            <button className="h-20 px-8 bg-foreground text-background border-4 border-foreground rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-primary hover:border-primary transition-all flex items-center gap-4">
                                <Download className="size-4" />
                                EXPORTER CATALOGUE
                            </button>
                        </div>
                    </div>

                    <DataTable
                        title="Catalogue Officiel v4"
                        columns={columns}
                        data={filtered}
                        isLoading={isLoading}
                        noHeader
                    />
                    
                    <div className="p-12 border-t-4 border-border bg-accent/10 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <p className="text-executive-label font-black text-muted-foreground/30 italic tracking-[0.3em] uppercase">
                            INDEXATION GLOBALE : {filtered.length} RÉFÉRENCES DÉPLOYÉES
                        </p>
                        <div className="flex gap-4">
                            <button className="h-16 px-10 border-4 border-border rounded-2xl bg-background font-black uppercase tracking-widest text-[10px] italic hover:border-primary/40 transition-all shadow-premium active:scale-95">
                                Page Suivante
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Form Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingProduct ? "MAJ DOSSIER PRODUIT" : "ENREGISTREMENT CATALOGUE"}
            >
                <form onSubmit={handleSubmit} className="space-y-10 p-4">
                    <div className="space-y-4">
                        <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Désignation Commerciale</label>
                        <input
                            required
                            className="w-full h-16 px-8 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-sm font-black italic uppercase tracking-widest outline-none transition-all shadow-inner"
                            placeholder="EX: ORDINATEUR PORTABLE HIGH-TECH"
                            value={formData.nom_produit}
                            onChange={(e) => setFormData({ ...formData, nom_produit: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Cotation (GNF)</label>
                            <input
                                type="number"
                                required
                                className="w-full h-16 px-8 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-sm font-black italic outline-none transition-all shadow-inner"
                                placeholder="0"
                                value={formData.prix_unitaire}
                                onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Stock Alloué</label>
                            <input
                                type="number"
                                required
                                className="w-full h-16 px-8 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-sm font-black italic outline-none transition-all shadow-inner"
                                placeholder="0"
                                value={formData.stock_quantite}
                                onChange={(e) => setFormData({ ...formData, stock_quantite: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Classification</label>
                        <div className="relative group/select">
                            <select
                                className="w-full h-16 px-8 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-[10px] font-black uppercase tracking-widest italic outline-none transition-all shadow-inner appearance-none"
                                value={formData.categorie_id}
                                onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                            >
                                {categories.map(c => <option key={c.id} value={c.id}>{c.nom.toUpperCase()}</option>)}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/20 group-hover/select:text-primary transition-colors pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Média Haute-Définition (URL)</label>
                        <div className="relative group">
                            <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-xs font-medium italic outline-none transition-all shadow-inner"
                                placeholder="HTTPS://IMAGES.BCA.GN/PROD_01.JPG"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-6 pt-10">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 h-20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-foreground hover:bg-accent transition-all italic underline decoration-4 underline-offset-8 decoration-transparent hover:decoration-border"
                        >
                            Annuler l'Édition
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-white h-20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-premium-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all italic leading-none"
                        >
                            {editingProduct ? "ACTUALISER BASE" : "INSCRIRE RÉFÉRENCE"}
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdminProducts;
