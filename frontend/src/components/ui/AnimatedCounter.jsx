import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 2, delay = 0, className = "" }) => {
    const [displayValue, setDisplayValue] = useState("0");
    const prevValueRef = useRef(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    
    // Parse the value: extract number and suffix
    const parseValue = (val) => {
        if (typeof val === 'number') return { num: val, suffix: "" };
        const stringVal = String(val);
        const numMatch = stringVal.match(/(\d+(\.\d+)?)/);
        const num = numMatch ? parseFloat(numMatch[0]) : 0;
        const suffix = stringVal.replace(numMatch ? numMatch[0] : "", "");
        return { num, suffix };
    };

    const { num, suffix } = parseValue(value);

    useEffect(() => {
        if (isInView) {
            const controls = animate(prevValueRef.current, num, {
                duration: duration,
                delay: delay,
                onUpdate: (latest) => {
                    const formatted = num % 1 === 0 
                        ? Math.floor(latest).toString() 
                        : latest.toFixed(1);
                    setDisplayValue(formatted);
                },
                ease: "easeOut"
            });
            prevValueRef.current = num;
            return () => controls.stop();
        } else {
            // Set initial state based on current value if not in view yet
            const formatted = num % 1 === 0 ? "0" : "0.0";
            setDisplayValue(formatted);
        }
    }, [isInView, num, duration, delay]);

    return (
        <span ref={ref} className={className}>
            {displayValue}{suffix}
        </span>
    );
};

export default AnimatedCounter;
