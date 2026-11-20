import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ShieldCheck, Clock, CheckCircle2, XCircle, RefreshCcw, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn, getImageUrl } from '../../lib/utils';
import certificationService from '../services/certificationService';
import FilterDropdown from '../../components/ui/FilterDropdown';

const STATUT_CONFIG = {
    en_attente: { label: 'En attente', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
    validee: { label: 'Validée', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    rejetee: { label: 'Rejetée', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: XCircle },
};

const AdminCertifications = () => {
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState('en_attente');
    const [rejecting, setRejecting] = useState(null); // certification en cours de rejet (pour saisir le motif)
    const [rejectReason, setRejectReason] = useState('');

    const { data: certifications = [], isLoading, refetch } = useQuery({
        queryKey: ['certifications-admin', filterStatus],
        queryFn: () => certificationService.getAll(filterStatus === 'TOUS' ? {} : { statut: filterStatus }),
    });

    const reviewMutation = useMutation({
        mutationFn: ({ id, statut, commentaire_admin }) => certificationService.review(id, { statut, commentaire_admin }),
        onSuccess: () => {
            queryClient.invalidateQueries(['certifications-admin']);
            toast.success('Certification mise à jour.');
            setRejecting(null);
            setRejectReason('');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour.'),
    });

    const handleApprove = (id) => reviewMutation.mutate({ id, statut: 'validee' });
    const handleReject = (id) => {
        if (!rejectReason.trim()) return toast.error('Veuillez indiquer un motif de rejet.');
        reviewMutation.mutate({ id, statut: 'rejetee', commentaire_admin: rejectReason.trim() });
    };

    return (
        <DashboardLayout title="Certifications Fournisseurs">
            <div className="space-y-5 pb-24 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase">Vérification des Certifications</h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{certifications.length} dossier(s)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FilterDropdown
                            value={filterStatus}
                            onChange={setFilterStatus}
                            defaultValue="TOUS"
                            options={['en_attente', 'validee', 'rejetee', 'TOUS'].map((s) => ({
                                value: s,
                                label: s === 'TOUS' ? 'Tous' : STATUT_CONFIG[s]?.label,
                            }))}
                        />
                        <button onClick={() => refetch()} className="size-9 rounded-xl border border-border flex items-center justify-center hover:text-primary transition-colors">
                            <RefreshCcw className={cn('size-4', isLoading && 'animate-spin')} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-primary" />
                    </div>
                ) : certifications.length === 0 ? (
                    <div className="py-20 text-center opacity-40 flex flex-col items-center gap-3">
                        <ShieldCheck className="size-10 text-gray-400" />
                        <p className="text-sm font-black uppercase">Aucun dossier</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {certifications.map((c) => {
                            const cfg = STATUT_CONFIG[c.statut] || STATUT_CONFIG.en_attente;
                            const StatusIcon = cfg.icon;
                            return (
                                <div key={c.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-foreground">{c.type}</h3>
                                            <p className="text-xs text-muted-foreground">{c.fournisseur?.nom_complet || 'Fournisseur inconnu'} — {c.fournisseur?.email}</p>
                                        </div>
                                        <span className={cn('text-[10px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 shrink-0', cfg.color)}>
                                            <StatusIcon className="size-3" /> {cfg.label}
                                        </span>
                                    </div>
                                    <a href={getImageUrl(c.document_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                                        <FileText className="size-3.5" /> Voir le document
                                    </a>
                                    {c.date_expiration && (
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Expire le {new Date(c.date_expiration).toLocaleDateString('fr-FR')}</p>
                                    )}
                                    {c.statut === 'rejetee' && c.commentaire_admin && (
                                        <p className="text-xs text-rose-500 bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">{c.commentaire_admin}</p>
                                    )}

                                    {c.statut === 'en_attente' && (
                                        rejecting === c.id ? (
                                            <div className="space-y-2 pt-2 border-t border-border">
                                                <textarea
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    placeholder="Motif du rejet..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs outline-none focus:border-primary/50 resize-none"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleReject(c.id)} disabled={reviewMutation.isPending} className="flex-1 h-9 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors">
                                                        Confirmer le rejet
                                                    </button>
                                                    <button onClick={() => { setRejecting(null); setRejectReason(''); }} className="h-9 px-3 rounded-lg bg-muted text-xs font-bold flex items-center justify-center">
                                                        <X className="size-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                                                <button onClick={() => handleApprove(c.id)} disabled={reviewMutation.isPending} className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="size-3.5" /> Valider
                                                </button>
                                                <button onClick={() => setRejecting(c.id)} disabled={reviewMutation.isPending} className="flex-1 h-9 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                                    <XCircle className="size-3.5" /> Rejeter
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminCertifications;
