import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import DashboardCard from '../../components/ui/DashboardCard';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    LayoutGrid,
    Filter,
    CheckCircle2,
    Package,
    AlertCircle,
    History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const Products = () => {
    const navigate = useNavigate();
    const [realProducts, setRealProducts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');

    const fetchProducts = async () => {
        try {
            const data = await productService.getAll();
            setRealProducts(data);
        } catch (err) {
            console.error("Erreur chargement produits:", err);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            try {
                await productService.delete(id);
                fetchProducts();
            } catch (err) {
                alert("Erreur lors de la suppression.");
            }
        }
    };

    const filteredProducts = realProducts.filter(p =>
        p.nom_produit.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const productColumns = [
        {
            label: 'Produit',
            render: (row) => (
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                        <Package className="size-6 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{row.nom_produit}</p>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1">{row.description}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Catégorie',
            render: (row) => (
                <span className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-black uppercase text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {row.categorie?.nom_categorie || 'N/A'}
                </span>
            )
        },
        {
            label: 'Prix (GNF)',
            render: (row) => <span className="text-sm font-black text-slate-900 dark:text-white">{parseFloat(row.prix_unitaire).toLocaleString('fr-GN')}</span>
        },
        {
            label: 'Stock',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${row.stock_quantite > 10 ? 'bg-emerald-500' : row.stock_quantite > 0 ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`}></span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{row.stock_quantite} unités</span>
                </div>
            )
        },
        {
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/vendor/products/edit/${row.id}`)}
                        className="p-2 text-slate-400 hover:text-primary bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-all hover:scale-110"
                    >
                        <Edit3 className="size-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-all hover:scale-110"
                    >
                        <Trash2 className="size-4" />
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
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary/20">{filteredProducts.length} Articles</span>
                    </div>
                    <button
                        onClick={() => navigate('/vendor/products/add')}
                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-xl transition-all shadow-xl shadow-primary/20 uppercase tracking-widest"
                    >
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
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            type="text"
                        />
                    </div>
                </div>

                {/* Product Table */}
                <DataTable
                    columns={productColumns}
                    data={filteredProducts}
                />

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard title="Valeur Totale Stock" value={`${filteredProducts.reduce((acc, p) => acc + (parseFloat(p.prix_unitaire) * p.stock_quantite), 0).toLocaleString('fr-GN')} GNF`} icon={Package} />
                    <DashboardCard title="Articles en Rupture" value={`${filteredProducts.filter(p => p.stock_quantite === 0).length} Articles`} icon={AlertCircle} />
                    <DashboardCard title="Commandes en attente" value="0" icon={History} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Products;
