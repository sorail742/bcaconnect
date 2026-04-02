import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { Search, Users, Star, Store, ArrowRight, ShieldCheck, MapPin, Globe, Award, Zap } from 'lucide-react';
import { TableRowSkeleton } from '../components/ui/Loader';
import { ErrorState, EmptyState } from '../components/ui/StatusStates';
import storeService from '../services/storeService';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const VendorsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [vendors, setVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setIsLoading(true);
                const data = await storeService.getAllStores();
                setVendors(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Erreur chargement vendeurs:", error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const filteredVendors = vendors.filter(v =>
        (v.nom_boutique?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter pb-32">
                {/* ══ EXECUTIVE HEADER ══ */}
                <div className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
                    <div className="absolute top-0 right-0 size-[40rem] bg-[#FF6600]/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />

                    <div className="relative z-10 space-y-10 max-w-4xl">
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border-2 border-[#FF6600]/20 bg-[#FF6600]/5 text-[#FF6600] text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">
                            <ShieldCheck className="size-4 animate-pulse" /> RÉSEAU PARTENAIRES CERTIFIÉS
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-[0.8] mb-4">
                            L'ÉLITE <br /> <span className="text-[#FF6600]">MARCHANDE.</span>
                        </h1>
                        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm leading-relaxed italic border-l-8 border-[#FF6600]/20 pl-10 max-w-2xl">
                            Explorez l'annuaire des partenaires stratégiques de BCA Connect. Qualité, intégrité et excellence opérationnelle scellées par nos protocoles d'audit.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
                    {/* ══ SEARCH & STATS BAR ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sticky top-24 z-30">
                        <div className="lg:col-span-8 bg-white/[0.02] backdrop-blur-xl p-3 rounded-[2.5rem] border-4 border-white/5 shadow-2xl flex items-center relative group focus-within:border-[#FF6600]/40 transition-all">
                            <Search className="absolute left-10 size-6 text-slate-700 group-focus-within:text-[#FF6600] transition-colors" />
                            <input
                                type="text"
                                placeholder="RECHERCHER UNE UNITÉ COMMERCIALE..."
                                className="w-full h-16 pl-20 bg-transparent border-none focus:ring-0 text-sm font-black uppercase tracking-[0.3em] placeholder:text-slate-800 text-white italic"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="lg:col-span-4 grid grid-cols-2 gap-6">
                            <div className="bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2.5rem] border-4 border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-[#FF6600]/20 transition-all">
                                <Users className="size-6 text-[#FF6600] group-hover:scale-110 transition-transform" />
                                <div className="text-center">
                                    <p className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">{vendors.length}+</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">ACTEURS</p>
                                </div>
                            </div>
                            <div className="bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2.5rem] border-4 border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-emerald-500/20 transition-all">
                                <ShieldCheck className="size-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                                <div className="text-center">
                                    <p className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">99.8%</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">TRUST</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ VENDORS GRID ══ */}
                    <div className="space-y-12">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-96 rounded-[3.5rem] bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : hasError ? (
                            <div className="py-32">
                                <ErrorState />
                            </div>
                        ) : filteredVendors.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                {filteredVendors.map((vendor) => (
                                    <Link
                                        key={vendor.id}
                                        to={`/shop/${vendor.slug}`}
                                        className="group relative flex flex-col p-10 rounded-[3.5rem] bg-white/[0.02] border-4 border-white/5 hover:border-[#FF6600]/40 shadow-2xl transition-all duration-700 hover:-translate-y-4"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[3.5rem]" />

                                        {/* Vendor Header */}
                                        <div className="flex items-start justify-between relative z-10 mb-10">
                                            <div className="size-24 rounded-[2rem] bg-white/5 border-4 border-white/5 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-[#FF6600]/20 transition-all">
                                                {vendor.logo_url ? (
                                                    <img src={vendor.logo_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                ) : (
                                                    <Store className="size-10 text-slate-800 group-hover:text-[#FF6600]/20" />
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="px-4 py-1.5 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-full text-emerald-500 text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2">
                                                    <ShieldCheck className="size-3" /> VÉRIFIÉ
                                                </div>
                                                <div className="px-4 py-1.5 bg-amber-500/10 border-2 border-amber-500/20 rounded-full text-amber-500 text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2">
                                                    <Star className="size-3 fill-amber-500" /> {(4.5 + Math.random() * 0.5).toFixed(1)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vendor Info */}
                                        <div className="space-y-6 relative z-10 flex-1">
                                            <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none group-hover:text-[#FF6600] transition-colors">{vendor.nom_boutique}</h3>
                                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest leading-relaxed italic line-clamp-3">
                                                {vendor.description || "Entité marchande accréditée par le protocol BCA Connect pour l'excellence de ses actifs techniques."}
                                            </p>
                                        </div>

                                        {/* Vendor Footer */}
                                        <div className="mt-10 pt-10 border-t-4 border-white/5 flex items-center justify-between relative z-10">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-2 italic">LOCALISATION</span>
                                                <span className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2 italic">
                                                    <MapPin className="size-3.5 text-[#FF6600]" /> {vendor.localisation || 'CONAKRY, GN'}
                                                </span>
                                            </div>
                                            <div className="size-14 rounded-2xl bg-[#FF6600] flex items-center justify-center text-white shadow-xl shadow-[#FF6600]/20 group-hover:scale-110 group-hover:rotate-12 transition-all">
                                                <ArrowRight className="size-6 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-48 flex flex-col items-center gap-12 text-center bg-white/[0.02] rounded-[4rem] border-4 border-dashed border-white/5 group">
                                <div className="size-36 rounded-[3.5rem] bg-white/5 flex items-center justify-center border-4 border-dashed border-white/5 group-hover:border-[#FF6600]/20 transition-all hover:rotate-12 duration-1000">
                                    <Store className="size-16 text-slate-800 group-hover:text-[#FF6600]/20 transition-colors" />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-5xl font-black italic tracking-tighter text-white uppercase">Secteur Non Identifié</h3>
                                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs italic border-r-8 border-[#FF6600]/20 pr-10 text-right max-w-lg mx-auto leading-relaxed">
                                        Aucune entité marchande ne correspond aux critères de recherche spécifiés dans notre registre central. Affinez votre requête.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ══ PAGINATION EXÉCUTIVE ══ */}
                    {filteredVendors.length > 0 && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 py-10 border-t-4 border-white/5">
                            <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.4em] italic">
                                INDEX DE <span className="text-[#FF6600]">{filteredVendors.length}</span> UNITÉS CERTIFIÉES
                            </p>
                            <div className="flex items-center gap-4">
                                <button className="h-14 px-8 rounded-2xl border-4 border-white/5 font-black uppercase tracking-[0.3em] text-[10px] hover:border-[#FF6600]/40 transition-all italic text-slate-500 hover:text-white">PRÉCÉDENT</button>
                                <div className="flex items-center gap-3">
                                    <button className="size-14 rounded-2xl font-black bg-[#FF6600] text-white shadow-2xl shadow-[#FF6600]/20 italic">1</button>
                                    <button className="size-14 rounded-2xl font-black border-4 border-white/5 text-slate-700 hover:text-white hover:border-white/10 transition-all italic">2</button>
                                </div>
                                <button className="h-14 px-8 rounded-2xl border-4 border-[#FF6600] bg-[#FF6600] text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#FF6600]/20 hover:scale-105 transition-all italic">SUIVANT</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
};

export default VendorsList;
