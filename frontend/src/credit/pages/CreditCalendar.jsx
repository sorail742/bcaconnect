import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, AlertTriangle, CheckCircle2, Clock, ChevronRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

const CreditCalendar = () => {
    const { user } = useAuth();
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCredits = async () => {
        try {
            const { data } = await api.get('/credits/my');
            setCredits(data);
        } catch (error) {
            toast.error("Erreur de chargement des échéances.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredits();
    }, []);

    const handlePay = async (echeanceId) => {
        try {
            toast.loading("Paiement en cours...");
            await api.post(`/credits/pay/${echeanceId}`);
            toast.success("Échéance payée avec succès !");
            fetchCredits();
        } catch (error) {
            toast.error(error.response?.data?.message || "Échec du paiement. Vérifiez votre solde Wallet.");
        } finally {
            toast.dismiss();
        }
    };

    // Flatten all installments and sort by date
    let allEcheances = [];
    credits.forEach(credit => {
        if (credit.echeances) {
            credit.echeances.forEach(e => {
                allEcheances.push({
                    ...e,
                    credit_id: credit.id,
                    montant_principal: credit.montant_principal,
                    dateObj: new Date(e.date_echeance)
                });
            });
        }
    });

    allEcheances.sort((a, b) => a.dateObj - b.dateObj);

    return (
        <DashboardLayout title="Mon Calendrier d'Échéances">
            <div className="container max-w-4xl mx-auto px-4 py-8">
                
                <div className="flex items-center gap-4 mb-8">
                    <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Calendar className="size-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-foreground">Calendrier des Échéances</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Suivez et réglez vos paiements échelonnés.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="size-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : allEcheances.length === 0 ? (
                    <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
                        <Calendar className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-foreground">Aucune échéance</h3>
                        <p className="text-muted-foreground mt-2">Vous n'avez aucun crédit en cours pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[19px] sm:before:left-[27px] before:w-[2px] before:bg-border">
                        {allEcheances.map((ech, idx) => {
                            const isPaid = ech.statut === 'paye';
                            const isLate = ech.statut === 'en_retard' || (!isPaid && isPast(ech.dateObj) && !isToday(ech.dateObj));
                            const isDueSoon = !isPaid && !isLate && ech.dateObj <= addDays(new Date(), 3);
                            
                            let statusColor = "bg-muted border-border text-muted-foreground";
                            let Icon = Clock;
                            
                            if (isPaid) {
                                statusColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
                                Icon = CheckCircle2;
                            } else if (isLate) {
                                statusColor = "bg-rose-500/10 border-rose-500/30 text-rose-500";
                                Icon = AlertTriangle;
                            } else if (isDueSoon) {
                                statusColor = "bg-orange-500/10 border-orange-500/30 text-orange-500";
                                Icon = AlertTriangle;
                            } else {
                                statusColor = "bg-indigo-500/10 border-indigo-500/30 text-indigo-500";
                            }

                            return (
                                <div key={ech.id || idx} className="relative pl-12 sm:pl-16">
                                    {/* Timeline dot */}
                                    <div className={cn("absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 size-6 rounded-full border-2 bg-background flex items-center justify-center shadow-sm z-10", 
                                        isPaid ? "border-emerald-500 text-emerald-500" :
                                        isLate ? "border-rose-500 text-rose-500" :
                                        "border-indigo-500 text-indigo-500"
                                    )}>
                                        {isPaid ? <CheckCircle2 className="size-3.5" /> : <div className="size-2 rounded-full bg-current" />}
                                    </div>

                                    {/* Card */}
                                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                                        <div className="flex items-start gap-4">
                                            <div className={cn("size-12 rounded-xl flex items-center justify-center shrink-0 border", statusColor)}>
                                                <Icon className="size-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground capitalize tracking-wide">
                                                    {format(ech.dateObj, 'EEEE d MMMM yyyy', { locale: fr })}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Montant :</span>
                                                    <span className="text-sm font-black tabular-nums">{parseFloat(ech.montant_du).toLocaleString('fr-GN')} GNF</span>
                                                </div>
                                                {isLate && !isPaid && (
                                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">En retard - Pénalités possibles</p>
                                                )}
                                                {isDueSoon && !isPaid && !isLate && (
                                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">Échéance Proche</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3">
                                            <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border", statusColor)}>
                                                {ech.statut}
                                            </span>
                                            
                                            {!isPaid && (
                                                <Button 
                                                    onClick={() => handlePay(ech.id)}
                                                    size="sm"
                                                    className={cn("h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2",
                                                        isLate ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                                                    )}
                                                >
                                                    <CreditCard className="size-3.5" /> Payer
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CreditCalendar;
