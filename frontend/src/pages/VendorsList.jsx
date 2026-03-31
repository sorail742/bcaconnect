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

import storeService from '../services/storeService';
import { useNavigate, Link } from 'react-router-dom';

const VendorsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [vendors, setVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchVendors = async () => {
            try {
                const data = await storeService.getAllStores();
                setVendors(data);
            } catch (error) {
                console.error("Erreur chargement vendeurs:", error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const columns = [
        {
            label: 'MARCHAND / ENTITÉ',
            render: (row) => (
                <div className="flex items-center gap-6 py-4 group/vendor">
                    <div className="size-16 rounded-[1.5rem] bg-background border-4 border-border flex items-center justify-center text-primary group-hover/vendor:rotate-6 group-hover/vendor:scale-110 transition-all duration-500 shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 group-hover/vendor:bg-primary/10 transition-colors" />
                        <Store className="size-8 relative z-10" />
                        {row.status === 'Vérifié' && (
                            <div className="absolute -top-1 -right-1 size-6 bg-primary text-white rounded-full flex items-center justify-center shadow-premium border-4 border-background z-20">
                                <ShieldCheck className="size-3" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-1.5 focus-ring rounded-lg p-1">
                        <p className="text-lg font-black text-foreground leading-none italic tracking-tighter uppercase">{row.nom_boutique}</p>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] italic border-l-2 border-primary/20 pl-2">ID: {row.id.slice(0, 8)}</span>
                            <span className="text-[10px] px-3 py-1 bg-primary/10 rounded-full text-primary font-black uppercase tracking-widest italic">{row.User?.nom_complet || 'MARCHAND BCA'}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            label: 'LOCALISATION',
            render: (row) => (
                <div className="flex items-center gap-3 text-muted-foreground group/loc">
                    <div className="p-2 rounded-xl bg-background border-2 border-border group-hover/loc:border-primary/40 transition-colors">
                        <MapPin className="size-4 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] italic">{row.description?.split(',')[row.description?.split(',').length - 1] || 'CONAKRY, GUINÉE'}</span>
                </div>
            )
        },
        {
            label: 'PERFORMANCES',
            render: (row) => (
                <div className="flex flex-col gap-3 group/perf">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-foreground italic tracking-tighter">{row.sales || Math.floor(Math.random() * 500)}</span>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] italic">Unités Sorties</span>
                    </div>
                    <div className="w-32 h-2 bg-background border-2 border-border rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-primary rounded-full animate-in slide-in-from-left duration-1000" style={{ width: '70%' }}></div>
                    </div>
                </div>
            )
        },
        {
            label: 'INDICE DE CONFIANCE',
            render: (row) => (
                <div className="flex items-center gap-3 group/score">
                    <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-[1rem] border-2 border-amber-500/20 shadow-premium group-hover/score:scale-110 transition-transform">
                        <Star className="size-4 fill-amber-500" />
                        <span className="text-sm font-black italic tracking-tighter">{row.rating || (4.5 + Math.random() * 0.5).toFixed(1)}</span>
                    </div>
                </div>
            )
        },
        {
            label: 'STATUT OPÉRATIONNEL',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <StatusBadge status={row.statut === 'actif' ? 'Vérifié' : row.statut} variant={row.statut === 'actif' ? 'success' : 'warning'} className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border-2 italic shadow-sm" />
                </div>
            )
        },
        {
            label: 'ACTIONS',
            render: (row) => (
                <Button asChild variant="ghost" className="h-12 px-6 rounded-[1rem] font-black text-[11px] uppercase tracking-[0.3em] text-primary hover:bg-primary/10 group/btn border-2 border-transparent hover:border-primary/20 transition-all italic shadow-premium hover:shadow-primary/10">
                    <Link to={`/shop/${row.slug}`} className="flex items-center gap-3">
                        ANALYSER PROFIL
                        <ArrowRight className="size-4 group-hover/btn:translate-x-2 transition-transform" />
                    </Link>
                </Button>
            )
        }
    ];

    const filteredVendors = vendors.filter(v =>
        (v.nom_boutique?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <PublicLayout>
            <div className="w-full space-y-16 animate-in fade-in duration-1000 font-inter pb-32 px-6 md:px-12 max-w-7xl mx-auto pt-20">
                {/* Executive Header */}
                <div className="glass-card border border-border rounded-2xl p-8 md:p-12 relative overflow-visible group">
                    <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/10 transition-colors duration-1000 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-end">
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em]">Centre d'accréditation des marchands</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-[0.9] uppercase">
                                Collaborez avec <br />
                                <span className="text-primary">L'Élite Business.</span>
                            </h2>
                            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed border-l-4 border-primary/30 pl-6">
                                Chaque entité sur BCA Connect subit un audit rigoureux pour garantir une intégrité transactionnelle absolue et une qualité de service premium.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4 shrink-0 pt-4 lg:pt-0">
                            <Button variant="outline" className="h-12 px-6 rounded-xl font-semibold text-sm gap-3 border border-border hover:border-primary/50 hover:text-primary transition-all">
                                <ExternalLink className="size-4" />
                                Protocole Vendeur
                            </Button>
                            <Button className="h-12 px-6 rounded-xl font-semibold text-sm bg-primary hover:bg-primary/90 text-white border-0 transition-all relative overflow-hidden group/btn">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                Devenir Partenaire
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Intelligence Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                    <div className="lg:col-span-3 glass-card p-6 rounded-[2rem] border-4 border-border shadow-premium group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative z-20 flex items-center h-full">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-primary size-7 group-focus-within:scale-125 transition-transform" />
                            <Input
                                type="text"
                                placeholder="IDENTIFIER UN MARCHAND, UNE CATÉGORIE, UNE ZONE D'INFLUENCE..."
                                className="pl-20 h-16 bg-transparent border-none focus:ring-0 text-lg font-black italic tracking-widest placeholder:text-muted-foreground/20 shadow-none uppercase"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card p-8 rounded-[2rem] border-4 border-border flex items-center gap-8 group hover:border-primary/30 transition-all cursor-default overflow-hidden relative shadow-premium">
                            <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="size-16 rounded-[1.2rem] bg-background border-4 border-border flex items-center justify-center text-primary relative z-10 shadow-inner group-hover:rotate-12 transition-transform">
                                <Users className="size-8" />
                            </div>
                            <div className="relative z-10 space-y-1">
                                <p className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none pt-0.5">Unités Commerciales</p>
                                <h4 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">1.250 +</h4>
                            </div>
                        </div>
                        <div className="glass-card p-8 rounded-[2rem] border-4 border-border flex items-center gap-8 group hover:border-primary/30 transition-all cursor-default overflow-hidden relative shadow-premium">
                            <div className="absolute top-0 right-0 size-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="size-16 rounded-[1.2rem] bg-background border-4 border-border flex items-center justify-center text-emerald-500 relative z-10 shadow-inner group-hover:rotate-12 transition-transform">
                                <ShieldCheck className="size-8" />
                            </div>
                            <div className="relative z-10 space-y-1">
                                <p className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none pt-0.5">Indice de Confiance</p>
                                <h4 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">98.4%</h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Directory Engine */}
                <div className="glass-card rounded-[3rem] border-4 border-border overflow-hidden shadow-premium-lg">
                    <div className="border-b-4 border-border py-10 px-12 bg-muted/20">
                        <div className="flex items-center justify-between">
                            <h3 className="text-executive-label font-black uppercase tracking-[0.4em] text-foreground flex items-center gap-6 italic leading-none pt-1">
                                <div className="p-3 bg-primary rounded-xl text-white shadow-premium">
                                    <Users className="size-6" />
                                </div>
                                ANNUAIRE INTERACTIF DES LEADERS
                            </h3>
                            <div className="flex items-center gap-4 px-6 py-3 bg-background rounded-full border-2 border-border italic transform hover:scale-105 transition-transform cursor-default">
                                <div className="size-2 rounded-full bg-emerald-500 animate-ping shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">FLUX ACTIF TEMPS RÉEL</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-0">
                        {isLoading ? (
                            <div className="divide-y-4 divide-border/50">
                                {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                            </div>
                        ) : hasError ? (
                            <div className="p-20">
                                <ErrorState />
                            </div>
                        ) : filteredVendors.length > 0 ? (
                            <DataTable
                                columns={columns}
                                data={filteredVendors}
                                className="border-none shadow-none"
                            />
                        ) : (
                            <div className="p-20">
                                <EmptyState
                                    title="PROTOCOLE SANS RÉSULTAT"
                                    description="Aucune entité ne correspond aux critères de recherche identifiés."
                                    icon={Store}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Premium Pagination Control */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-12">
                    <p className="text-sm text-muted-foreground font-black uppercase tracking-[0.2em] italic border-l-4 border-primary/20 pl-6">
                        Affichage de <span className="text-primary font-black">1-5</span> sur {filteredVendors.length} marchands identifiés
                    </p>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="rounded-[1rem] h-12 px-8 border-4 border-border font-black uppercase tracking-widest text-[10px] italic hover:border-primary/40 transition-colors">PRÉCÉDENT</Button>
                        <div className="flex items-center gap-3">
                            <Button size="sm" className="rounded-[1rem] size-12 font-black italic shadow-premium bg-primary text-white border-0">1</Button>
                            <Button variant="ghost" size="sm" className="rounded-[1rem] size-12 font-black italic hover:bg-muted text-muted-foreground">2</Button>
                            <Button variant="ghost" size="sm" className="rounded-[1rem] size-12 font-black italic hover:bg-muted text-muted-foreground">3</Button>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-[1rem] h-12 px-8 border-4 border-border font-black uppercase tracking-widest text-[10px] italic hover:border-primary/40 transition-colors">SUIVANT</Button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default VendorsList;
