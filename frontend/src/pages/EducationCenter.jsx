import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { BookOpen, Video, FileText, Download, GraduationCap } from 'lucide-react';

export default function EducationCenter() {
    const { data: resources, isLoading } = useQuery({
        queryKey: ['education-resources'],
        queryFn: async () => {
            const res = await api.get('/education');
            return res.data;
        }
    });

    const getIcon = (type) => {
        switch (type) {
            case 'video': return <Video className="size-6" />;
            case 'pdf': return <Download className="size-6" />;
            case 'guide': return <BookOpen className="size-6" />;
            default: return <FileText className="size-6" />;
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Chargement des ressources...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 py-8 space-y-8">
            <div className="bg-gradient-to-r from-primary to-orange-500 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold mb-4">
                        <GraduationCap className="size-4" /> BCA Academy
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black mb-4">Centre de Formation</h1>
                    <p className="text-white/80 max-w-xl text-lg">Développez vos compétences commerciales et maîtrisez les outils numériques pour propulser votre activité.</p>
                </div>
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10">
                    <GraduationCap className="size-96" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources?.length === 0 && (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        <GraduationCap className="size-12 mx-auto mb-4 opacity-30" />
                        <p>Aucune ressource disponible pour le moment.</p>
                    </div>
                )}
                {resources?.map(resource => (
                    <div key={resource.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                                {getIcon(resource.type_contenu)}
                            </div>
                            {resource.tag && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-bold rounded-md">
                                    {resource.tag}
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{resource.titre}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3">{resource.description}</p>
                        
                        <a 
                            href={resource.url_contenu} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center font-bold text-sm text-primary hover:underline"
                        >
                            Consulter la ressource →
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
