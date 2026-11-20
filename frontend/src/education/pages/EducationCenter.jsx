import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { BookOpen, Video, FileText, Download, GraduationCap, Play, PlayCircle, X, HelpCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { useLanguage } from '../../context/useLanguage';
import QuizModal from '../components/QuizModal';
import useAuthStore from '../../store/authStore';

export default function EducationCenter() {
    const [activeVideo, setActiveVideo] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);
    const [quizResource, setQuizResource] = useState(null);
    const { t } = useLanguage();
    const { isAuthenticated } = useAuthStore();

    const markViewed = (resourceId) => {
        if (!isAuthenticated) return;
        api.post(`/education/${resourceId}/view`).catch(() => {});
    };

    const { data: resources, isLoading } = useQuery({
        queryKey: ['education-resources'],
        queryFn: async () => {
            const res = await api.get('/education');
            return res.data;
        }
    });

    const { data: webinars, isLoading: isLoadingWebinars } = useQuery({
        queryKey: ['webinars'],
        queryFn: async () => {
            const res = await api.get('/webinars');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const allTags = [...new Set(resources?.map(r => r.tag).filter(Boolean))];

    const filteredResources = selectedTag 
        ? resources?.filter(r => r.tag === selectedTag) 
        : resources;

    const videos = filteredResources?.filter(r => r.type_contenu === 'video') || [];
    const docs = filteredResources?.filter(r => r.type_contenu !== 'video') || [];

    // Fonction pour générer un lien thumbnail si c'est youtube (sinon on met un fond générique)
    const getThumbnail = (url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1];
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        // Fond par défaut pour les vidéos uploadées localement
        return "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000";
    };

    return (
        <div className="bg-[#f9f9f9] dark:bg-gray-900 min-h-screen pb-12">
            {/* Héro Section */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <GraduationCap className="w-64 h-64" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
                        <Video className="size-4" /> BCA Academy
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                        {t('eduHeroTitle1') || 'Apprenez, Vendez,'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">{t('eduHeroTitle2') || 'Réussissez.'}</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg font-medium">
                        {t('eduHeroDesc') || "Découvrez nos tutoriels vidéo exclusifs et nos guides pratiques pour maîtriser BCA Connect et faire décoller votre chiffre d'affaires."}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                
                {/* Filter Bar */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8 items-center justify-center">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${!selectedTag ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                        >
                            {t('all') || "Tous"}
                        </button>
                        {allTags.map(t => (
                            <button
                                key={t}
                                onClick={() => setSelectedTag(t)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${selectedTag === t ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                {/* Section Vidéos (Style YouTube) */}
                {videos.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('trainingVideos') || "Vidéos de formation"}</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
                            {videos.map(video => (
                                <div key={video.id} className="group cursor-pointer flex flex-col" onClick={() => { setActiveVideo(video); markViewed(video.id); }}>
                                    {/* Thumbnail */}
                                    <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
                                        <img 
                                            src={getThumbnail(video.url_contenu)} 
                                            alt={video.titre} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <div className="size-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                                                <Play className="size-5 text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                        {video.tag && (
                                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded">
                                                {video.tag.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    {/* Infos */}
                                    <div className="flex gap-3 px-1">
                                        <div className="shrink-0 mt-0.5">
                                            <div className="size-9 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white">
                                                <GraduationCap className="size-5" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-[15px] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                                {video.titre}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">BCA Academy</p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{video.description}</p>
                                            {video.has_quiz && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setQuizResource(video); }}
                                                    className={`mt-2 self-start inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full w-fit ${video.ma_progression?.statut === 'quiz_reussi' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/10 text-primary'}`}
                                                >
                                                    {video.ma_progression?.statut === 'quiz_reussi' ? <CheckCircle2 className="size-3" /> : <HelpCircle className="size-3" />}
                                                    {video.ma_progression?.statut === 'quiz_reussi' ? 'Quiz réussi' : 'Faire le quiz'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section Documents / Articles */}
                {docs.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('guidesAndDocs') || "Guides & Documents"}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {docs.map(doc => (
                                <a
                                    key={doc.id}
                                    href={doc.url_contenu}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => markViewed(doc.id)}
                                    className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-primary/20 transition-all group"
                                >
                                    <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                        {doc.type_contenu === 'pdf' ? <Download className="size-6" /> : <BookOpen className="size-6" />}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1 gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                {doc.tag || doc.type_contenu}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                            {doc.titre}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {doc.description}
                                        </p>
                                        {doc.has_quiz && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuizResource(doc); }}
                                                className={`mt-2 self-start inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full w-fit ${doc.ma_progression?.statut === 'quiz_reussi' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/10 text-primary'}`}
                                            >
                                                {doc.ma_progression?.statut === 'quiz_reussi' ? <CheckCircle2 className="size-3" /> : <HelpCircle className="size-3" />}
                                                {doc.ma_progression?.statut === 'quiz_reussi' ? 'Quiz réussi' : 'Faire le quiz'}
                                            </button>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {resources?.length === 0 && (
                    <div className="text-center py-20">
                        <GraduationCap className="size-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('comingSoon') || "Bientôt disponible"}</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{t('eduEmptyDesc') || "Notre équipe prépare des contenus éducatifs exceptionnels pour vous aider à réussir."}</p>
                    </div>
                )}
                {/* Section Webinaires en Direct (11.2) */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('webinars') || "Webinaires & Formations en Direct"}</h2>
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">{t('new') || "Nouveau"}</span>
                    </div>

                    {isLoadingWebinars ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : webinars && webinars.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {webinars.map((webinar) => (
                                <div key={webinar.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    {webinar.statut === 'en_direct' && (
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <span className="relative flex h-3 w-3">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                            </span>
                                            <span className="text-xs font-bold text-primary uppercase tracking-wider">En direct</span>
                                        </div>
                                    )}
                                    {webinar.statut === 'termine' && (
                                        <div className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded font-bold uppercase">
                                            Terminé
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-2 items-center mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                                            {webinar.categorie || 'Webinaire'}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                        {webinar.titre}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {webinar.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-5">
                                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800">
                                            <span>🗓️ {new Date(webinar.date_heure).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800">
                                            <span>⏰ {new Date(webinar.date_heure).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800">
                                            <span>👨‍🏫 {webinar.intervenant}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                        {webinar.statut === 'termine' && webinar.video_url ? (
                                            <button 
                                                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl font-bold transition-colors"
                                                onClick={() => setActiveVideo({ url_contenu: webinar.video_url, titre: webinar.titre, description: webinar.description })}
                                            >
                                                <PlayCircle className="size-4" /> Voir le Replay
                                            </button>
                                        ) : webinar.statut === 'termine' ? (
                                            <p className="text-center text-xs text-gray-500 italic py-2">Replay non disponible</p>
                                        ) : (
                                            <button 
                                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-colors ${webinar.statut === 'en_direct' ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20' : 'bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black'}`}
                                                onClick={() => {
                                                    if (webinar.lien_rejoindre) {
                                                        window.open(webinar.lien_rejoindre, '_blank');
                                                    } else {
                                                        toast.info("Le lien n'est pas encore disponible.");
                                                    }
                                                }}
                                            >
                                                {webinar.statut === 'en_direct' ? 'Rejoindre maintenant' : "S'inscrire"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                            <div>
                                <h3 className="text-xl font-bold mb-2">{t('nextWebinarTitle') || "Prochain Webinaire: Maximiser vos ventes avec BCA Connect"}</h3>
                                <p className="text-blue-50 mb-4 max-w-2xl">{t('webinarDesc') || "Rejoignez nos experts pour une session interactive. Découvrez les meilleures pratiques commerciales et posez vos questions en direct."}</p>
                                <div className="flex gap-4 text-sm font-medium">
                                    <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">🗓️ Jeudi, 20 Juillet</div>
                                    <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">⏰ 14:00 - 15:30 GMT</div>
                                </div>
                            </div>
                            <button className="bg-white text-primary hover:bg-gray-50 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-colors shadow-lg" onClick={() => toast.info(t('registerSoon') || "Inscription bientôt disponible !", { description: t('registerSoonDesc') || "Nous vous tiendrons informé de l'ouverture des inscriptions." })}>
                                {t('registerFree') || "S'inscrire gratuitement"}
                            </button>
                        </div>
                    )}
                </section>

                {/* FAQ et Assistance Contextuelle (11.3) */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('faqAssistance') || "FAQ & Assistance Contextuelle"}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <details className="group bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 cursor-pointer">
                                <summary className="font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                                    {t('faqQ1') || "Comment demander un financement ?"}
                                    <span className="transition group-open:rotate-180">▼</span>
                                </summary>
                                <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
                                    {t('faqA1') || "Rendez-vous dans la section \"Crédit Simulation\", simulez votre besoin et soumettez la demande. L'IA analysera votre profil instantanément."}
                                </p>
                            </details>
                            <details className="group bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 cursor-pointer">
                                <summary className="font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                                    {t('faqQ2') || "Comment publier un produit efficace ?"}
                                    <span className="transition group-open:rotate-180">▼</span>
                                </summary>
                                <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
                                    {t('faqA2') || "Consultez notre guide des \"Meilleures Pratiques Commerciales\". Mettez des photos nettes et une description détaillée pour augmenter vos ventes de 40%."}
                                </p>
                            </details>
                        </div>
                        <div className="space-y-4">
                            <details className="group bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 cursor-pointer">
                                <summary className="font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                                    {t('faqQ3') || "Quels sont les taux d'intérêt ?"}
                                    <span className="transition group-open:rotate-180">▼</span>
                                </summary>
                                <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
                                    {t('faqA3') || "Les taux varient de 2% à 5% selon votre score de solvabilité BCA et la durée du remboursement."}
                                </p>
                            </details>
                            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10">
                                <h4 className="font-bold text-primary mb-2">{t('needMoreHelp') || "Besoin d'aide supplémentaire ?"}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('supportDesc') || "Notre équipe de support est disponible 24/7 pour vous accompagner."}</p>
                                <button className="text-sm bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors" onClick={() => window.location.href='/dashboard/support'}>
                                    {t('contactSupport') || "Contacter le support"}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Video Modal Player */}
            {activeVideo && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
                    <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
                        <button 
                            onClick={() => setActiveVideo(null)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X className="size-6" />
                        </button>
                    </div>
                    <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
                        {activeVideo.url_contenu.includes('youtube.com') || activeVideo.url_contenu.includes('youtu.be') ? (
                            <iframe 
                                src={`https://www.youtube.com/embed/${activeVideo.url_contenu.split('v=')[1]?.split('&')[0] || activeVideo.url_contenu.split('youtu.be/')[1]}?autoplay=1`}
                                title={activeVideo.titre}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            />
                        ) : (
                            <video 
                                src={activeVideo.url_contenu} 
                                controls 
                                autoPlay 
                                className="w-full h-full object-contain bg-black"
                            >
                                Votre navigateur ne supporte pas la lecture de vidéos.
                            </video>
                        )}
                    </div>
                    <div className="absolute bottom-8 left-8 right-8 max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-2">{activeVideo.titre}</h2>
                        <p className="text-gray-300 max-w-3xl">{activeVideo.description}</p>
                    </div>
                </div>
            )}

            {quizResource && (
                <QuizModal
                    resource={quizResource}
                    onClose={() => setQuizResource(null)}
                />
            )}
        </div>
    );
}
