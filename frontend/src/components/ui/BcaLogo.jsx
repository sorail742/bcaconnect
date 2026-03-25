import React from 'react';

const BcaLogo = ({ className = "size-10", gradientId = "bca-gradient" }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            translate="no"
            role="img"
            aria-label="Logo BCA Connect"
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
            </defs>

            {/* Background Circle to ensure perfect circularity */}
            <circle
                cx="50"
                cy="50"
                r="48"
                className="fill-white/5 dark:fill-white/10"
            />

            {/* Main Circle Outline - Thicker and Perfectly Centered */}
            <circle
                cx="50"
                cy="50"
                r="44"
                stroke={`url(#${gradientId})`}
                strokeWidth="8"
                strokeLinecap="round"
            />

            {/* Styled 'B' and 'A' integrated into a fluid mark */}
            <path
                d="M35 35 V65 M35 35 H45 C55 35 55 48 45 48 H35 M35 48 H45 C55 48 55 65 45 65 H35"
                stroke={`url(#${gradientId})`}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M55 65 L65 35 L75 65 M58 55 H72"
                stroke={`url(#${gradientId})`}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default BcaLogo;
