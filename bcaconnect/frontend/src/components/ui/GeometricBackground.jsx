import React from 'react';
import { motion } from 'framer-motion';

export const GeometricBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Animated Light Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute top-[-10%] left-[-10%] size-[600px] rounded-full bg-primary/20 blur-[120px]"
            />
            
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -100, 0],
                    y: [0, -50, 0],
                    opacity: [0.05, 0.15, 0.05]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute bottom-[-10%] right-[-10%] size-[500px] rounded-full bg-blue-500/10 blur-[100px]"
            />

            {/* Floating Geometric Orbs */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%",
                        opacity: 0 
                    }}
                    animate={{ 
                        y: ["-10%", "110%"],
                        opacity: [0, 0.3, 0],
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: 15 + Math.random() * 10,
                        repeat: Infinity,
                        delay: i * 2,
                        ease: "linear"
                    }}
                    className="absolute size-4 border border-primary/20 rounded-full"
                    style={{
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 0 20px rgba(255,102,0,0.1)'
                    }}
                />
            ))}

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
    );
};

export default GeometricBackground;
