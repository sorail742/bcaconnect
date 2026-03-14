import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

const ThemeToggle = ({ className, minimal = false }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative flex items-center transition-all duration-300",
                minimal
                    ? "p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    : "gap-3 px-3 py-2 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary group",
                className
            )}
            title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
        >
            <div className="relative size-5 flex items-center justify-center shrink-0">
                <Sun className={cn(
                    "size-5 absolute transition-all duration-500",
                    theme === 'dark' ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
                )} />
                <Moon className={cn(
                    "size-5 absolute transition-all duration-500",
                    theme === 'dark' ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
                )} />
            </div>

            {!minimal && (
                <>
                    <span className="text-sm font-bold truncate">
                        {theme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}
                    </span>

                    {/* Visual indicator of toggle */}
                    <div className="ml-auto w-8 h-4 rounded-full bg-muted border border-border relative overflow-hidden">
                        <div className={cn(
                            "absolute top-0.5 left-0.5 size-2.5 rounded-full transition-all duration-300",
                            theme === 'dark' ? "translate-x-4 bg-primary shadow-[0_0_8px_rgba(79,70,229,0.6)]" : "translate-x-0 bg-slate-400"
                        )} />
                    </div>
                </>
            )}
        </button>
    );
};

export default ThemeToggle;
