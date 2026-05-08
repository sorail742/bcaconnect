import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Unauthorized = () => {
    return (
        <div className="flex min-h-screen bg-background items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center space-y-8"
            >
                <div className="size-24 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto border-2 border-destructive/20 shadow-lg shadow-destructive/10">
                    <ShieldAlert className="size-12" />
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">ACCÈS REFUSÉ</h1>
                    <p className="text-muted-foreground leading-relaxed">
                        Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette section confidentielle de BCA Connect.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link 
                        to="/" 
                        className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20"
                    >
                        <ArrowLeft className="size-4" />
                        Retour à l'accueil
                    </Link>
                    <Link 
                        to="/contact" 
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Contacter le support admin
                    </Link>
                </div>
                
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/30 pt-12">
                    Security protocol BCA-403 v2.6.5
                </p>
            </motion.div>
        </div>
    );
};

export default Unauthorized;
