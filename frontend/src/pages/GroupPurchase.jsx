import React, { useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { DataStateWrapper } from '../components/ui/DataStates';
import {
  Users, Zap, Plus, Target, Calendar, MapPin, Percent, Package,
  CheckCircle2, X, LogOut, Lock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useDomainData';
import {
  useGroupPurchases,
  useCreateGroupPurchase,
  useJoinGroupPurchase,
  useLeaveGroupPurchase,
  useCloseGroupPurchase,
} from '../hooks/useDomainData';
import { formatCurrency, formatDate } from '../utils/helpers';
import { ROLES } from '../constants/roles';

const ORGANIZER_TYPES = [
  { value: 'ong', label: 'ONG' },
  { value: 'pme', label: 'PME' },
  { value: 'institution', label: 'Institution' },
  { value: 'particulier', label: 'Particulier' },
  { value: 'autre', label: 'Autre' },
];

const STATUS_LABELS = {
  ouvert: { label: 'Ouvert', className: 'bg-emerald-500/15 text-emerald-600' },
  atteint: { label: 'Objectif atteint', className: 'bg-primary/15 text-primary' },
  cloture: { label: 'Clôturé', className: 'bg-slate-500/15 text-slate-500' },
  annule: { label: 'Annulé', className: 'bg-destructive/15 text-destructive' },
};

const formatGnf = (amount) => `${formatCurrency(amount)} GNF`;

const progressPct = (current, target) => Math.min(100, Math.round((current / target) * 100));

const CampaignCard = ({
  campaign,
  userId,
  userRole,
  onJoin,
  onLeave,
  onClose,
  joinPending,
  leavePending,
  closePending,
}) => {
  const pct = progressPct(campaign.quantite_actuelle, campaign.quantite_cible);
  const status = STATUS_LABELS[campaign.statut] || STATUS_LABELS.ouvert;
  const isOrganizer = campaign.organisateur_id === userId;
  const participation = (campaign.participants || []).find(
    (p) => p.utilisateur_id === userId && p.statut !== 'annule',
  );
  const canJoin = !isOrganizer && !participation && ['ouvert', 'atteint'].includes(campaign.statut);
  const canLeave = participation?.statut === 'engage' && campaign.statut === 'ouvert';
  const canClose = (isOrganizer || userRole === ROLES.ADMIN)
    && campaign.statut !== 'cloture'
    && (campaign.participants || []).some((p) => p.statut === 'engage');

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${status.className}`}>
              {status.label}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
              {campaign.type_organisateur || 'particulier'}
            </span>
          </div>
          <h3 className="font-bold text-lg text-foreground line-clamp-2">{campaign.titre}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {campaign.description || 'Aucune description.'}
          </p>
        </div>
        {campaign.produit?.image_url && (
          <img
            src={campaign.produit.image_url}
            alt=""
            className="size-16 rounded-xl object-cover shrink-0"
          />
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Package className="size-4 shrink-0" />
        <span className="truncate">{campaign.produit?.nom_produit || 'Produit'}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Percent className="size-4 text-primary" />
          <span><strong>-{campaign.remise_pct}%</strong> remise</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <span className="truncate">{campaign.zone_livraison || 'Conakry'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-primary" />
          <span>Limite {formatDate(campaign.date_limite)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <span>{(campaign.participants || []).filter((p) => p.statut !== 'annule').length} participant(s)</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-bold mb-1">
          <span>{campaign.quantite_actuelle} / {campaign.quantite_cible} unités</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-lg font-black text-primary">{formatGnf(campaign.prix_unitaire_groupe)}</span>
        <span className="text-sm text-muted-foreground line-through">{formatGnf(campaign.prix_unitaire_normal)}</span>
        <span className="text-xs text-muted-foreground">/ unité</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        {canJoin && (
          <button
            onClick={() => onJoin(campaign)}
            className="flex-1 min-w-[120px] px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition"
          >
            Rejoindre
          </button>
        )}
        {canLeave && (
          <button
            onClick={() => onLeave(campaign.id)}
            disabled={leavePending}
            className="flex items-center gap-1 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition disabled:opacity-50"
          >
            <LogOut className="size-4" />
            Quitter
          </button>
        )}
        {canClose && (
          <button
            onClick={() => onClose(campaign.id)}
            disabled={closePending}
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            <Lock className="size-4" />
            Clôturer
          </button>
        )}
        {participation && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 px-2 py-1">
            <CheckCircle2 className="size-4" />
            {participation.quantite} unité(s) — {formatGnf(participation.montant_total)}
          </span>
        )}
        {isOrganizer && (
          <span className="text-xs font-bold text-muted-foreground px-2 py-1">Votre campagne</span>
        )}
      </div>
    </div>
  );
};

const JoinModal = ({ campaign, onClose, onConfirm, pending }) => {
  const [qty, setQty] = useState(1);
  const total = (campaign?.prix_unitaire_groupe || 0) * qty;

  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg">Rejoindre la campagne</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="size-5" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{campaign.titre}</p>
        <label className="block text-sm font-bold mb-2">Quantité</label>
        <input
          type="number"
          min={1}
          max={campaign.quantite_cible - campaign.quantite_actuelle}
          value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="w-full px-4 py-2 border border-border rounded-xl bg-background mb-4"
        />
        <p className="text-sm mb-4">
          Total estimé : <strong className="text-primary">{formatGnf(total)}</strong>
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-border rounded-xl font-medium">Annuler</button>
          <button
            onClick={() => onConfirm(campaign.id, qty)}
            disabled={pending}
            className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateModal = ({ open, onClose, products, onSubmit, pending }) => {
  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }, []);

  const [form, setForm] = useState({
    produit_id: '',
    titre: '',
    description: '',
    quantite_cible: 10,
    remise_pct: 15,
    date_limite: defaultDate,
    zone_livraison: 'Conakry',
    type_organisateur: 'ong',
  });

  if (!open) return null;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg">Nouvelle campagne groupée</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="size-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold">Produit *</label>
            <select
              value={form.produit_id}
              onChange={(e) => set('produit_id', e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
            >
              <option value="">Sélectionner un produit</option>
              {(products || []).map((p) => (
                <option key={p.id} value={p.id}>{p.nom_produit || p.name} — {formatGnf(p.prix_unitaire || p.price)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold">Titre *</label>
            <input
              value={form.titre}
              onChange={(e) => set('titre', e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
              placeholder="Ex. Kits scolaires — ONG Éducation"
            />
          </div>
          <div>
            <label className="text-sm font-bold">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold">Quantité cible *</label>
              <input
                type="number"
                min={2}
                value={form.quantite_cible}
                onChange={(e) => set('quantite_cible', e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-bold">Remise (%)</label>
              <input
                type="number"
                min={5}
                max={40}
                value={form.remise_pct}
                onChange={(e) => set('remise_pct', e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold">Date limite *</label>
              <input
                type="date"
                value={form.date_limite}
                onChange={(e) => set('date_limite', e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-bold">Type organisateur</label>
              <select
                value={form.type_organisateur}
                onChange={(e) => set('type_organisateur', e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
              >
                {ORGANIZER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-bold">Zone de livraison</label>
            <input
              value={form.zone_livraison}
              onChange={(e) => set('zone_livraison', e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border border-border rounded-xl font-medium">Annuler</button>
          <button
            onClick={() => onSubmit(form)}
            disabled={pending || !form.produit_id || !form.titre}
            className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50"
          >
            Créer la campagne
          </button>
        </div>
      </div>
    </div>
  );
};

const GroupPurchase = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('discover');
  const [joinTarget, setJoinTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const discoverParams = tab === 'discover' ? {} : tab === 'joined' ? { mine: 'joined' } : { mine: 'organized' };

  const { data: campaigns, loading, error, refetch } = useGroupPurchases(discoverParams);
  const { data: productsData } = useProducts({ limit: 100 });
  const products = productsData?.products || (Array.isArray(productsData) ? productsData : []);
  const createMutation = useCreateGroupPurchase();
  const joinMutation = useJoinGroupPurchase();
  const leaveMutation = useLeaveGroupPurchase();
  const closeMutation = useCloseGroupPurchase();

  const canCreate = [ROLES.CLIENT, ROLES.ADMIN, ROLES.FOURNISSEUR, ROLES.BANQUE].includes(user?.role);

  const tabs = [
    { id: 'discover', label: 'Campagnes actives', icon: Zap },
    { id: 'joined', label: 'Mes participations', icon: Users },
    { id: 'organized', label: 'Mes campagnes', icon: Target },
  ];

  const handleCreate = (form) => {
    createMutation.mutate(form, { onSuccess: () => setShowCreate(false) });
  };

  const handleJoin = (id, quantite) => {
    joinMutation.mutate({ id, quantite }, { onSuccess: () => setJoinTarget(null) });
  };

  return (
    <DashboardLayout title="Achats Groupés">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Achats Groupés ONG / B2B
            </h1>
            <p className="text-muted-foreground mt-1">
              Mutualisez vos achats pour réduire les coûts — idéal pour ONG, PME et institutions.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Plus className="size-4" />
              Nouvelle campagne
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                tab === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <DataStateWrapper isLoading={loading} error={error} onRetry={refetch} loadingVariant="grid">
          {campaigns.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Target className="size-12 mx-auto mb-4 opacity-40" />
              <p className="font-bold">Aucune campagne pour le moment.</p>
              {canCreate && tab === 'organized' && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 text-primary font-bold hover:underline"
                >
                  Créer la première campagne
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  userId={user?.id}
                  userRole={user?.role}
                  onJoin={setJoinTarget}
                  onLeave={(id) => leaveMutation.mutate(id)}
                  onClose={(id) => {
                    if (window.confirm('Clôturer cette campagne et générer les commandes au tarif groupé ?')) {
                      closeMutation.mutate(id);
                    }
                  }}
                  joinPending={joinMutation.isPending}
                  leavePending={leaveMutation.isPending}
                  closePending={closeMutation.isPending}
                />
              ))}
            </div>
          )}
        </DataStateWrapper>
      </div>

      <JoinModal
        campaign={joinTarget}
        onClose={() => setJoinTarget(null)}
        onConfirm={handleJoin}
        pending={joinMutation.isPending}
      />

      <CreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        products={products}
        onSubmit={handleCreate}
        pending={createMutation.isPending}
      />
    </DashboardLayout>
  );
};

export default GroupPurchase;
