import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardCard from '../../components/ui/DashboardCard';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    LayoutGrid,
    Filter,
    MoreVertical,
    CheckCircle2,
    Package,
    AlertCircle,
    History
} from 'lucide-react';

const Products = () => {
    const products = [
        {
            id: 1,
            name: 'iPhone 15 Pro Max',
            desc: '256GB - Titane Noir',
            sku: 'SKU-IP15PM-256-BK',
            category: 'Électronique',
            price: 14790000,
            stock: 42,
            status: 'En stock',
            statusVariant: 'success',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyGK-PfU42VrgWllIjBto9H_v2MvwWr_NXW1Oe2RpBilpsDYo_deAZ3EyHCsSFWdO4qtXwtPtZXQaJ2-zPWXy8Gi-Lq4XKCS_jIrgn62Z_T3AhKllDLH0GtPtajv5TkMhtLaUypqJSHHRoPTOKcR0Vq9U0ABqBJOTJvlAm6lSuHD43hU9KxA0x9lRfVjbureUmyVdo4TrDP4SbOo4mxWKp992CSW_-gtxK2NwDLpGSjgJIOWD_ry433C_6F8ckmTNNqVc2E7mesj6U'
        },
        {
            id: 2,
            name: 'Sony WH-1000XM5',
            desc: 'Casque Réduction de Bruit',
            sku: 'SKU-SN-XM5-SL',
            category: 'Audio',
            price: 3490000,
            stock: 5,
            status: 'Stock faible',
            statusVariant: 'warning',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7xUJ81-6kHCWa7_0lIEyhfHUMlxIFlRjK9XmYwBmIzxtLQ-cEEind_zzvDLnWWD4hh1eJD7XHRhUIiZhz2aAB2RRceKx_q768WpqtoZsYvfRSfshs2VTaWqIS3i51j2pan5qprCI4qWLN74IrbrkganVbH_qY3OwQv5I-Wx5AX2OwcrJwSqXBr_Vv53oGM06bgj9HSx1Iw4f971WFqXAsUN9UTjUrvh8El9qa9hcg70qOsmNTjUbEiYeQNVg4W2lanShh6CXNhmL6'
        },
        {
            id: 3,
            name: 'Logitech G Pro X Superlight',
            desc: 'Souris Gaming Sans Fil',
            sku: 'SKU-LG-GPXS-WH',
            category: 'Informatique',
            price: 1290000,
            stock: 0,
            status: 'Rupture',
            statusVariant: 'danger',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVx6Y8qXBdmkd4zJr_zniUJh2KsmZkSpP0Wivv_gUGnzF9O70BKVTSkb5KPZrORzN5VuhZsfIhImjNx3rAzObZHWj6fL9BYU0O_Ce3e8jyKTIH5ifvFtW7FIifwyNEgmUq1We4SsPcV_OAC15WAkl8AS6IVZ1MU-SSDp_d-iXj6QCdtIRshycBrH7aBUICbOCEgRRJvhl3okR08BAs62b9nvu9YSP5eH6XlMSL3TbmGoo6kz3cmcPkD00ObBjBg6woI5Exq600ltJ5'
        },
        {
            id: 4,
            name: 'Keychron Q1 Pro',
            desc: 'Clavier Mécanique QMK/VIA',
            sku: 'SKU-KC-Q1P-GR',
            category: 'Informatique',
            price: 1990000,
            stock: 18,
            status: 'En stock',
            statusVariant: 'success',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_rDa7mxDC8shvXbZvkVCO9Hqj0Bxwg8bvvZsDWROX4djRCts9PBsczH_1RN4QIHMNmYshJ8tbIZO1BaOcHMJYaKbGJ1mQwQIQtq0rywaT4KBR8wNI0QRBNvaY-7HjP-h-ZAqky129BN1ShJFgqOcWOrY53iiovrYMTKCYh5gJuIS5DeXbLP4ljEGv4c0lh9Ky_yybtrgo_OrMtY_UPimyDNqfDMkeAqBt28g1lMkjNALjGIQ7W1bn7az44OilFf_wpMIKNNqoJ522'
        },
    ];

    const productColumns = [
        {
            label: 'Produit',
            render: (row) => (
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                        <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{row.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{row.desc}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'SKU',
            render: (row) => <span className="text-xs text-slate-500 font-mono tracking-tighter">{row.sku}</span>
        },
        {
            label: 'Catégorie',
            render: (row) => (
                <span className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-black uppercase text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {row.category}
                </span>
            )
        },
        {
            label: 'Prix (GNF)',
            render: (row) => <span className="text-sm font-black text-slate-900 dark:text-white">{row.price.toLocaleString('fr-FR')}</span>
        },
        {
            label: 'Stock',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full bg-${row.statusVariant === 'success' ? 'emerald' : row.statusVariant === 'warning' ? 'amber' : 'red'}-500 animate-pulse`}></span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{row.stock} {row.status}</span>
                </div>
            )
        },
        {
            label: 'Actions',
            render: () => (
                <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-primary bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-all hover:scale-110">
                        <Edit3 className="size-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-all hover:scale-110">
                        <Trash2 className="size-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <MoreVertical className="size-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Gestion des Produits">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary/20">1.284 Articles</span>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-xl transition-all shadow-xl shadow-primary/20 uppercase tracking-widest">
                        <Plus className="size-4" />
                        Ajouter un produit
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-400"
                            placeholder="Rechercher un produit, SKU, ou code EAN..."
                            type="text"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-primary transition-colors">
                        <LayoutGrid className="size-4 text-slate-400" />
                        Catégorie
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-primary transition-colors">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        En stock
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest">
                        <Filter className="size-4" />
                        Plus de filtres
                    </button>
                </div>

                {/* Product Table */}
                <DataTable
                    columns={productColumns}
                    data={products}
                />

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard title="Valeur Totale Stock" value="4.582.900.000 GNF" icon={Package} trend="up" trendValue="+12.5%" description="vs Octobre" />
                    <DashboardCard title="Articles en Rupture" value="14 Articles" icon={AlertCircle} trend="down" trendValue="Urgent" description="Attention requise" />
                    <DashboardCard title="Commandes en attente" value="32" icon={History} trend="neutral" trendValue="Aujourd'hui" description="À expédier avant 18h" />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Products;
