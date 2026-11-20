import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Plus, Edit2, Trash2, Radio, Clock, CheckCircle, RefreshCcw, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { cn } from '../../lib/utils';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

const STATUTS = [
    { value: 'a_venir', label: 'À venir', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { value: 'en_direct', label: 'En direct', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    { value: 'termine', label: 'Terminé', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
];

const emptyForm = {
    titre: '',
    description: '',
    date_heure: '',
    intervenant: '',
    categorie: '',
    lien_rejoindre: '',
    video_url: '',
    statut: 'a_venir',
};

const AdminWebinars = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const { data: webinars = [], isLoading, refetch } = useQuery({
        queryKey: ['webinars-admin'],
        queryFn: async () => {
            const res = await api.get('/webinars');
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/webinars', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['webinars-admin']);
            queryClient.invalidateQueries(['webinars']);
            toast.success('Webinaire créé avec succès !');
            handleClose();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la création')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }) => api.put(`/webinars/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['webinars-admin']);
            queryClient.invalidateQueries(['webinars']);
            toast.success('Webinaire mis à jour !');
            handleClose();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour')
    });

    const [deleteTarget, setDeleteTarget] = useState(null);

    const deleteMutation = useMutation({
        mutationFn: ({ id, confirmationText }) => api.delete(`/webinars/${id}`, { data: { confirmation_nom: confirmationText } }),
        onSuccess: () => {
            queryClient.invalidateQueries(['webinars-admin']);
            queryClient.invalidateQueries(['webinars']);
            toast.success('Webinaire supprimé.');
            setDeleteTarget(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la suppression')
    });

    const handleOpen = (webinar = null) => {
        if (webinar) {
            setEditing(webinar);
            setForm({
                titre: webinar.titre || '',
                description: webinar.description || '',
                date_heure: webinar.date_heure ? new Date(webinar.date_heure).toISOString().slice(0, 16) : '',
                intervenant: webinar.intervenant || '',
                categorie: webinar.categorie || '',
                lien_rejoindre: webinar.lien_rejoindre || '',
                video_url: webinar.video_url || '',
                statut: webinar.statut || 'a_venir',
            });
        } else {
            setEditing(null);
            setForm(emptyForm);
        }
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.titre || !form.description || !form.date_heure || !form.intervenant) {
            return toast.error('Titre, description, date et intervenant sont requis.');
        }
        if (editing) {
            updateMutation.mutate({ id: editing.id, ...form });
        } else {
            createMutation.mutate(form);
        }
    };

    const handleDelete = (webinar) => setDeleteTarget(webinar);

    const getStatut = (val) => STATUTS.find(s => s.value === val) || STATUTS[0];

    return (
        <DashboardLayout title="GESTION DES WEBINAIRES">
            <div className="space-y-5 pb-24 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                            <Radio className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase">Webinaires & <span className="text-red-500">Formations</span></h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{webinars.length} webinaire(s) enregistré(s)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => refetch()} className="size-9 rounded-xl border border-border flex items-center justify-center hover:text-primary transition-colors">
                            <RefreshCcw className={cn('size-4', isLoading && 'animate-spin')} />
                        </button>
                        <button
                            onClick={() => handleOpen()}
                            className="flex items-center gap-2 h-9 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-red-500/20"
                        >
                            <Plus className="size-4" /> Nouveau webinaire
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-primary" />
                    </div>
                ) : webinars.length === 0 ? (
                    <div className="py-20 text-center opacity-40 flex flex-col items-center gap-3">
                        <Radio className="size-10 text-gray-400" />
                        <p className="text-sm font-black uppercase">Aucun webinaire</p>
                        <p className="text-xs text-muted-foreground">Créez votre premier webinaire</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {webinars.map((w) => {
                            const statut = getStatut(w.statut);
                            return (
                                <div key={w.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3 gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={cn('text-[10px] font-black uppercase px-2 py-0.5 rounded border', statut.color)}>
                                                {w.statut === 'en_direct' && <span className="mr-1">🔴</span>}{statut.label}
                                            </span>
                                            {w.categorie && (
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                    {w.categorie}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => handleOpen(w)}
                                                className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                            >
                                                <Edit2 className="size-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(w)}
                                                className="size-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-foreground mb-1 line-clamp-1">{w.titre}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{w.description}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="size-3" />
                                            {new Date(w.date_heure).toLocaleString('fr-GN')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            👨‍🏫 {w.intervenant}
                                        </span>
                                        {w.lien_rejoindre && (
                                            <a href={w.lien_rejoindre} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                                🔗 Lien
                                            </a>
                                        )}
                                        {w.video_url && (
                                            <span className="flex items-center gap-1 text-emerald-500">
                                                <CheckCircle className="size-3" /> Replay disponible
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Création / Édition */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase">
                                {editing ? 'Modifier le webinaire' : 'Nouveau webinaire'}
                            </h3>
                            <button onClick={handleClose} className="size-7 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-colors">
                                <X className="size-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Titre *</label>
                                <input
                                    value={form.titre}
                                    onChange={e => setForm(p => ({ ...p, titre: e.target.value }))}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                    placeholder="Titre du webinaire"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Description *</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 resize-none"
                                    placeholder="Description du contenu..."
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Date & Heure *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.date_heure}
                                        onChange={e => setForm(p => ({ ...p, date_heure: e.target.value }))}
                                        className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Statut</label>
                                    <select
                                        value={form.statut}
                                        onChange={e => setForm(p => ({ ...p, statut: e.target.value }))}
                                        className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                    >
                                        {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Intervenant *</label>
                                    <input
                                        value={form.intervenant}
                                        onChange={e => setForm(p => ({ ...p, intervenant: e.target.value }))}
                                        className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        placeholder="Nom de l'intervenant"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Catégorie</label>
                                    <input
                                        value={form.categorie}
                                        onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
                                        className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        placeholder="Commerce, Finance..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Lien de participation</label>
                                <input
                                    value={form.lien_rejoindre}
                                    onChange={e => setForm(p => ({ ...p, lien_rejoindre: e.target.value }))}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                    placeholder="https://zoom.us/..."
                                    type="url"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">URL Replay (après la session)</label>
                                <input
                                    value={form.video_url}
                                    onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                    placeholder="https://youtube.com/..."
                                    type="url"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={handleClose} className="flex-1 h-10 rounded-xl border border-border text-xs font-black uppercase hover:bg-muted transition-colors">
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Save className="size-4" />
                                    {editing ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                itemName={deleteTarget?.titre}
                itemLabel="ce webinaire"
                onConfirm={(confirmationText) => deleteMutation.mutateAsync({ id: deleteTarget.id, confirmationText })}
            />
        </DashboardLayout>
    );
};

export default AdminWebinars;
