import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, GraduationCap, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import educationService from '../../services/educationService';
import useApiMutation from '../../hooks/useApiMutation';
import { Button } from '../../components/ui/Button';

const AUDIENCES = [
    { value: 'tous', label: 'Tous' },
    { value: 'clients', label: 'Clients' },
    { value: 'fournisseurs', label: 'Fournisseurs' },
    { value: 'transporteurs', label: 'Transporteurs' },
];

const TYPES = ['article', 'video', 'guide', 'pdf'];

const emptyForm = {
    titre: '',
    description: '',
    type_contenu: 'article',
    url_contenu: '',
    audience_cible: 'tous',
    tag: '',
};

const AdminEducation = () => {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const { data: resources = [], isLoading, refetch, isFetching } = useQuery({
        queryKey: ['education-admin'],
        queryFn: educationService.getAllAdmin,
    });

    const { mutate: saveMutation, isPending: isSaving } = useApiMutation(
        (payload) => (editing
            ? educationService.update(editing.id, payload)
            : educationService.create(payload)),
        {
            invalidateKeys: [['education-admin'], ['education-resources']],
            successMessage: editing ? 'Ressource mise à jour.' : 'Ressource créée.',
            onSuccess: () => { setShowModal(false); setEditing(null); },
        },
    );

    const { mutate: deleteMutation } = useApiMutation(
        (id) => educationService.delete(id),
        {
            invalidateKeys: [['education-admin'], ['education-resources']],
            successMessage: 'Ressource supprimée.',
        },
    );

    const openModal = (resource = null) => {
        if (resource) {
            setEditing(resource);
            setFormData({
                titre: resource.titre || '',
                description: resource.description || '',
                type_contenu: resource.type_contenu || 'article',
                url_contenu: resource.url_contenu || '',
                audience_cible: resource.audience_cible || 'tous',
                tag: resource.tag || '',
            });
        } else {
            setEditing(null);
            setFormData(emptyForm);
        }
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.titre.trim() || !formData.url_contenu.trim()) {
            toast.error('Titre et URL requis.');
            return;
        }
        saveMutation(formData);
    };

    return (
        <DashboardLayout title="BCA Academy — Contenus" noPadding>
            <div className="p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="size-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Ressources éducatives</h2>
                            <p className="text-sm text-muted-foreground">{resources.length} contenu(s) publié(s)</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                            <RefreshCcw className={`size-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                            Actualiser
                        </Button>
                        <Button onClick={() => openModal()}>
                            <Plus className="size-4 mr-2" />
                            Ajouter
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <p className="text-muted-foreground">Chargement…</p>
                ) : (
                    <div className="grid gap-4">
                        {resources.map((r) => (
                            <div key={r.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold truncate">{r.titre}</h3>
                                        {r.tag && (
                                            <span className="text-xs px-2 py-0.5 bg-muted rounded-md">{r.tag}</span>
                                        )}
                                        <span className="text-xs text-muted-foreground">{r.type_contenu}</span>
                                        <span className="text-xs text-primary">{r.audience_cible}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                                    <a href={r.url_contenu} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate block">
                                        {r.url_contenu}
                                    </a>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button variant="outline" size="sm" onClick={() => openModal(r)}>
                                        <Edit2 className="size-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (window.confirm('Supprimer cette ressource ?')) deleteMutation(r.id);
                                        }}
                                    >
                                        <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {resources.length === 0 && (
                            <p className="text-center text-muted-foreground py-12">
                                Aucun contenu — lancez <code className="text-xs bg-muted px-1 rounded">npm run seed:education</code> ou ajoutez une ressource.
                            </p>
                        )}
                    </div>
                )}

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Modifier' : 'Nouvelle ressource'}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            className="w-full px-3 py-2 border border-border rounded-xl bg-background"
                            placeholder="Titre"
                            value={formData.titre}
                            onChange={(e) => setFormData((p) => ({ ...p, titre: e.target.value }))}
                        />
                        <textarea
                            className="w-full px-3 py-2 border border-border rounded-xl bg-background min-h-[80px]"
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                        />
                        <input
                            className="w-full px-3 py-2 border border-border rounded-xl bg-background"
                            placeholder="URL (vidéo, article, PDF…)"
                            value={formData.url_contenu}
                            onChange={(e) => setFormData((p) => ({ ...p, url_contenu: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                className="px-3 py-2 border border-border rounded-xl bg-background"
                                value={formData.type_contenu}
                                onChange={(e) => setFormData((p) => ({ ...p, type_contenu: e.target.value }))}
                            >
                                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select
                                className="px-3 py-2 border border-border rounded-xl bg-background"
                                value={formData.audience_cible}
                                onChange={(e) => setFormData((p) => ({ ...p, audience_cible: e.target.value }))}
                            >
                                {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </select>
                        </div>
                        <input
                            className="w-full px-3 py-2 border border-border rounded-xl bg-background"
                            placeholder="Tag (optionnel)"
                            value={formData.tag}
                            onChange={(e) => setFormData((p) => ({ ...p, tag: e.target.value }))}
                        />
                        <Button type="submit" className="w-full" disabled={isSaving}>
                            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                        </Button>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default AdminEducation;
