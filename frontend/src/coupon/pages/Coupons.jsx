import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DataStateWrapper } from '../../components/ui/DataStates';
import { Tag, Plus, Power, TrendingUp, Calendar, Users } from 'lucide-react';
import { useMyCoupons, useCreateCoupon, useToggleCoupon } from '../hooks/useCouponData';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/helpers';
import ModalOverlay from '../../components/ui/ModalOverlay';

const formatGnf = (amount) => `${formatCurrency(amount)} GNF`;

const CouponCard = ({ coupon, onToggle, togglePending }) => {
    const isExpired = coupon.date_fin && new Date(coupon.date_fin) < new Date();
    return (
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <Tag className="size-4 text-primary" />
                        <span className="font-mono font-black text-lg tracking-wider text-foreground">{coupon.code}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {coupon.type === 'percentage' ? `-${coupon.valeur}%` : `-${formatGnf(coupon.valeur)}`}
                        {coupon.boutique ? ` · ${coupon.boutique.nom_boutique}` : ' · Plateforme'}
                    </p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${coupon.actif && !isExpired ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                    {isExpired ? 'Expiré' : coupon.actif ? 'Actif' : 'Inactif'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <TrendingUp className="size-3.5" />
                    {coupon.usage_count} utilisation(s){coupon.usage_max ? ` / ${coupon.usage_max}` : ''}
                </div>
                <div className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    Max {coupon.usage_max_par_utilisateur}/utilisateur
                </div>
                {coupon.montant_min && (
                    <div className="col-span-2">Achat min. {formatGnf(coupon.montant_min)}</div>
                )}
                {coupon.date_fin && (
                    <div className="flex items-center gap-1.5 col-span-2">
                        <Calendar className="size-3.5" />
                        Expire le {new Date(coupon.date_fin).toLocaleDateString()}
                    </div>
                )}
            </div>

            <button
                onClick={() => onToggle(coupon.id)}
                disabled={togglePending}
                className="mt-auto flex items-center justify-center gap-2 h-9 rounded-xl border border-border text-sm font-bold hover:bg-muted transition disabled:opacity-50"
            >
                <Power className="size-3.5" />
                {coupon.actif ? 'Désactiver' : 'Activer'}
            </button>
        </div>
    );
};

const CreateModal = ({ open, onClose, onSubmit, pending }) => {
    const [form, setForm] = useState({
        code: '', type: 'percentage', valeur: '', montant_min: '', date_fin: '',
        usage_max: '', usage_max_par_utilisateur: 1,
    });
    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    return (
        <ModalOverlay open={open} onClose={onClose} title="Nouveau code promo" maxWidth="max-w-md">
            <div className="px-6 pb-6 space-y-4">
                <div>
                    <label className="text-sm font-bold">Code *</label>
                    <input
                        value={form.code}
                        onChange={(e) => set('code', e.target.value.toUpperCase())}
                        className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background font-mono uppercase"
                        placeholder="BIENVENUE10"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-bold">Type</label>
                        <select
                            value={form.type}
                            onChange={(e) => set('type', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        >
                            <option value="percentage">Pourcentage (%)</option>
                            <option value="fixed">Montant fixe (GNF)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold">Valeur *</label>
                        <input
                            type="number"
                            min={1}
                            value={form.valeur}
                            onChange={(e) => set('valeur', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-bold">Achat minimum (GNF)</label>
                        <input
                            type="number"
                            min={0}
                            value={form.montant_min}
                            onChange={(e) => set('montant_min', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold">Date d&apos;expiration</label>
                        <input
                            type="date"
                            value={form.date_fin}
                            onChange={(e) => set('date_fin', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-bold">Utilisations max (total)</label>
                        <input
                            type="number"
                            min={1}
                            value={form.usage_max}
                            onChange={(e) => set('usage_max', e.target.value)}
                            placeholder="Illimité"
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold">Max par utilisateur</label>
                        <input
                            type="number"
                            min={1}
                            value={form.usage_max_par_utilisateur}
                            onChange={(e) => set('usage_max_par_utilisateur', e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl font-medium">Annuler</button>
                    <button
                        type="button"
                        onClick={() => onSubmit(form)}
                        disabled={pending || !form.code.trim() || !form.valeur}
                        className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50"
                    >
                        Créer
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};

const Coupons = () => {
    const { user } = useAuth();
    const [showCreate, setShowCreate] = useState(false);
    const { data: coupons, loading, error, refetch } = useMyCoupons();
    const createMutation = useCreateCoupon();
    const toggleMutation = useToggleCoupon();

    const handleCreate = (form) => {
        createMutation.mutate(form, { onSuccess: () => setShowCreate(false) });
    };

    return (
        <DashboardLayout title="Codes promo" noFooter>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Codes promo</h1>
                        <p className="text-muted-foreground mt-1">
                            {user?.role === 'admin'
                                ? 'Créez des codes promo valables sur toute la plateforme.'
                                : 'Créez des codes promo valables sur les produits de votre boutique.'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-primary/25 transition-all"
                    >
                        <Plus className="size-4" />
                        Nouveau code
                    </button>
                </div>

                <DataStateWrapper isLoading={loading} error={error} onRetry={refetch} loadingVariant="grid">
                    {coupons.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Tag className="size-12 mx-auto mb-4 opacity-40" />
                            <p className="font-bold">Aucun code promo créé.</p>
                            <button onClick={() => setShowCreate(true)} className="mt-4 text-primary font-bold hover:underline">
                                Créer votre premier code promo
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {coupons.map((c) => (
                                <CouponCard
                                    key={c.id}
                                    coupon={c}
                                    onToggle={(id) => toggleMutation.mutate(id)}
                                    togglePending={toggleMutation.isPending}
                                />
                            ))}
                        </div>
                    )}
                </DataStateWrapper>
            </div>

            <CreateModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreate}
                pending={createMutation.isPending}
            />
        </DashboardLayout>
    );
};

export default Coupons;
