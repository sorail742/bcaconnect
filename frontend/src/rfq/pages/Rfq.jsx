import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DataStateWrapper } from '../../components/ui/DataStates';
import {
    FileText, Plus, Store, Package, MapPin, Calendar, Wallet as WalletIcon,
    CheckCircle2, X, Clock, Send, Award, Ban,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
    useMyRfqs, useOpenRfqs, useMyRfqQuotes,
    useCreateRfq, useSubmitRfqQuote, useAcceptRfqQuote, useCloseRfq,
} from '../hooks/useRfqData';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { ROLES } from '../../constants/roles';
import ModalOverlay from '../../components/ui/ModalOverlay';

const formatGnf = (amount) => `${formatCurrency(amount)} GNF`;

const STATUS_LABELS = {
    ouverte: { label: 'Ouverte', className: 'bg-emerald-500/15 text-emerald-600' },
    attribuee: { label: 'Attribuée', className: 'bg-primary/15 text-primary' },
    fermee: { label: 'Fermée', className: 'bg-muted text-muted-foreground' },
    annulee: { label: 'Annulée', className: 'bg-destructive/15 text-destructive' },
};

const QuoteRow = ({ quote, isOwner, onAccept, acceptPending }) => (
    <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${quote.statut === 'accepte' ? 'border-emerald-500/40 bg-emerald-500/5' : quote.statut === 'refuse' ? 'border-border opacity-50' : 'border-border'}`}>
        <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{quote.fournisseur?.nom_complet || 'Fournisseur'}</p>
            <p className="text-xs text-muted-foreground">
                {formatGnf(quote.prix_unitaire)} / unité · {quote.quantite_disponible} dispo
                {quote.delai_livraison_jours ? ` · ${quote.delai_livraison_jours}j livraison` : ''}
            </p>
            {quote.message && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">&quot;{quote.message}&quot;</p>}
        </div>
        {isOwner && quote.statut === 'en_attente' && (
            <button
                onClick={() => onAccept(quote.id)}
                disabled={acceptPending}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50"
            >
                <Award className="size-3.5" />
                Accepter
            </button>
        )}
        {quote.statut === 'accepte' && (
            <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="size-3.5" /> Accepté
            </span>
        )}
        {quote.statut === 'refuse' && (
            <span className="shrink-0 text-xs font-bold text-muted-foreground">Refusé</span>
        )}
    </div>
);

const RequestCard = ({ demande, userId, mode, onQuote, onAccept, onClose, acceptPending, closePending }) => {
    const status = STATUS_LABELS[demande.statut] || STATUS_LABELS.ouverte;
    const isOwner = demande.utilisateur_id === userId;
    const myQuote = mode === 'marketplace' ? (demande.devis || []).find((d) => d.fournisseur_id === userId) : null;

    return (
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${status.className}`}>
                            {status.label}
                        </span>
                        {demande.categorie?.nom_categorie && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {demande.categorie.nom_categorie}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-lg text-foreground line-clamp-2">{demande.titre}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{demande.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                    <Package className="size-4 text-primary" />
                    <span>{demande.quantite} {demande.unite}</span>
                </div>
                {demande.budget_max && (
                    <div className="flex items-center gap-2">
                        <WalletIcon className="size-4 text-primary" />
                        <span>Budget max {formatGnf(demande.budget_max)}</span>
                    </div>
                )}
                {demande.ville_livraison && (
                    <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" />
                        <span className="truncate">{demande.ville_livraison}</span>
                    </div>
                )}
                {demande.date_limite && (
                    <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-primary" />
                        <span>Limite {formatDate(demande.date_limite)}</span>
                    </div>
                )}
            </div>

            {mode === 'mine' && (
                <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {(demande.devis || []).length} devis reçu(s)
                    </p>
                    {(demande.devis || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="size-4" /> En attente de devis...</p>
                    ) : (
                        <div className="space-y-2">
                            {demande.devis.map((q) => (
                                <QuoteRow key={q.id} quote={q} isOwner onAccept={(quoteId) => onAccept(demande.id, quoteId)} acceptPending={acceptPending} />
                            ))}
                        </div>
                    )}
                    {demande.statut === 'ouverte' && (
                        <button
                            onClick={() => onClose(demande.id)}
                            disabled={closePending}
                            className="mt-2 flex items-center gap-1 text-xs font-bold text-destructive hover:underline disabled:opacity-50"
                        >
                            <Ban className="size-3.5" /> Fermer la demande
                        </button>
                    )}
                </div>
            )}

            {mode === 'marketplace' && !isOwner && (
                <div className="pt-2 border-t border-border">
                    {myQuote ? (
                        <span className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                            <CheckCircle2 className="size-4" /> Devis envoyé ({formatGnf(myQuote.prix_unitaire)}/unité)
                        </span>
                    ) : (
                        <button
                            onClick={() => onQuote(demande)}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition"
                        >
                            <Send className="size-4" />
                            Soumettre un devis
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const CreateModal = ({ open, onClose, onSubmit, pending }) => {
    const [form, setForm] = useState({
        titre: '', description: '', quantite: '', unite: 'unités',
        budget_max: '', ville_livraison: '', date_limite: '',
    });
    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    return (
        <ModalOverlay open={open} onClose={onClose} title="Nouvelle demande de devis" maxWidth="max-w-lg">
            <div className="px-6 pb-6 space-y-4 max-h-[min(75vh,640px)] overflow-y-auto">
                <div>
                    <label className="text-sm font-bold">Titre *</label>
                    <input
                        value={form.titre}
                        onChange={(e) => set('titre', e.target.value)}
                        className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        placeholder="Ex. Besoin de 500kg de riz local"
                    />
                </div>
                <div>
                    <label className="text-sm font-bold">Description *</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => set('description', e.target.value)}
                        rows={3}
                        className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        placeholder="Détaillez votre besoin : qualité, spécifications, contraintes..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-bold">Quantité *</label>
                        <input
                            type="number"
                            min={1}
                            value={form.quantite}
                            onChange={(e) => set('quantite', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold">Unité</label>
                        <input
                            value={form.unite}
                            onChange={(e) => set('unite', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                            placeholder="kg, unités, cartons..."
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-bold">Budget max (GNF)</label>
                        <input
                            type="number"
                            min={0}
                            value={form.budget_max}
                            onChange={(e) => set('budget_max', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold">Date limite</label>
                        <input
                            type="date"
                            value={form.date_limite}
                            onChange={(e) => set('date_limite', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-bold">Ville de livraison</label>
                    <input
                        value={form.ville_livraison}
                        onChange={(e) => set('ville_livraison', e.target.value)}
                        className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        placeholder="Conakry..."
                    />
                </div>

                <div className="flex gap-3 pt-2 sticky bottom-0 bg-card pb-1">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl font-medium">Annuler</button>
                    <button
                        type="button"
                        onClick={() => onSubmit(form)}
                        disabled={pending || !form.titre.trim() || !form.description.trim() || !form.quantite}
                        className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50"
                    >
                        Publier la demande
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};

const QuoteModal = ({ demande, onClose, onSubmit, pending }) => {
    const [form, setForm] = useState({ prix_unitaire: '', quantite_disponible: '', delai_livraison_jours: '', message: '' });
    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
    if (!demande) return null;

    return (
        <ModalOverlay open onClose={onClose} title="Soumettre un devis" maxWidth="max-w-md">
            <div className="px-6 pb-6 space-y-4">
                <p className="text-sm text-muted-foreground">{demande.titre} — {demande.quantite} {demande.unite}</p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-bold">Prix unitaire (GNF) *</label>
                        <input
                            type="number"
                            min={1}
                            value={form.prix_unitaire}
                            onChange={(e) => set('prix_unitaire', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold">Quantité disponible *</label>
                        <input
                            type="number"
                            min={1}
                            value={form.quantite_disponible}
                            onChange={(e) => set('quantite_disponible', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-bold">Délai de livraison (jours)</label>
                    <input
                        type="number"
                        min={0}
                        value={form.delai_livraison_jours}
                        onChange={(e) => set('delai_livraison_jours', e.target.value)}
                        className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                    />
                </div>
                <div>
                    <label className="text-sm font-bold">Message (optionnel)</label>
                    <textarea
                        value={form.message}
                        onChange={(e) => set('message', e.target.value)}
                        rows={3}
                        className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        placeholder="Précisez votre offre..."
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl font-medium">Annuler</button>
                    <button
                        type="button"
                        onClick={() => onSubmit(form)}
                        disabled={pending || !form.prix_unitaire || !form.quantite_disponible}
                        className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50"
                    >
                        Envoyer le devis
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};

const Rfq = () => {
    const { user } = useAuth();
    const isVendor = user?.role === ROLES.FOURNISSEUR;
    const [tab, setTab] = useState('mine');
    const [showCreate, setShowCreate] = useState(false);
    const [quoteTarget, setQuoteTarget] = useState(null);

    const { data: myRfqs, loading: loadingMine, error: errorMine, refetch: refetchMine } = useMyRfqs();
    const { data: openRfqs, loading: loadingOpen, error: errorOpen, refetch: refetchOpen } = useOpenRfqs();
    const { data: myQuotes, loading: loadingQuotes, error: errorQuotes } = useMyRfqQuotes();

    const createMutation = useCreateRfq();
    const submitQuoteMutation = useSubmitRfqQuote();
    const acceptMutation = useAcceptRfqQuote();
    const closeMutation = useCloseRfq();

    const tabs = [
        { id: 'mine', label: 'Mes demandes', icon: FileText },
        ...(isVendor ? [
            { id: 'marketplace', label: 'Demandes ouvertes', icon: Store },
            { id: 'quotes', label: 'Mes devis envoyés', icon: Send },
        ] : []),
    ];

    const handleCreate = (form) => {
        createMutation.mutate(form, { onSuccess: () => setShowCreate(false) });
    };

    const handleSubmitQuote = (form) => {
        submitQuoteMutation.mutate({ id: quoteTarget.id, payload: form }, { onSuccess: () => setQuoteTarget(null) });
    };

    const handleAccept = (id, quoteId) => acceptMutation.mutate({ id, quoteId });
    const handleClose = (id) => {
        if (window.confirm('Fermer cette demande sans accepter de devis ?')) closeMutation.mutate(id);
    };

    const activeList = tab === 'mine' ? myRfqs : tab === 'marketplace' ? openRfqs : [];
    const activeLoading = tab === 'mine' ? loadingMine : tab === 'marketplace' ? loadingOpen : loadingQuotes;
    const activeError = tab === 'mine' ? errorMine : tab === 'marketplace' ? errorOpen : errorQuotes;
    const activeRefetch = tab === 'mine' ? refetchMine : refetchOpen;

    return (
        <DashboardLayout title="Demandes de devis (RFQ)" noFooter>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                            Demandes de devis
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Publiez un besoin, recevez plusieurs offres, choisissez la meilleure — comme sur Alibaba.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-primary/25 transition-all"
                    >
                        <Plus className="size-4" />
                        Nouvelle demande
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                                tab === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            <Icon className="size-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'quotes' ? (
                    <DataStateWrapper isLoading={loadingQuotes} error={errorQuotes} loadingVariant="grid">
                        {myQuotes.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground">
                                <Send className="size-12 mx-auto mb-4 opacity-40" />
                                <p className="font-bold">Aucun devis envoyé pour le moment.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {myQuotes.map((q) => (
                                    <div key={q.id} className="bg-card border border-border rounded-2xl p-5 space-y-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${q.statut === 'accepte' ? 'bg-emerald-500/15 text-emerald-600' : q.statut === 'refuse' ? 'bg-destructive/15 text-destructive' : 'bg-amber-500/15 text-amber-600'}`}>
                                            {q.statut === 'accepte' ? 'Accepté' : q.statut === 'refuse' ? 'Refusé' : 'En attente'}
                                        </span>
                                        <h3 className="font-bold text-foreground">{q.demande?.titre}</h3>
                                        <p className="text-sm text-muted-foreground">Par {q.demande?.demandeur?.nom_complet}</p>
                                        <p className="text-sm font-bold text-primary">{formatGnf(q.prix_unitaire)} / unité</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DataStateWrapper>
                ) : (
                    <DataStateWrapper isLoading={activeLoading} error={activeError} onRetry={activeRefetch} loadingVariant="grid">
                        {activeList.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground">
                                <FileText className="size-12 mx-auto mb-4 opacity-40" />
                                <p className="font-bold">
                                    {tab === 'mine' ? "Vous n'avez publié aucune demande." : 'Aucune demande ouverte pour le moment.'}
                                </p>
                                {tab === 'mine' && (
                                    <button onClick={() => setShowCreate(true)} className="mt-4 text-primary font-bold hover:underline">
                                        Publier votre première demande
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {activeList.map((demande) => (
                                    <RequestCard
                                        key={demande.id}
                                        demande={demande}
                                        userId={user?.id}
                                        mode={tab}
                                        onQuote={setQuoteTarget}
                                        onAccept={handleAccept}
                                        onClose={handleClose}
                                        acceptPending={acceptMutation.isPending}
                                        closePending={closeMutation.isPending}
                                    />
                                ))}
                            </div>
                        )}
                    </DataStateWrapper>
                )}
            </div>

            <CreateModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreate}
                pending={createMutation.isPending}
            />

            <QuoteModal
                demande={quoteTarget}
                onClose={() => setQuoteTarget(null)}
                onSubmit={handleSubmitQuote}
                pending={submitQuoteMutation.isPending}
            />
        </DashboardLayout>
    );
};

export default Rfq;
