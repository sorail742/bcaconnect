import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, Camera, X, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

/**
 * Barre de recherche avancée
 * - Recherche par texte
 * - Recherche par image
 * - Recherche par vocal
 */
export const AdvancedSearchBar = ({ onSearch, placeholder = "Rechercher..." }) => {
    const [searchText, setSearchText] = useState('');
    const [searchMode, setSearchMode] = useState('text');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [transcript, setTranscript] = useState('');
    
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'fr-FR';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setTranscript('');
            };

            recognitionRef.current.onresult = (event) => {
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const trans = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        setSearchText(prev => prev + trans);
                    } else {
                        interim += trans;
                    }
                }
                setTranscript(interim);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Erreur reconnaissance vocale:', event.error);
                setIsListening(false);
            };
        }
    }, []);

    const toggleVoiceSearch = () => {
        if (!recognitionRef.current) {
            alert('La reconnaissance vocale n\'est pas supportée');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setSearchText('');
            recognitionRef.current.start();
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target?.result);
                setSearchMode('image');
                handleImageSearch(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageSearch = async (file) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch('/api/search/image', {
                method: 'POST',
                body: formData,
            });
            
            const data = await response.json();
            onSearch?.({ type: 'image', results: data });
        } catch (error) {
            console.error('Erreur recherche image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextSearch = () => {
        if (searchText.trim()) {
            onSearch?.({ type: 'text', query: searchText });
        }
    };

    const handleVoiceSearch = () => {
        if (searchText.trim()) {
            onSearch?.({ type: 'voice', query: searchText });
        }
    };

    const clearSearch = () => {
        setSearchText('');
        setPreviewImage(null);
        setTranscript('');
        setSearchMode('text');
    };

    return (
        <div className="w-full space-y-3">
            <div className="relative group">
                <div className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300",
                    "bg-background border-border hover:border-primary/30 focus-within:border-primary",
                    isListening && "border-primary bg-primary/5"
                )}>
                    <Search className="size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />

                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground text-foreground"
                    />

                    {transcript && (
                        <span className="text-xs text-primary italic">{transcript}</span>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleVoiceSearch}
                            className={cn(
                                "p-2 rounded-lg transition-all duration-300",
                                isListening
                                    ? "bg-primary text-primary-foreground animate-pulse"
                                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            )}
                            title="Recherche vocale"
                        >
                            <Mic className="size-4" />
                        </button>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
                            title="Recherche par image"
                        >
                            <Camera className="size-4" />
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                        {(searchText || previewImage) && (
                            <button
                                onClick={clearSearch}
                                className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                            >
                                <X className="size-4" />
                            </button>
                        )}

                        <button
                            onClick={searchMode === 'voice' ? handleVoiceSearch : handleTextSearch}
                            disabled={isLoading || (!searchText && !previewImage)}
                            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Search className="size-4" />
                            )}
                            <span className="hidden sm:inline">Chercher</span>
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {previewImage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 mt-2 p-3 bg-card border border-border rounded-lg shadow-lg"
                        >
                            <img
                                src={previewImage}
                                alt="Aperçu"
                                className="h-24 w-24 object-cover rounded-lg"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isListening && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="flex items-center gap-1"
                    >
                        <Volume2 className="size-3 text-primary" />
                        <span>Écoute en cours...</span>
                    </motion.div>
                )}
                {previewImage && (
                    <div className="flex items-center gap-1">
                        <Camera className="size-3 text-primary" />
                        <span>Image sélectionnée</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedSearchBar;
