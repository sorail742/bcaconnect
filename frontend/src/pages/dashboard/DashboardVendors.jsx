import React, { useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { useVendors } from '../../hooks/useDomainData';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, MapPin, Star, Building2, ExternalLink, Search, Filter, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardVendors = () => {
    const { t } = useLanguage();
    const { data: vendorsData, loading } = useVendors();

    const vendorsDataRaw = useMemo(() => Array.isArray(vendorsData) ? vendorsData : [], [vendorsData]);

    // Local filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [filterVerified, setFilterVerified] = useState(false);

    // Categories derived from data
    const categories = useMemo(() => {
        const cats = new Set(vendorsDataRaw.map(v => v.categorie_principale).filter(Boolean));
        return ['all', ...Array.from(cats)];
    }, [vendorsDataRaw]);

    // Apply filters
    const vendors = useMemo(() => {
        return vendorsDataRaw.filter(vendor => {
            const matchesSearch = !searchQuery || 
                vendor.nom_boutique?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                vendor.localisation?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesCat = selectedCategory === 'all' || vendor.categorie_principale === selectedCategory;
            const matchesVerified = !filterVerified || vendor.is_verified;
            
            return matchesSearch && matchesCat && matchesVerified;
        });
    }, [vendorsDataRaw, searchQuery, selectedCategory, filterVerified]);
    const columns = [
        {
            key: 'nom_boutique',
            label: 'Fournisseur',
            render: (v) => (
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center border border-border">
                        {v.logo_url ? (
                            <img src={v.logo_url} alt="" className="size-full object-contain p-1 rounded-xl" />
                        ) : (
                            <Building2 className="size-5 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            {v.nom_boutique}
                            {v.is_verified && <ShieldCheck className="size-3.5 text-emerald-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{v.categorie_principale || 'Non spécifié'}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'localisation',
            label: 'Localisation',
            render: (v) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {v.localisation || 'Guinée'}
                </div>
            )
        },
        {
            key: 'rating',
            label: 'Note',
            render: (v) => (
                <div className="flex items-center gap-1.5">
                    <Star className="size-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold">{v.rating || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'statut',
            label: 'Statut',
            render: (v) => <StatusBadge status={v.statut} />
        },
        {
            key: 'actions',
            label: '',
            render: (v) => (
                <Link
                    to={`/shop/${v.slug}`}
                    className="p-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-lg transition-colors inline-flex"
                    title="Voir la boutique"
                >
                    <ExternalLink className="size-4" />
                </Link>
            )
        }
    ];

    return (
        <DashboardLayout title="Liste des Fournisseurs">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Fournisseurs</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Consultez la liste des fournisseurs et partenaires accrédités sur BCA Connect.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, localisation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 h-10 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 sm:flex-none min-w-[150px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full pl-9 pr-8 h-10 bg-background border border-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                            >
                                <option value="all">Toutes les catégories</option>
                                {categories.filter(c => c !== 'all').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => setFilterVerified(!filterVerified)}
                            className={`h-10 px-4 rounded-xl text-sm font-medium border flex items-center gap-2 transition-colors whitespace-nowrap ${
                                filterVerified 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' 
                                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <CheckCircle2 className="size-4" />
                            Accrédités
                        </button>
                    </div>
                </div>

                <div className="glass-card rounded-2xl border border-border overflow-hidden">
                    <DataTable 
                        data={vendors}
                        columns={columns}
                        loading={loading}
                        searchable={false}
                        emptyMessage="Aucun fournisseur trouvé"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardVendors;
