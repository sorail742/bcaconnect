import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Plus, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const CreatableSelect = ({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Sélectionner...", 
    onCreate,
    className 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white hover:border-primary/20 transition-all shadow-sm"
            >
                <span className={cn("text-xs font-bold uppercase truncate", !selectedOption && "text-slate-400")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={cn("size-4 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-slate-50 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                        <input 
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full h-10 pl-10 pr-4 bg-slate-50 rounded-xl text-xs font-bold outline-none border-none focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={cn(
                                        "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-between group transition-all",
                                        value === opt.id ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    {opt.label}
                                    {value === opt.id && <Check className="size-3" />}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Aucun résultat</p>
                            </div>
                        )}
                    </div>

                    {search && !filteredOptions.find(o => o.label.toLowerCase() === search.toLowerCase()) && (
                        <div 
                            onClick={() => {
                                onCreate(search);
                                setIsOpen(false);
                                setSearch('');
                            }}
                            className="p-3 bg-slate-50 border-t border-slate-100 cursor-pointer hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                            <Plus className="size-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Créer "{search}"</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreatableSelect;
