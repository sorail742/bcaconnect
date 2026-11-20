import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Building2, Plus, UserPlus, Trash2, ClipboardCheck, CheckCircle2, XCircle, Users } from 'lucide-react';
import {
    useMyOrganizations, useCreateOrganization, useOrganizationMembers, useInviteMember,
    useRemoveMember, useUpdateThreshold, usePendingOrderRequests, useApproveRequest, useRejectRequest,
} from '../hooks/useOrganizationData';

const ROLE_LABELS = { acheteur: 'Acheteur', valideur: 'Valideur', admin: 'Administrateur' };

const CreateOrgForm = ({ onCreated }) => {
    const [nom, setNom] = useState('');
    const [plafond, setPlafond] = useState('');
    const createOrg = useCreateOrganization();

    const submit = (e) => {
        e.preventDefault();
        createOrg.mutate(
            { nom, plafond_approbation_auto: plafond ? parseFloat(plafond) : null },
            { onSuccess: () => { setNom(''); setPlafond(''); onCreated?.(); } }
        );
    };

    return (
        <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px] space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Nom de l'organisation</label>
                <input required value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Chantier Kaloum SARL"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/50" />
            </div>
            <div className="w-56 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Plafond d'auto-approbation (GNF)</label>
                <input type="number" min={0} value={plafond} onChange={e => setPlafond(e.target.value)} placeholder="Illimité si vide"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/50" />
            </div>
            <button type="submit" disabled={createOrg.isPending}
                className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2 border-none disabled:opacity-50">
                <Plus className="size-4" /> Créer
            </button>
        </form>
    );
};

const MembersPanel = ({ org }) => {
    const { data: members = [] } = useOrganizationMembers(org.id);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('acheteur');
    const invite = useInviteMember(org.id);
    const remove = useRemoveMember(org.id);

    return (
        <div className="space-y-3">
            <form onSubmit={(e) => { e.preventDefault(); invite.mutate({ email, role_membre: role }, { onSuccess: () => setEmail('') }); }}
                className="flex flex-wrap items-end gap-2">
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com"
                    className="flex-1 min-w-[180px] h-9 px-3 rounded-lg border border-border bg-background text-xs outline-none" />
                <select value={role} onChange={e => setRole(e.target.value)} className="h-9 px-2 rounded-lg border border-border bg-background text-xs">
                    <option value="acheteur">Acheteur</option>
                    <option value="valideur">Valideur</option>
                    <option value="admin">Administrateur</option>
                </select>
                <button type="submit" disabled={invite.isPending} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 border-none disabled:opacity-50">
                    <UserPlus className="size-3.5" /> Inviter
                </button>
            </form>

            <div className="space-y-1.5">
                {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 bg-muted/50 rounded-lg px-3 py-2 text-xs">
                        <div>
                            <span className="font-bold text-foreground">{m.utilisateur?.nom_complet}</span>
                            <span className="text-muted-foreground"> · {m.utilisateur?.email} · {ROLE_LABELS[m.role]}</span>
                        </div>
                        {m.user_id !== org.proprietaire_id && (
                            <button onClick={() => remove.mutate(m.id)} className="text-muted-foreground hover:text-rose-500 border-none bg-transparent">
                                <Trash2 className="size-3.5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const PendingRequestsPanel = ({ orgId }) => {
    const { data: requests = [] } = usePendingOrderRequests(orgId);
    const approve = useApproveRequest(orgId);
    const reject = useRejectRequest(orgId);

    if (requests.length === 0) {
        return <p className="text-xs text-muted-foreground py-4 text-center">Aucune demande en attente.</p>;
    }

    return (
        <div className="space-y-2">
            {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3">
                    <div>
                        <p className="text-sm font-bold text-foreground">{r.demandeur?.nom_complet}</p>
                        <p className="text-xs text-muted-foreground">{parseFloat(r.montant_estime).toLocaleString('fr-FR')} GNF · {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => reject.mutate({ requestId: r.id })} className="size-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 border-none">
                            <XCircle className="size-4" />
                        </button>
                        <button onClick={() => approve.mutate(r.id)} className="size-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border-none">
                            <CheckCircle2 className="size-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const OrgCard = ({ org, isOwnerOrAdmin }) => {
    const [tab, setTab] = useState('membres');
    const updateThreshold = useUpdateThreshold(org.id);
    const [plafond, setPlafond] = useState(org.plafond_approbation_auto ?? '');

    return (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Building2 className="size-5" /></div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-foreground">{org.nom}</h3>
                    <p className="text-xs text-muted-foreground">
                        Plafond d'auto-approbation : {org.plafond_approbation_auto ? `${parseFloat(org.plafond_approbation_auto).toLocaleString('fr-FR')} GNF` : 'illimité'}
                    </p>
                </div>
                {isOwnerOrAdmin && (
                    <div className="flex items-center gap-1.5">
                        <input type="number" min={0} value={plafond} onChange={e => setPlafond(e.target.value)} placeholder="Illimité"
                            className="w-32 h-8 px-2 rounded-lg border border-border bg-background text-xs" />
                        <button onClick={() => updateThreshold.mutate(plafond ? parseFloat(plafond) : null)}
                            className="h-8 px-2 rounded-lg bg-muted text-xs font-bold border-none">OK</button>
                    </div>
                )}
            </div>

            <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
                <button onClick={() => setTab('membres')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${tab === 'membres' ? 'bg-card' : 'text-muted-foreground'}`}>
                    <Users className="size-3.5" /> Membres
                </button>
                <button onClick={() => setTab('demandes')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${tab === 'demandes' ? 'bg-card' : 'text-muted-foreground'}`}>
                    <ClipboardCheck className="size-3.5" /> Approbations
                </button>
            </div>

            {tab === 'membres' ? <MembersPanel org={org} /> : <PendingRequestsPanel orgId={org.id} />}
        </div>
    );
};

const Organizations = () => {
    const { data, loading, refetch } = useMyOrganizations();

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-xl font-black text-foreground">Comptes entreprise</h1>
                    <p className="text-sm text-muted-foreground">Gérez vos organisations, invitez des membres et approuvez les demandes d'achat.</p>
                </div>

                <CreateOrgForm onCreated={refetch} />

                {!loading && (data?.possedees?.length > 0 || data?.membre_de?.length > 0) ? (
                    <div className="space-y-4">
                        {data.possedees.map((org) => <OrgCard key={org.id} org={org} isOwnerOrAdmin />)}
                        {data.membre_de
                            .filter((m) => !data.possedees.some((o) => o.id === m.organisation.id))
                            .map(({ organisation, role }) => (
                                <OrgCard key={organisation.id} org={organisation} isOwnerOrAdmin={role === 'admin'} />
                            ))}
                    </div>
                ) : !loading && (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        Vous ne faites partie d'aucune organisation pour le moment.
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Organizations;
