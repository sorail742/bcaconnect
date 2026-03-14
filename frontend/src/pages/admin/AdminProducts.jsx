import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import {
    Search,
    Plus,
    Package,
    CheckCircle2,
    Clock,
    Filter,
    Download,
    Edit3,
    EyeOff,
} from 'lucide-react';

const PRODUCTS = [
    {
        id: 1,
        name: 'Ordinateur Portable HP 250',
        sku: 'SKU-29841',
        supplier: 'Conakry Tech SARL',
        category: 'Électronique',
        price: 12490000,
        stock: 45,
        status: 'Publié',
        statusColor: 'success',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUAoGoF-6TaRym64hABNMOmQfapBTQt1cjuWNQU4lfR4Nc89t49NiRbeia0TBlEslPa10qQZckUGvugy6lrKTt7Q_-Zw8Qnoln16wQ7h38uM-twguNx82GIPoZi2fnrhIggIGspV2jWQNlwnli04xQ_EQdID9TdksMXSb5teah9LFEG1BL0e8o72GbplJ-QLIZewKICkB4vrEiK_lrh2dI_a87L0XJOEYrMYlDevaOPK09PEBOEa-9J5h3JaMZOMeFX1oKiyRZVjtU',
    },
    {
        id: 2,
        name: 'Chaise Ergonomique Air',
        sku: 'SKU-10293',
        supplier: 'Meuble Plus Guinée',
        category: 'Mobilier',
        price: 2890000,
        stock: 8,
        status: 'En attente',
        statusColor: 'warning',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS6bwJ8ePC0BSW3hWMm-aoKg852fjl-6i9n5oIVh2DM4q21rXwtNJb2VORxzQNbBEhAck-VSY5xGFFaHGoiMC53qFBOdEmrqXY5ldc6z5roU8aZByLckGBeatMZnzm5M3kbFC1a43-tsCbtWYKZ79mUhAmiF6DqaDwux6BmmOx--pF0nZmRNNo3rCG1rP7rMBWmblcWF85WqhiABkkiiCRNh_XBwXdfHdlOHPDqH0YV6vBsMosu7eYWDw1V5W1sLjoMJ8N_rgq4t12',
    },
    {
        id: 3,
        name: 'Sony WH-1000XM5',
        sku: 'SKU-33210',
        supplier: 'AudioPro Guinée',
        category: 'Électronique',
        price: 3990000,
        stock: 0,
        status: 'Signalé',
        statusColor: 'danger',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPBqZjy8zmy8oVf9pQ3_gi6Ga47pD0ggaFnc4wnoVqYPx50v_k7xoYLfhD4LqC_G53IatayLbS0TZOmA2KlUQwuqj0qVlk0OcU8_5ogYgFwByrdViake1vkGEhYGjyF5x2l0N9gJYy_OgNT9257amRwcPTRM-YWLalqhDZY9DnzgvrCBjAFNF5Z9g6vRrx0nQp4D6G7xxXJ_nZM5BcF3SMgAE_qmGV6UycExQLR4RXoEQQgEfHklEQG0qw2lizoXI50uXX9nfTBgGN',
    },
    {
        id: 4,
        name: "Pack Eau Minérale 12×1L",
        sku: 'SKU-88219',
        supplier: 'BCA Logistics GN',
        category: 'Consommables',
        price: 129000,
        stock: 542,
        status: 'Publié',
        statusColor: 'success',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjS8iCbR84oc5c35B65vMQqfu4fgz3CxJFu9qofBSD9F9Gtm0pfGTR7TFzLpxr_qg2YWrwrFzLzHXrLUWDDdgX19W4zsz6pgho9-LPXBSIs7mQQGmzFV66qkWafHdQnMtM6pKF4NZZS--5knhDZBeF-D1bnH7gM66gBahWyE__yJvAsdQvcGWK-tNp83qsugczsvpgSUCOep-rpoDV310vtSYq_W74X1k4tpvRSDj83oU8IY7FFiCJKsbFMvsoV8ers7h_NVnjpRBu',
    },
];

const STOCK_COLOR = (n) => {
    if (n === 0) return 'text-red-600';
    if (n <= 10) return 'text-amber-600';
    return 'text-emerald-600';
};

const formatGNF = (n) => n.toLocaleString('fr-FR') + ' GNF';

const AdminProducts = () => {
    const [search, setSearch] = useState('');

    const filtered = PRODUCTS.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase()) ||
            p.supplier.toLowerCase().includes(search.toLowerCase()),
    );

    const columns = [
        {
            label: 'Produit',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div
                        className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${row.image}')` }}
                    />
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {row.name}
                        </p>
                        <p className="text-xs text-slate-500">{row.sku}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Fournisseur',
            render: (row) => <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.supplier}</span>
        },
        {
            label: 'Catégorie',
            render: (row) => <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">{row.category}</span>
        },
        {
            label: 'Prix',
            render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatGNF(row.price)}</span>
        },
        {
            label: 'Stock',
            render: (row) => <span className={`font-bold ${STOCK_COLOR(row.stock)}`}>{row.stock}</span>
        },
        {
            label: 'Statut',
            render: (row) => <StatusBadge status={row.status} variant={row.statusColor} />
        },
        {
            label: 'Actions',
            render: () => (
                <div className="flex justify-end gap-2">
                    <button
                        className="p-1.5 hover:bg-primary/10 rounded-lg text-slate-400 hover:text-primary transition-colors"
                        title="Modifier"
                    >
                        <Edit3 className="size-5" />
                    </button>
                    <button
                        className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                        title="Désactiver"
                    >
                        <EyeOff className="size-5" />
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
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                            <input
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                                placeholder="Rechercher..."
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm">
                        <Plus className="size-5" />
                        Nouveau Produit
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard title="Total Produits" value="1 284" icon={Package} trend="up" trendValue="+12.5%" />
                    <DashboardCard title="Produits Actifs" value="1 150" icon={CheckCircle2} trend="up" trendValue="+5.2%" />
                    <DashboardCard title="En attente de révision" value="34" icon={Clock} trend="neutral" trendValue="8 urgents" />
                </div>

                {/* Table */}
                <DataTable
                    title="Liste du Catalogue"
                    columns={columns}
                    data={filtered}
                    actions={(
                        <>
                            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
                                <Filter className="size-4" />
                                Filtrer
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
                                <Download className="size-4" />
                                Exporter
                            </button>
                        </>
                    )}
                />
            </div>
        </DashboardLayout>
    );
};

export default AdminProducts;
