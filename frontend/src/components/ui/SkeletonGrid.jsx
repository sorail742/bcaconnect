import React from 'react';
import { motion } from 'framer-motion';

const shimmer = {
    hidden: { opacity: 0.4 },
    visible: {
        opacity: 1,
        transition: { repeat: Infinity, repeatType: 'reverse', duration: 0.9 }
    }
};

export const SkeletonLine = ({ className = 'h-4 w-full' }) => (
    <motion.div
        variants={shimmer}
        initial="hidden"
        animate="visible"
        className={`rounded-lg bg-gradient-to-r from-muted via-muted/60 to-muted ${className}`}
    />
);

export const SkeletonCard = ({ className = '' }) => (
    <div className={`premium-card p-6 space-y-4 animate-pulse ${className}`}>
        <SkeletonLine className="h-6 w-1/3" />
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-5/6" />
        <SkeletonLine className="h-32 w-full rounded-2xl" />
    </div>
);

export const SkeletonGrid = ({ count = 4, columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' }) => (
    <div className={`grid ${columns} gap-6`}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
    <div className="space-y-3">
        <SkeletonLine className="h-10 w-full rounded-xl" />
        {Array.from({ length: rows }).map((_, i) => (
            <SkeletonLine key={i} className="h-14 w-full rounded-xl" />
        ))}
    </div>
);

export default SkeletonGrid;
