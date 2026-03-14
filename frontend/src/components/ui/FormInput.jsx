import React from 'react';

const FormInput = ({ label, type = 'text', placeholder, value, onChange, name, error, icon, className = "", ...props }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-lg">
                        {icon}
                    </span>
                )}
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full ${icon ? 'pl-12' : 'px-5'} py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white ${error ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : ''}`}
                    {...props}
                />
            </div>
            {error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{error}</p>}
        </div>
    );
};

export default FormInput;
