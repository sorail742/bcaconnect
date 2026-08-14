import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ShieldCheck, Plus, Clock, CheckCircle2, XCircle, X, Upload, RefreshCcw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { cn, getImageUrl } from '../../lib/utils';
import api from '../../services/api';
import certificationService from '../services/certificationService';

const CERTIFICATION_TYPES = [
    'Registre de commerce',
    'Certification qualité',
    'Attestation fiscale',
    'Autorisation d\'exercer',
    'Autre justificatif',
];

const STATUT_CONFIG = {
    en_attente: { label: 'En attente', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
    validee: { label: 'Validée', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    rejetee: { label: 'Rejetée', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: XCircle },
};

const emptyForm = { type: CERTIFICATION_TYPES[0], document_url: '', date_expiration: '' };

const VendorCertifications = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [isUploading, setIsUploading] = useState(false);

    const { data: certifications = [], isLoading, refetch } = useQuery({
        queryKey: ['certifications-mine'],
        queryFn: certificationService.getMine,
    });

    const createMutation = useMutation({
        mutationFn: (data) => certificationService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['certifications-mine']);
            toast.success('Certification soumise pour validation.');
            setShowModal(false);
            setForm(emptyForm);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la soumission.'),
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        try {
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setForm((p) => ({ ...p, document_url: res.data.url }));
            toast.success('Document chargé.');
        } catch {
            toast.error('Erreur lors du transfert du document.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.document_url) return toast.error('Veuillez joindre un document justificatif.');
        createMutation.mutate({
            type: form.type,
            document_url: form.document_url,
            date_expiration: form.date_expiration || undefined,
        });
    };

    return (
        <DashboardLayout title="Certifications">
            <div className="space-y-5 pb-24 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase">Mes Certifications</h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{certifications.length} document(s) soumis</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => refetch()} className="size-9 rounded-xl border border-border flex items-center justify-center hover:text-primary transition-colors">
                            <RefreshCcw className={cn('size-4', isLoading && 'animate-spin')} />
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition-colors shadow-lg shadow-primary/20"
                        >
                            <Plus className="size-4" /> Soumettre un document
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
                        <p className="text-sm font-black uppercase">Aucune certification soumise</p>
                        <p className="text-xs text-muted-foreground">Soumettez vos justificatifs pour obtenir le badge « Certifié » sur votre boutique.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {certifications.map((c) => {
                            const cfg = STATUT_CONFIG[c.statut] || STATUT_CONFIG.en_attente;
                            const StatusIcon = cfg.icon;
                            return (
                                <div key={c.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-bold text-foreground">{c.type}</h3>
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
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase">Soumettre un document</h3>
                            <button onClick={() => setShowModal(false)} className="size-7 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-colors">
                                <X className="size-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Type de document *</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                >
                                    {CERTIFICATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Document justificatif (PDF/image) *</label>
                                <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                                >
                                    {isUploading ? <RefreshCcw className="size-5 animate-spin" /> : <Upload className="size-5" />}
                                    <span className="text-xs font-bold">{form.document_url ? 'Document chargé — cliquer pour remplacer' : 'Cliquer pour téléverser'}</span>
                                </button>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Date d'expiration (optionnel)</label>
                                <input
                                    type="date"
                                    value={form.date_expiration}
                                    onChange={(e) => setForm((p) => ({ ...p, date_expiration: e.target.value }))}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={createMutation.isPending || isUploading}
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                            >
                                {createMutation.isPending ? 'Envoi...' : 'Soumettre pour validation'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default VendorCertifications;
