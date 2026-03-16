import React, { useState } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { Search, Users, Star, Store, ArrowRight, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { Skeleton, TableRowSkeleton } from '../components/ui/Loader';
import { ErrorState, EmptyState } from '../components/ui/StatusStates';

const VendorsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const isLoading = false;
    const hasError = false;

    const vendors = [
        { id: '#V-001', name: 'Atelier Créatif Conakry', category: 'Artisanat', rating: 4.8, location: 'Kaloum', status: 'Vérifié', statusColor: 'success', sales: '1.2k', products: 45, items: ['Poterie', 'Tissage'] },
        { id: '#V-002', name: 'TechStore GN', category: 'Électronique', rating: 4.5, location: 'Dixinn', status: 'Vérifié', statusColor: 'success', sales: '850', products: 120, items: ['Smartphones', 'Laptops'] },
        { id: '#V-003', name: 'Mode Africaine', category: 'Vêtements', rating: 4.9, location: 'Ratoma', status: 'Vérifié', statusColor: 'success', sales: '2.4k', products: 85, items: ['Bazin', 'Lépi'] },
        { id: '#V-004', name: 'Alim Express', category: 'Alimentation', rating: 4.2, location: 'Matam', status: 'Nouveau', statusColor: 'info', sales: '120', products: 30, items: ['Fonio', 'Miel'] },
        { id: '#V-005', name: 'Meubles Confort', category: 'Mobilier', rating: 4.6, location: 'Matoto', status: 'Vérifié', statusColor: 'success', sales: '450', products: 25, items: ['Salons', 'Bureaux'] }
    ];

    const columns = [
        {
            label: 'Marchand',
            render: (row) => (
                <div className="flex items-center gap-4 py-2">
                    <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:scale-105 transition-all duration-500 border border-border group-hover:border-primary/30 relative">
                        <Store className="size-6" />
                        {row.status === 'Vérifié' && (
                            <div className="absolute -top-1 -right-1 size-5 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                                <ShieldCheck className="size-3" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-base font-black text-foreground leading-none italic tracking-tight">{row.name}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{row.id}</span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-bold uppercase">{row.category}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            label: 'Localisation',
            render: (row) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-3 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">{row.location}, Guinée</span>
                </div>
            )
        },
        {
            label: 'Performances',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-foreground italic">{row.sales}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">ventes</span>
                    </div>
                    <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                </div>
            )
        },
        {
            label: 'Confiance',
            render: (row) => (
                <div className="flex items-center gap-2 group/score">
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
                        <Star className="size-3 fill-amber-500" />
                        <span className="text-xs font-black italic">{row.rating}</span>
                    </div>
                </div>
            )
        },
        {
            label: 'Statut',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <StatusBadge status={row.status} variant={row.statusColor} />
                </div>
            )
        },
        {
            label: 'Action',
            render: () => (
                <Button variant="ghost" className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 group/btn border border-transparent hover:border-primary/20 transition-all">
                    Profil Marchand
                    <ArrowRight className="size-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
            )
        }
    ];

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PublicLayout>
            <div className="w-full space-y-10 animate-in fade-in duration-700 font-inter pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-10">
                {/* Premium Header */}
                <div className="relative py-12 px-10 rounded-[2rem] bg-card border border-border overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 items-start md:items-end">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">Annuaire des Marchands</span>
                            <h2 className="text-4xl md:text-5xl font-black text-foreground italic tracking-tighter leading-none">
                                Collaborez avec les leaders <br />
                                <span className="text-primary not-italic text-3xl md:text-4xl">du commerce guinéen.</span>
                            </h2>
                            <p className="text-muted-foreground font-medium max-w-xl">Chaque vendeur sur BCA Connect est rigoureusement vérifié pour garantir une expérience d'achat sécurisée et de haute qualité.</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] gap-3 border-border hover:border-primary hover:text-primary transition-all shadow-sm">
                                <ExternalLink className="size-4" />
                                Guide Vendeur
                            </Button>
                            <Button className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
                                Devenir Partenaire
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Search & Stats Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Card className="lg:col-span-2 p-4 rounded-2xl border-border bg-card/50 backdrop-blur-sm shadow-sm group">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="text"
                                placeholder="Rechercher un marchand, une catégorie, une ville..."
                                className="pl-12 h-14 bg-transparent border-none focus:ring-0 text-base font-medium placeholder:text-muted-foreground/60 shadow-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-border bg-card flex items-center gap-4 group hover:border-primary/30 transition-all cursor-default overflow-hidden relative">
                        <div className="absolute top-0 right-0 size-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary relative z-10">
                            <Users className="size-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Marchands Actifs</p>
                            <h4 className="text-xl font-black italic tracking-tighter text-foreground">1.250 +</h4>
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-border bg-card flex items-center gap-4 group hover:border-primary/30 transition-all cursor-default overflow-hidden relative">
                        <div className="absolute top-0 right-0 size-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 relative z-10">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Taux de Confiance</p>
                            <h4 className="text-xl font-black italic tracking-tighter text-foreground">98.4%</h4>
                        </div>
                    </Card>
                </div>

                {/* Directory Table */}
                <Card className="rounded-[2rem] border-border overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-card">
                    <CardHeader className="border-b border-border py-6 bg-muted/20 px-8">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3">
                                <Users className="size-4 text-primary" /> Annuaire Interactif
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Temps réel</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="divide-y divide-border/50">
                                {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                            </div>
                        ) : hasError ? (
                            <div className="p-10">
                                <ErrorState />
                            </div>
                        ) : filteredVendors.length > 0 ? (
                            <DataTable
                                columns={columns}
                                data={filteredVendors}
                                className="border-none shadow-none"
                            />
                        ) : (
                            <div className="p-10">
                                <EmptyState
                                    title="Aucun marchand"
                                    description="Aucun marchand ne correspond à votre recherche."
                                    icon={Store}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Premium Pagination */}
                <div className="flex items-center justify-between px-8">
                    <p className="text-sm text-muted-foreground font-medium">Affichage de <span className="text-foreground font-black italic">1-5</span> sur 42 marchands sélectionnés</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 border-border font-bold">Précédent</Button>
                        <div className="flex items-center gap-1">
                            <Button size="sm" className="rounded-xl size-10 font-black italic">1</Button>
                            <Button variant="ghost" size="sm" className="rounded-xl size-10 font-bold hover:bg-muted">2</Button>
                            <Button variant="ghost" size="sm" className="rounded-xl size-10 font-bold hover:bg-muted">3</Button>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 border-border font-bold">Suivant</Button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default VendorsList;
