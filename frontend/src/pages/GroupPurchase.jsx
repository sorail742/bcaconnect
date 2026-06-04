import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '../lib/utils';

const GroupPurchase = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-[#0A0F1C] to-[#1A202B] p-8">
    <motion.div
      className="bg-white dark:bg-[#0F1219] rounded-2xl shadow-xl p-12 max-w-md text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Zap className="size-12 mx-auto text-[#FF6600] mb-4" />
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
        Achats Groupés (B2B)
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Fonctionnalité en cours de développement. Restez à l'écoute !
      </p>
      <button
        className={cn(
          "px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
        )}
      >
        En savoir plus
      </button>
    </motion.div>
  </div>
);

export default GroupPurchase;
