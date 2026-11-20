import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FileText, Plus, Trash2, Download, Search, Loader2, ReceiptText, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import orderService from '../services/orderService';
import { generateFactureOrProformaPdf, generateBonDeCommandePdf } from '../../lib/bcaDocumentPdf';

const DOC_TYPES = [
    { id: 'facture', label: 'Facture', icon: ReceiptText },
    { id: 'proforma', label: 'Facture Proforma', icon: FileText },
    { id: 'bon_commande', label: 'Bon de Commande', icon: ClipboardList },
];

const emptyFactureItem = () => ({ description: '', qte: 1, prixUnitaire: '' });
const emptyBonItem = () => ({ designation: '', reference: '', qte: 1, puHT: '', tva: '' });

const Field = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">{label}</label>
        <input
            {...props}
            className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
        />
    </div>
);

const DocumentGenerator = () => {
    const [docType, setDocType] = useState('facture');
    const [numero, setNumero] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    // Facture / Facture Proforma
    const [client, setClient] = useState({ nom: '', adresse: '', telephone: '' });
    const [factureItems, setFactureItems] = useState([emptyFactureItem()]);
    const [livraison, setLivraison] = useState('');
    const [conditionsPaiement, setConditionsPaiement] = useState('');
    const [modePaiement, setModePaiement] = useState('');

    // Bon de Commande
    const [fournisseur, setFournisseur] = useState({ raisonSociale: '', adresse: '', telephone: '', email: '' });
    const [livraisonBC, setLivraisonBC] = useState({ lieu: '', contact: '', telephone: '', dateSouhaitee: '', incoterm: '' });
    const [informationsBC, setInformationsBC] = useState({ demandeur: '', service: '', referenceProjet: '', modePaiement: '', delaiPaiement: '' });
    const [bonItems, setBonItems] = useState([emptyBonItem()]);
    const [objet, setObjet] = useState('');

    const [orderIdToLoad, setOrderIdToLoad] = useState('');
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);

    const isFactureType = docType === 'facture' || docType === 'proforma';

    const handleLoadFromOrder = async () => {
        if (!orderIdToLoad.trim()) {
            toast.warning('Saisissez un identifiant de commande.');
            return;
        }
        setIsLoadingOrder(true);
        try {
            const order = await orderService.getById(orderIdToLoad.trim());
            setClient({
                nom: order.client?.nom_complet || order.nom_destinataire || '',
                adresse: order.adresse_livraison || '',
                telephone: order.client?.telephone || order.telephone_livraison || '',
            });
            const items = (order.details || []).map((item) => ({
                description: item.produit?.nom_produit || 'Article',
                qte: item.quantite,
                prixUnitaire: parseFloat(item.prix_unitaire_achat) || 0,
            }));
            setFactureItems(items.length > 0 ? items : [emptyFactureItem()]);
            setModePaiement(order.methode_paiement || '');
            setNumero((prev) => prev || `CMD-${order.id.slice(0, 8).toUpperCase()}`);
            toast.success('Commande chargée. Vérifiez les données avant de générer.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Commande introuvable ou accès refusé.');
        } finally {
            setIsLoadingOrder(false);
        }
    };

    const handleGenerate = () => {
        if (!numero.trim()) {
            toast.error('Le numéro du document est requis.');
            return;
        }
        try {
            let doc;
            if (isFactureType) {
                if (!client.nom.trim()) {
                    toast.error('Le nom du client est requis.');
                    return;
                }
                const validItems = factureItems.filter((it) => it.description.trim());
                if (validItems.length === 0) {
                    toast.error('Ajoutez au moins un article.');
                    return;
                }
                doc = generateFactureOrProformaPdf(docType, {
                    numero, date, client, items: validItems, livraison, conditionsPaiement, modePaiement,
                });
            } else {
                if (!fournisseur.raisonSociale.trim()) {
                    toast.error('La raison sociale du fournisseur est requise.');
                    return;
                }
                const validItems = bonItems.filter((it) => it.designation.trim());
                if (validItems.length === 0) {
                    toast.error('Ajoutez au moins un article.');
                    return;
                }
                doc = generateBonDeCommandePdf({
                    numero, date, fournisseur, livraison: livraisonBC, informations: informationsBC, items: validItems, objet,
                });
            }
            const typeLabel = DOC_TYPES.find((t) => t.id === docType)?.label.replace(/\s+/g, '_') || 'document';
            doc.save(`BCA_${typeLabel}_${numero}.pdf`);
            toast.success('Document généré avec succès.');
        } catch (err) {
            console.error('Erreur génération PDF:', err);
            toast.error('Échec de la génération du document.');
        }
    };

    return (
        <DashboardLayout title="Documents Commerciaux">
            <div className="space-y-5 pb-24 max-w-4xl">
                <div className="bg-card p-4 rounded-2xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase">Générateur de Documents</h2>
                            <p className="text-[11px] text-muted-foreground">Facture, Facture Proforma et Bon de Commande — gabarits officiels BCA</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {DOC_TYPES.map((t) => {
                            const Icon = t.icon;
                            const active = docType === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setDocType(t.id)}
                                    className={cn(
                                        'flex flex-col items-center gap-2 py-3 rounded-xl border text-xs font-semibold transition-colors',
                                        active ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                                    )}
                                >
                                    <Icon className="size-5" />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {isFactureType && (
                    <div className="bg-card p-4 rounded-2xl border border-border shadow-sm space-y-3">
                        <label className="text-xs font-semibold text-muted-foreground">Pré-remplir depuis une commande existante (optionnel)</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <input
                                    value={orderIdToLoad}
                                    onChange={(e) => setOrderIdToLoad(e.target.value)}
                                    placeholder="ID de la commande..."
                                    className="w-full h-10 pl-9 pr-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleLoadFromOrder}
                                disabled={isLoadingOrder}
                                className="h-10 px-4 bg-muted hover:bg-muted/70 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoadingOrder ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                Charger
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-card p-4 rounded-2xl border border-border shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Numéro *" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="FAC-0001" />
                        <Field label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>

                    {isFactureType ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Field label="Client *" value={client.nom} onChange={(e) => setClient((p) => ({ ...p, nom: e.target.value }))} placeholder="Nom du client" />
                                <Field label="Adresse" value={client.adresse} onChange={(e) => setClient((p) => ({ ...p, adresse: e.target.value }))} />
                                <Field label="Téléphone" value={client.telephone} onChange={(e) => setClient((p) => ({ ...p, telephone: e.target.value }))} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-muted-foreground">Articles *</label>
                                    <button type="button" onClick={() => setFactureItems((p) => [...p, emptyFactureItem()])} className="text-xs font-semibold text-primary flex items-center gap-1">
                                        <Plus className="size-3.5" /> Ajouter
                                    </button>
                                </div>
                                {factureItems.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-[1fr_80px_120px_32px] gap-2">
                                        <input
                                            value={item.description}
                                            onChange={(e) => setFactureItems((p) => p.map((it, i) => i === idx ? { ...it, description: e.target.value } : it))}
                                            placeholder="Description"
                                            className="h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        />
                                        <input
                                            type="number"
                                            value={item.qte}
                                            onChange={(e) => setFactureItems((p) => p.map((it, i) => i === idx ? { ...it, qte: e.target.value } : it))}
                                            placeholder="Qté"
                                            className="h-10 px-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        />
                                        <input
                                            type="number"
                                            value={item.prixUnitaire}
                                            onChange={(e) => setFactureItems((p) => p.map((it, i) => i === idx ? { ...it, prixUnitaire: e.target.value } : it))}
                                            placeholder="PU (GNF)"
                                            className="h-10 px-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFactureItems((p) => p.filter((_, i) => i !== idx))}
                                            disabled={factureItems.length === 1}
                                            className="size-10 rounded-xl bg-muted hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center disabled:opacity-30"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Field label="Délai et lieu de livraison" value={livraison} onChange={(e) => setLivraison(e.target.value)} />
                                <Field label="Conditions de paiement" value={conditionsPaiement} onChange={(e) => setConditionsPaiement(e.target.value)} />
                                <Field label="Mode de paiement" value={modePaiement} onChange={(e) => setModePaiement(e.target.value)} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Raison sociale (fournisseur) *" value={fournisseur.raisonSociale} onChange={(e) => setFournisseur((p) => ({ ...p, raisonSociale: e.target.value }))} />
                                <Field label="Adresse" value={fournisseur.adresse} onChange={(e) => setFournisseur((p) => ({ ...p, adresse: e.target.value }))} />
                                <Field label="Téléphone" value={fournisseur.telephone} onChange={(e) => setFournisseur((p) => ({ ...p, telephone: e.target.value }))} />
                                <Field label="Email" value={fournisseur.email} onChange={(e) => setFournisseur((p) => ({ ...p, email: e.target.value }))} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Field label="Lieu de livraison" value={livraisonBC.lieu} onChange={(e) => setLivraisonBC((p) => ({ ...p, lieu: e.target.value }))} />
                                <Field label="Contact" value={livraisonBC.contact} onChange={(e) => setLivraisonBC((p) => ({ ...p, contact: e.target.value }))} />
                                <Field label="Téléphone" value={livraisonBC.telephone} onChange={(e) => setLivraisonBC((p) => ({ ...p, telephone: e.target.value }))} />
                                <Field label="Date souhaitée" type="date" value={livraisonBC.dateSouhaitee} onChange={(e) => setLivraisonBC((p) => ({ ...p, dateSouhaitee: e.target.value }))} />
                                <Field label="Incoterm" value={livraisonBC.incoterm} onChange={(e) => setLivraisonBC((p) => ({ ...p, incoterm: e.target.value }))} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Field label="Demandeur" value={informationsBC.demandeur} onChange={(e) => setInformationsBC((p) => ({ ...p, demandeur: e.target.value }))} />
                                <Field label="Service" value={informationsBC.service} onChange={(e) => setInformationsBC((p) => ({ ...p, service: e.target.value }))} />
                                <Field label="Référence projet" value={informationsBC.referenceProjet} onChange={(e) => setInformationsBC((p) => ({ ...p, referenceProjet: e.target.value }))} />
                                <Field label="Mode de paiement" value={informationsBC.modePaiement} onChange={(e) => setInformationsBC((p) => ({ ...p, modePaiement: e.target.value }))} />
                                <Field label="Délai de paiement" value={informationsBC.delaiPaiement} onChange={(e) => setInformationsBC((p) => ({ ...p, delaiPaiement: e.target.value }))} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-muted-foreground">Articles *</label>
                                    <button type="button" onClick={() => setBonItems((p) => [...p, emptyBonItem()])} className="text-xs font-semibold text-primary flex items-center gap-1">
                                        <Plus className="size-3.5" /> Ajouter
                                    </button>
                                </div>
                                {bonItems.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-[1fr_1fr_60px_100px_70px_32px] gap-2">
                                        <input
                                            value={item.designation}
                                            onChange={(e) => setBonItems((p) => p.map((it, i) => i === idx ? { ...it, designation: e.target.value } : it))}
                                            placeholder="Désignation"
                                            className="h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        />
                                        <input
                                            value={item.reference}
                                            onChange={(e) => setBonItems((p) => p.map((it, i) => i === idx ? { ...it, reference: e.target.value } : it))}
                                            placeholder="Référence"
                                            className="h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        />
                                        <input
                                            type="number"
                                            value={item.qte}
                                            onChange={(e) => setBonItems((p) => p.map((it, i) => i === idx ? { ...it, qte: e.target.value } : it))}
                                            placeholder="Qté"
                                            className="h-10 px-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        />
                                        <input
                                            type="number"
                                            value={item.puHT}
                                            onChange={(e) => setBonItems((p) => p.map((it, i) => i === idx ? { ...it, puHT: e.target.value } : it))}
                                            placeholder="PU HT"
                                            className="h-10 px-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        />
                                        <input
                                            type="number"
                                            value={item.tva}
                                            onChange={(e) => setBonItems((p) => p.map((it, i) => i === idx ? { ...it, tva: e.target.value } : it))}
                                            placeholder="TVA %"
                                            className="h-10 px-2 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setBonItems((p) => p.filter((_, i) => i !== idx))}
                                            disabled={bonItems.length === 1}
                                            className="size-10 rounded-xl bg-muted hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center disabled:opacity-30"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Objet de la commande</label>
                                <textarea
                                    value={objet}
                                    onChange={(e) => setObjet(e.target.value)}
                                    rows={3}
                                    className="w-full p-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 resize-none"
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <Download className="size-4" /> Générer le PDF
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DocumentGenerator;
