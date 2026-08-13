import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { HardHat, Plus, Trash2, Trophy, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/helpers';
import {
    useMyRfqProjects, useOpenRfqProjects, useCreateRfqProject,
    useRfqComparison, useSubmitProjectQuote, useAcceptProjectQuote,
} from '../hooks/useRfqProjectData';
import { ROLES } from '../../constants/roles';

const formatGnf = (amount) => `${formatCurrency(amount)} GNF`;
const EMPTY_LINE = { description: '', quantite: '', unite: 'unités' };

const CreateProjectModal = ({ onClose }) => {
    const [form, setForm] = useState({ titre: '', description: '', ville_livraison: '', budget_max: '' });
    const [lignes, setLignes] = useState([{ ...EMPTY_LINE }]);
    const createProject = useCreateRfqProject();

    const updateLigne = (i, field, value) => setLignes((ls) => ls.map((l, idx) => idx === i ? { ...l, [field]: value } : l));

    const submit = (e) => {
        e.preventDefault();
        createProject.mutate(
            { ...form, budget_max: form.budget_max ? parseFloat(form.budget_max) : null, lignes: lignes.map(l => ({ ...l, quantite: parseInt(l.quantite, 10) })) },
            { onSuccess: onClose }
        );
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
            <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-foreground">Nouvel appel d'offres chantier</h2>
                    <button type="button" onClick={onClose} className="border-none bg-transparent text-muted-foreground"><X className="size-5" /></button>
                </div>

                <input required value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} placeholder="Titre (ex: Rénovation entrepôt Matoto)"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none" />
                <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description du besoin"
                    rows={2} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none resize-none" />
                <div className="grid grid-cols-2 gap-3">
                    <input value={form.ville_livraison} onChange={e => setForm(f => ({ ...f, ville_livraison: e.target.value }))} placeholder="Ville de livraison"
                        className="h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none" />
                    <input type="number" min={0} value={form.budget_max} onChange={e => setForm(f => ({ ...f, budget_max: e.target.value }))} placeholder="Budget max (GNF, optionnel)"
                        className="h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Lignes (matériaux / services)</label>
                    {lignes.map((l, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input required value={l.description} onChange={e => updateLigne(i, 'description', e.target.value)} placeholder="Ex: Ciment CEM II 50kg"
                                className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-xs outline-none" />
                            <input required type="number" min={1} value={l.quantite} onChange={e => updateLigne(i, 'quantite', e.target.value)} placeholder="Qté"
                                className="w-20 h-9 px-2 rounded-lg border border-border bg-background text-xs outline-none" />
                            <input value={l.unite} onChange={e => updateLigne(i, 'unite', e.target.value)} placeholder="Unité"
                                className="w-24 h-9 px-2 rounded-lg border border-border bg-background text-xs outline-none" />
                            {lignes.length > 1 && (
                                <button type="button" onClick={() => setLignes((ls) => ls.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-rose-500 border-none bg-transparent">
                                    <Trash2 className="size-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => setLignes((ls) => [...ls, { ...EMPTY_LINE }])} className="text-xs font-bold text-primary flex items-center gap-1 border-none bg-transparent">
                        <Plus className="size-3.5" /> Ajouter une ligne
                    </button>
                </div>

                <button type="submit" disabled={createProject.isPending} className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold border-none disabled:opacity-50">
                    Publier l'appel d'offres
                </button>
            </form>
        </div>
    );
};

const ComparisonView = ({ demandeId, onClose }) => {
    const { data } = useRfqComparison(demandeId);
    const accept = useAcceptProjectQuote(demandeId);

    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-foreground">{data.demande.titre} — Offres reçues</h2>
                    <button onClick={onClose} className="border-none bg-transparent text-muted-foreground"><X className="size-5" /></button>
                </div>

                {data.devis.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">Aucune offre reçue pour le moment.</p>
                ) : (
                    <div className="space-y-3">
                        {data.devis.map((d, i) => (
                            <div key={d.id} className={`rounded-xl border p-4 ${i === 0 ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'border-border'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {i === 0 && <Trophy className="size-4 text-amber-500" />}
                                        <span className="font-bold text-sm text-foreground">{d.fournisseur?.nom_complet}</span>
                                        {d.delai_livraison_jours && <span className="text-xs text-muted-foreground">· {d.delai_livraison_jours}j</span>}
                                    </div>
                                    <span className="font-black text-foreground">{formatGnf(d.montant_total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {d.lignes.map((l) => (
                                        <div key={l.id} className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{l.ligne?.description}</span>
                                            <span>{l.disponible ? `${formatGnf(l.prix_unitaire)} × ${l.quantite_proposee}` : 'Non disponible'}</span>
                                        </div>
                                    ))}
                                </div>
                                {data.demande.statut === 'ouverte' && d.statut === 'en_attente' && (
                                    <button onClick={() => accept.mutate(d.id)} disabled={accept.isPending}
                                        className="mt-3 h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 border-none disabled:opacity-50">
                                        <CheckCircle2 className="size-3.5" /> Accepter cette offre
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const RfqProjects = () => {
    const { user } = useAuth();
    const isVendor = user?.role === ROLES?.FOURNISSEUR || user?.role === 'fournisseur';
    const { data: mine = [] } = useMyRfqProjects();
    const { data: open = [] } = useOpenRfqProjects();
    const [showCreate, setShowCreate] = useState(false);
    const [comparisonId, setComparisonId] = useState(null);

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-foreground flex items-center gap-2"><HardHat className="size-5 text-primary" /> Appels d'offres chantier</h1>
                        <p className="text-sm text-muted-foreground">Publiez un besoin multi-lignes et comparez les offres de plusieurs fournisseurs.</p>
                    </div>
                    {!isVendor && (
                        <button onClick={() => setShowCreate(true)} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2 border-none">
                            <Plus className="size-4" /> Nouveau
                        </button>
                    )}
                </div>

                {!isVendor && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-black text-muted-foreground uppercase">Mes appels d'offres</h2>
                        {mine.length === 0 && <p className="text-sm text-muted-foreground">Aucun appel d'offres publié.</p>}
                        {mine.map((d) => (
                            <button key={d.id} onClick={() => setComparisonId(d.id)}
                                className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition">
                                <p className="font-bold text-sm text-foreground">{d.titre}</p>
                                <p className="text-xs text-muted-foreground">{d.lignes?.length || 0} ligne(s) · {d.statut}</p>
                            </button>
                        ))}
                    </div>
                )}

                {isVendor && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-black text-muted-foreground uppercase">Appels d'offres ouverts</h2>
                        {open.length === 0 && <p className="text-sm text-muted-foreground">Aucun appel d'offres ouvert actuellement.</p>}
                        {open.map((d) => (
                            <VendorProjectRow key={d.id} demande={d} />
                        ))}
                    </div>
                )}

                {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
                {comparisonId && <ComparisonView demandeId={comparisonId} onClose={() => setComparisonId(null)} />}
            </div>
        </DashboardLayout>
    );
};

const VendorProjectRow = ({ demande }) => {
    const [expanded, setExpanded] = useState(false);
    const [lignes, setLignes] = useState({});
    const submitQuote = useSubmitProjectQuote();

    const submit = () => {
        submitQuote.mutate({
            id: demande.id,
            lignes: (demande.lignes || []).map((l) => ({
                ligne_id: l.id,
                prix_unitaire: lignes[l.id]?.prix ? parseFloat(lignes[l.id].prix) : undefined,
                quantite_proposee: l.quantite,
                disponible: !!lignes[l.id]?.prix,
            })),
        }, { onSuccess: () => setExpanded(false) });
    };

    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <button onClick={() => setExpanded((v) => !v)} className="w-full text-left border-none bg-transparent">
                <p className="font-bold text-sm text-foreground">{demande.titre}</p>
                <p className="text-xs text-muted-foreground">{demande.lignes?.length || 0} ligne(s) · {demande.ville_livraison || 'Livraison non précisée'}</p>
            </button>
            {expanded && (
                <div className="mt-3 space-y-2 pt-3 border-t border-border">
                    {(demande.lignes || []).map((l) => (
                        <div key={l.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-foreground">{l.description} ({l.quantite} {l.unite})</span>
                            <input type="number" min={0} placeholder="Prix unitaire" value={lignes[l.id]?.prix || ''}
                                onChange={(e) => setLignes((s) => ({ ...s, [l.id]: { prix: e.target.value } }))}
                                className="w-32 h-8 px-2 rounded-lg border border-border bg-background outline-none" />
                        </div>
                    ))}
                    <button onClick={submit} disabled={submitQuote.isPending} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold border-none disabled:opacity-50">
                        Soumettre mon offre
                    </button>
                </div>
            )}
        </div>
    );
};

export default RfqProjects;
