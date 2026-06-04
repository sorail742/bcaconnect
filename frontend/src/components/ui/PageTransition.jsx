import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
    animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: { duration: 0.25 }
    }
};

const PageTransition = ({ children, className = '' }) => (
    <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerContainer = ({ children, className = '', delay = 0.05 }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={{
            hidden: {},
            visible: { transition: { staggerChildren: delay } }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({ children, className = '' }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export default PageTransition;
