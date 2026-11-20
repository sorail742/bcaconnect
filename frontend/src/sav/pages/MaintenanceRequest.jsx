import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Wrench, Loader2, ArrowLeft, AlertTriangle, Camera, X, ImagePlus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import api from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { TECHNICIAN_SPECIALTIES } from '../../constants/technicianSpecialties';

const PROBLEM_TYPES = [
    'Panne totale',
    'Dysfonctionnement partiel',
    'Casse / dommage physique',
    'Problème de software',
    'Bruit anormal',
    'Autre',
];

const MaintenanceRequest = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const productId = searchParams.get('product');
    const guaranteeId = searchParams.get('guarantee');

    const [description, setDescription] = useState('');
    const [problemType, setProblemType] = useState('');
    const [specialiteRequise, setSpecialiteRequise] = useState('');
    const [photos, setPhotos] = useState([]); // { file, preview }
    const [isPending, setIsPending] = useState(false);
    const photoInputRef = useRef(null);

    const handlePhotoAdd = (e) => {
        const files = Array.from(e.target.files || []);
        const remaining = 3 - photos.length;
        const toAdd = files.slice(0, remaining);

        toAdd.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} dépasse 5MB — ignoré.`);
                return;
            }
            const preview = URL.createObjectURL(file);
            setPhotos(prev => [...prev, { file, preview }]);
        });

        if (photoInputRef.current) photoInputRef.current.value = '';
    };

    const removePhoto = (index) => {
        setPhotos(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productId) {
            return toast.error('Produit requis', { description: 'Sélectionnez un produit depuis vos garanties SAV.' });
        }
        if (!description.trim()) return toast.error('Veuillez décrire le problème.');
        if (!specialiteRequise) return toast.error('Veuillez sélectionner le type de technicien nécessaire.');

        try {
            setIsPending(true);
            const formData = new FormData();
            formData.append('produit_id', productId);
            if (guaranteeId) formData.append('guarantee_id', guaranteeId);
            formData.append('description_probleme', problemType ? `[${problemType}] ${description}` : description);
            formData.append('specialite_requise', specialiteRequise);
            photos.forEach(p => formData.append('photos', p.file));

            await api.post('/sav/interventions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            queryClient.invalidateQueries({ queryKey: ['my-interventions'] });
            toast.success('Demande SAV envoyée — un technicien sera assigné.');
            navigate('/sav/interventions');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la soumission.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <DashboardLayout title="DEMANDE SAV">
            <div className="max-w-2xl mx-auto pb-24 animate-in fade-in duration-500">
                <Link
                    to="/sav/guarantees"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="size-4" /> Retour aux garanties
                </Link>

                {!productId && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
                        <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Aucun produit sélectionné</p>
                            <p className="mt-1 opacity-90">Retournez à vos garanties et cliquez sur « Demander une intervention » pour un produit couvert.</p>
                        </div>
                    </div>
                )}

                <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Wrench className="size-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight">Demande d&apos;intervention</h1>
                            <p className="text-sm text-muted-foreground">Un technicien BCA sera notifié immédiatement.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type de problème */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">
                                Type de problème
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PROBLEM_TYPES.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setProblemType(problemType === type ? '' : type)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                                            problemType === type
                                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                                : 'bg-muted border-border hover:border-primary/30'
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Spécialité requise */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">
                                Type de technicien nécessaire *
                            </label>
                            <p className="text-[11px] text-muted-foreground mb-2 normal-case">
                                Seuls les techniciens de cette spécialité pourront voir et accepter votre demande.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {TECHNICIAN_SPECIALTIES.map(spec => (
                                    <button
                                        key={spec.value}
                                        type="button"
                                        onClick={() => setSpecialiteRequise(spec.value)}
                                        disabled={!productId}
                                        className={cn(
                                            'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-40',
                                            specialiteRequise === spec.value
                                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                                : 'bg-muted border-border hover:border-primary/30'
                                        )}
                                    >
                                        {spec.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">
                                Description du problème *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez le dysfonctionnement, les symptômes, la fréquence, les conditions d'apparition..."
                                className="w-full rounded-xl border border-border bg-background p-4 min-h-[130px] text-sm outline-none focus:border-primary/50 resize-none normal-case"
                                required
                                disabled={!productId}
                            />
                        </div>

                        {/* Upload Photos */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">
                                Photos du problème <span className="text-muted-foreground/60 normal-case font-normal">(optionnel — max 3, 5MB chacune)</span>
                            </label>

                            <div className="flex flex-wrap gap-3">
                                {photos.map((photo, index) => (
                                    <div key={index} className="relative size-24 rounded-xl overflow-hidden border border-border group">
                                        <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-1 right-1 size-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}

                                {photos.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => photoInputRef.current?.click()}
                                        disabled={!productId}
                                        className="size-24 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all disabled:opacity-40"
                                    >
                                        <ImagePlus className="size-5" />
                                        <span className="text-[9px] font-bold uppercase">Ajouter</span>
                                    </button>
                                )}
                            </div>

                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handlePhotoAdd}
                            />

                            {photos.length > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                                    <Camera className="size-3" /> {photos.length}/3 photo(s) sélectionnée(s)
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || !description.trim() || !productId || !specialiteRequise}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xl shadow-primary/20"
                        >
                            {isPending
                                ? <><Loader2 className="size-4 animate-spin" /> Envoi en cours...</>
                                : <><CheckCircle2 className="size-4" /> Envoyer la demande SAV</>
                            }
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MaintenanceRequest;
