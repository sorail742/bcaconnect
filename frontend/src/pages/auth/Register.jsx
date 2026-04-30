import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { 
    User, Mail, Phone, Lock, ArrowRight, Store, Truck, 
    Zap, Loader2, MapPin, FileText, Tag, Car, Shield, Globe, CreditCard, Building2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardRoute } from '../../constants/roles';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

import { getRegisterSchema } from '../../lib/validation';
import GeometricBackground from '../../components/ui/GeometricBackground';
import BcaLogo from '../../components/ui/BcaLogo';
import marketImg from '../../assets/auth/market.png';
import logisticsImg from '../../assets/auth/logistics.png';
import entrepreneurImg from '../../assets/auth/entrepreneur.png';

const SHOWCASE_IMAGES = [marketImg, logisticsImg, entrepreneurImg];

// ── Constantes métier ────────────────────────────────────────────────
const CATEGORIES_ACTIVITE = [
    { value: 'agriculture', label: 'Agriculture & Agroalimentaire' },
    { value: 'mode', label: 'Mode & Habillement' },
    { value: 'technologie', label: 'Technologie & Électronique' },
    { value: 'immobilier', label: 'Immobilier & Construction' },
    { value: 'mecanique', label: 'Mécanique & Automobile' },
    { value: 'sante', label: 'Santé & Pharmaceutique' },
    { value: 'alimentation', label: 'Alimentation & Restauration' },
    { value: 'beaute', label: 'Beauté & Cosmétique' },
    { value: 'autre', label: 'Autre' },
];

const TYPES_VEHICULE = [
    { value: 'moto', label: 'Moto' },
    { value: 'voiture', label: 'Voiture' },
    { value: 'camionnette', label: 'Camionnette' },
    { value: 'camion', label: 'Camion' },
];

const ZONES_COUVERTURE = [
    { value: 'conakry-ratoma', label: 'Conakry — Ratoma' },
    { value: 'conakry-matam', label: 'Conakry — Matam' },
    { value: 'conakry-dixinn', label: 'Conakry — Dixinn' },
    { value: 'conakry-kaloum', label: 'Conakry — Kaloum' },
    { value: 'conakry-matoto', label: 'Conakry — Matoto' },
    { value: 'conakry-complete', label: 'Conakry (Toute la ville)' },
    { value: 'guinee-complete', label: 'Toute la Guinée' },
];

// ── Composants UI Intermes ──────────────────────────────────────────
const FormInput = ({ icon: Icon, label, error, ...props }) => (
    <div className="space-y-2 w-full">
        <label className="text-[13px] font-bold text-slate-800">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Icon className={cn("size-5 transition-colors", error ? "text-red-500" : "text-slate-400 group-focus-within:text-primary")} />
            </div>
            <input
                {...props}
                className={cn(
                    "w-full h-12 pl-12 pr-4 bg-white border text-sm font-medium rounded-xl transition-all focus:outline-none placeholder:text-slate-400",
                    error 
                        ? "border-red-500 bg-red-50/10 focus:border-red-500" 
                        : "border-slate-200 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary"
                )}
            />
        </div>
        {error && <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight ml-1">{error}</p>}
    </div>
);

const FormSelect = ({ icon: Icon, label, options, placeholder, error, ...props }) => (
    <div className="space-y-2 w-full">
        <label className="text-[13px] font-bold text-slate-800">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Icon className={cn("size-5 transition-colors", error ? "text-red-500" : "text-slate-400 group-focus-within:text-primary")} />
            </div>
            <select
                {...props}
                className={cn(
                    "w-full h-12 pl-12 pr-4 bg-white border text-sm font-medium rounded-xl transition-all appearance-none cursor-pointer placeholder:text-slate-400",
                    error 
                        ? "border-red-500 bg-red-50/10 focus:border-red-500" 
                        : "border-slate-200 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary"
                )}
            >
                <option value="">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
        {error && <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight ml-1">{error}</p>}
    </div>
);

const Register = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { register, loading: authLoading, error: authError, isAuthenticated, user } = useAuth();
    
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [localError, setLocalError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const queryRole = searchParams.get('role');
    const validRoles = ['client', 'fournisseur', 'transporteur'];
    const defaultRole = validRoles.includes(queryRole) ? queryRole : (queryRole === 'vendeur' ? 'fournisseur' : 'client');

    const [formData, setFormData] = useState({
        role: defaultRole,
        fullName: '',
        email: '',
        telephone: '',
        password: '',
        confirmPassword: '',
        adresse: '',
        nom_boutique: '',
        description_boutique: '',
        adresse_boutique: '',
        categorie_activite: '',
        registre_commerce: '',
        type_vehicule: '',
        numero_permis: '',
        zone_couverture: '',
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % SHOWCASE_IMAGES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    if (isAuthenticated && !authLoading) {
        return <Navigate to={getDashboardRoute(user?.role || 'client')} replace />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
        if (localError) setLocalError('');
    };

    const setRole = (role) => {
        setFormData(prev => ({ ...prev, role }));
        setFieldErrors({});
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLocalError('');
        setFieldErrors({});

        if (formData.password !== formData.confirmPassword) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: "Les mots de passe ne correspondent pas" }));
            return;
        }

        const validationData = {
            nom_complet: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        };

        if (formData.role === 'fournisseur') {
            validationData.nom_boutique = formData.nom_boutique;
            validationData.categorie_activite = formData.categorie_activite;
            validationData.adresse_boutique = formData.adresse_boutique;
        }
        if (formData.role === 'transporteur') {
            validationData.type_vehicule = formData.type_vehicule;
            validationData.numero_permis = formData.numero_permis;
            validationData.zone_couverture = formData.zone_couverture;
        }

        const schema = getRegisterSchema(formData.role);
        const validation = schema.safeParse(validationData);

        if (!validation.success) {
            const errors = {};
            validation.error.errors.forEach(err => {
                const path = err.path[0];
                // Mapping path to formData names
                const fieldName = path === 'nom_complet' ? 'fullName' : path;
                if (!errors[fieldName]) errors[fieldName] = err.message;
            });
            setFieldErrors(errors);
            toast.error("Veuillez vérifier les informations saisies.");
            return;
        }

        const payload = {
            nom_complet: formData.fullName,
            email: formData.email,
            telephone: formData.telephone,
            mot_de_passe: formData.password,
            role: formData.role,
            ...(formData.role === 'client' && { adresse: formData.adresse }),
            ...(formData.role === 'fournisseur' && {
                nom_boutique: formData.nom_boutique,
                adresse_boutique: formData.adresse_boutique,
                categorie_activite: formData.categorie_activite,
                description_boutique: formData.description_boutique,
                registre_commerce: formData.registre_commerce,
            }),
            ...(formData.role === 'transporteur' && {
                type_vehicule: formData.type_vehicule,
                numero_permis: formData.numero_permis,
                zone_couverture: formData.zone_couverture,
            })
        };

        try {
            await register(payload);
            toast.success(formData.role === 'client' ? 'Bienvenue !' : 'Candidature soumise !');
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Immersive Showcase */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden bg-[#0A0F1C]">
                <GeometricBackground />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1.05 }}
                        exit={{ opacity: 0, scale: 1 }}
                        transition={{ duration: 2.5 }}
                        className="absolute inset-0"
                    >
                        <img src={SHOWCASE_IMAGES[currentImageIndex]} className="w-full h-full object-cover grayscale-[0.2]" alt="Context" />
                        <div className="absolute inset-0 bg-[#0A0F1C]/85 backdrop-blur-[2px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/40 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                <div className="relative z-20 max-w-lg w-full">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <div className="size-20 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_40px_rgba(255,102,0,0.4)] mb-10">
                            <Zap className="size-10 fill-current" />
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tight leading-[0.9] mb-4">
                            Bâtissons <br/> <span className="text-primary uppercase italic">L'AVENIR</span> <br/> Du Commerce.
                        </h2>
                        <p className="text-white/70 text-lg font-medium leading-relaxed mb-10">
                            Rejoignez la plateforme qui connecte producteurs, commerçants et logisticiens en Guinée.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { val: 'Plus de 10 000', label: 'Utilisateurs' },
                                { val: 'Plus de 500', label: 'Entreprises' },
                                { val: '24h/24 et 7j/7', label: 'Soutenir le local' },
                                { val: '99%', label: 'Sécurité' },
                            ].map((s, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-[#151B2B] border border-white/5 opacity-80 backdrop-blur-md">
                                    <p className="text-lg font-black text-primary mb-1">{s.val}</p>
                                    <p className="text-xs font-bold text-white/50">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Single Page Form */}
            <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto">
                <div className="max-w-xl w-full mx-auto">
                    
                    <header className="mb-8 text-center md:text-left">
                        <Link to="/" className="inline-flex mb-12">
                            <BcaLogo size="h-10" />
                        </Link>
                        
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Créer un compte</h1>
                        <p className="text-slate-500 text-sm">Rejoignez l'écosystème BCA Connect</p>
                    </header>

                    {(localError || authError) && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-center gap-2">
                            <Zap className="size-4" />
                            {localError || authError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Role Tabs */}
                        <div className="space-y-3">
                            <label className="text-[13px] font-bold text-slate-800">Type de compte</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'client', icon: User, label: 'Acheteur' },
                                    { id: 'fournisseur', icon: Store, label: 'Fournisseur' },
                                    { id: 'transporteur', icon: Truck, label: 'Livreur' },
                                ].map(r => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setRole(r.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
                                            formData.role === r.id 
                                                ? "border-primary bg-primary/5 text-primary" 
                                                : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                        )}
                                    >
                                        <r.icon className="size-6 mb-2" />
                                        <span className="text-sm font-bold">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Base Identity Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormInput icon={User} label="Nom complet" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Votre nom" error={fieldErrors.fullName} />
                            <FormInput icon={Mail} label="E-mail" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" error={fieldErrors.email} />
                        </div>
                        
                        <FormInput icon={Phone} label="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="+224 XX XX XX XX" error={fieldErrors.telephone} />
                        
                        {/* Dynamic Fields per Role */}
                        <AnimatePresence mode="popLayout">
                            {formData.role === 'client' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                                    <FormInput icon={MapPin} label="Adresse de Livraison" name="adresse" value={formData.adresse} onChange={handleChange} placeholder="Commune, Quartier, Avenue..." error={fieldErrors.adresse} />
                                </motion.div>
                            )}

                            {formData.role === 'fournisseur' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-5 pt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormInput icon={Building2} label="Nom de la Boutique" name="nom_boutique" value={formData.nom_boutique} onChange={handleChange} placeholder="Nom de votre boutique" error={fieldErrors.nom_boutique} />
                                        <FormSelect icon={Tag} label="Secteur d'activité" name="categorie_activite" value={formData.categorie_activite} onChange={handleChange} options={CATEGORIES_ACTIVITE} placeholder="Secteur" error={fieldErrors.categorie_activite} />
                                    </div>
                                    <FormInput icon={MapPin} label="Adresse Physique" name="adresse_boutique" value={formData.adresse_boutique} onChange={handleChange} placeholder="Où êtes-vous situé ?" error={fieldErrors.adresse_boutique} />
                                    <FormInput icon={FileText} label="Numéro R.C.C.M (Optionnel)" name="registre_commerce" value={formData.registre_commerce} onChange={handleChange} placeholder="RCCM-XXXX-202X" error={fieldErrors.registre_commerce} />
                                </motion.div>
                            )}

                            {formData.role === 'transporteur' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-5 pt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormSelect icon={Car} label="Type de Véhicule" name="type_vehicule" value={formData.type_vehicule} onChange={handleChange} options={TYPES_VEHICULE} placeholder="Sélectionnez" error={fieldErrors.type_vehicule} />
                                        <FormSelect icon={Globe} label="Zone de Couverture" name="zone_couverture" value={formData.zone_couverture} onChange={handleChange} options={ZONES_COUVERTURE} placeholder="Sélectionnez la zone" error={fieldErrors.zone_couverture} />
                                    </div>
                                    <FormInput icon={CreditCard} label="Numéro de Permis" name="numero_permis" value={formData.numero_permis} onChange={handleChange} placeholder="Identifiant permis" error={fieldErrors.numero_permis} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Security */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormInput icon={Lock} label="Mot de passe" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" error={fieldErrors.password} />
                            <FormInput icon={Lock} label="Confirmateur" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" error={fieldErrors.confirmPassword} />
                        </div>

                        <button 
                            type="submit" 
                            disabled={authLoading}
                            className="w-full h-14 mt-4 rounded-xl bg-primary text-white font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {authLoading ? <Loader2 className="size-5 animate-spin" /> : <>Créer un compte <ArrowRight className="size-5" /></>}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-slate-500 pb-12">
                        Vous avez déjà un compte ? <Link to="/login" className="text-primary font-bold hover:underline">Se connecter</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
