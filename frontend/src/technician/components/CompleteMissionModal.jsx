import React, { useState } from 'react';
import { X, FileText, Banknote, Loader2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const CompleteMissionModal = ({ isOpen, onClose, mission, onSubmit, isLoading }) => {
    const [rapport, setRapport] = useState('');
    const [cout, setCout] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            rapport_technique: rapport.trim() || 'Intervention terminée conformément aux normes BCA.',
            cout_estime: parseFloat(cout) || 0,
        });
    };

    if (!isOpen || !mission) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Finaliser l'intervention">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-xl bg-muted/50 p-4 border border-border">
                    <p className="text-sm font-bold text-foreground">{mission.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mission.client} — {mission.location}</p>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                        <FileText className="size-4 text-primary" />
                        Rapport technique
                    </label>
                    <textarea
                        value={rapport}
                        onChange={(e) => setRapport(e.target.value)}
                        rows={4}
                        placeholder="Décrivez les travaux effectués, pièces remplacées, recommandations..."
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                        <Banknote className="size-4 text-primary" />
                        Honoraires (GNF)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="5000"
                        value={cout}
                        onChange={(e) => setCout(e.target.value)}
                        placeholder="Ex: 150000"
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Le montant sera crédité sur votre portefeuille BCA.</p>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Confirmer & Encaisser'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CompleteMissionModal;
