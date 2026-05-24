import React from 'react';
import { cn } from '../../lib/utils';

const FormInput = ({ label, type = 'text', placeholder, value, onChange, name, error, icon, className = "", ...props }) => {
    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <label className="text-executive-label ml-2">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-300 group-focus-within:text-primary transition-colors duration-300">
                        {icon}
                    </span>
                )}
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn(
                        "block w-full h-11 rounded-[1.2rem] border-2 border-slate-100 dark:border-slate-300 dark:border-foreground/10 bg-slate-50/50 dark:bg-slate-900/[0.02] dark:bg-white/[0.02] py-4 pr-4 transition-all duration-300 shadow-inner focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none placeholder:text-slate-700 dark:text-slate-300 text-sm font-bold dark:text-slate-900 dark:text-foreground",
                        icon ? "pl-14" : "pl-6",
                        error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/5"
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-2 animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
};

export default FormInput;
