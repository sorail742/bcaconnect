import React from 'react';
import { cn } from './utils';

export const ALIBABA_ICONS = {
    star: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    dress: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M8 4l-1.5 5A2 2 0 0 0 8 11h8a2 2 0 0 0 1.5-2L16 4" />
            <path d="M7 11l-2.5 10a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1L17 11" />
            <path d="M10 4a2 2 0 0 0 4 0" />
        </svg>
    ),
    headset: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M4 11V9a8 8 0 0 1 16 0v2" />
            <path d="M3 11h4v7H3z" />
            <path d="M17 11h4v7h-4z" />
            <path d="M7 18v1a3 3 0 0 0 3 3h1" />
        </svg>
    ),
    home: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M6 6h10v15H6z" />
            <path d="M5 6h12" />
            <path d="M16 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
            <path d="M8 3h6v3H8z" />
        </svg>
    ),
    sports: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M4 16a3 3 0 1 0 4.24-4.24L4 16z" />
            <path d="M8.24 11.76L18 2l4 4-9.76 9.76" />
            <path d="M15.5 4.5l4 4" />
            <path d="M13 7l4 4" />
            <path d="M10.5 9.5l4 4" />
        </svg>
    ),
    diamond: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
            <path d="M2 9h20" />
            <path d="M12 21L8 9" />
            <path d="M12 21l4-12" />
            <path d="M6 3l2 6" />
            <path d="M18 3l-2 6" />
        </svg>
    ),
    tshirt: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M9 4h6l4 4-2 3-2-2v11H9V9L7 11 5 8l4-4z" />
            <path d="M9 4a3 3 0 0 0 6 0" />
        </svg>
    ),
    beauty: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M6 12h6v9H6z" />
            <path d="M7 12V8h4v4" />
            <path d="M8 8V4l2-2 1 2v4" />
            <path d="M14 15h5v6h-5z" />
            <path d="M16 15v-3h1v3" />
            <path d="M15 12h3" />
        </svg>
    ),
    plug: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>
        </svg>
    ),
    security: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
    ),
    forklift: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M12 12H5a2 2 0 0 0-2 2v5"/><circle cx="13" cy="19" r="2"/><circle cx="5" cy="19" r="2"/><path d="M8 19h3m5-17v17h6M6 12V7c0-1.1.9-2 2-2h3l5 5v2"/>
        </svg>
    ),
    test: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h8"/>
        </svg>
    ),
    energy: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
    ),
    microchip: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
        </svg>
    ),
    truck: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M10 17h4V5H2v12h3" /><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" /><path d="M14 17h1" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
    ),
    agriculture: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
    ),
    materials: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
    ),
    factory: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>
        </svg>
    ),
    server: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
        </svg>
    ),
    shoe: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /><path d="M8 22v-4" /><path d="M16 22v-4" /><path d="M4 12h16" /><path d="M4 8h16" />
        </svg>
    ),
    bag: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
    ),
    box: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
    ),
    toy: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="1"/><circle cx="16" cy="9" r="1"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        </svg>
    ),
    hygiene: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <rect x="8" y="10" width="8" height="12" rx="2"/><path d="M10 4h4v6h-4z"/><line x1="12" y1="2" x2="12" y2="4"/>
        </svg>
    ),
    medical: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
    ),
    gift: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
    ),
    paw: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M12 12c-2 0-3.5 1.5-3.5 3.5S10 19 12 19s3.5-1.5 3.5-3.5S14 12 12 12z"/><path d="M16 8c-1.5 0-2.5 1-2.5 2.5S14.5 13 16 13s2.5-1 2.5-2.5S17.5 8 16 8z"/><path d="M8 8c-1.5 0-2.5 1-2.5 2.5S6.5 13 8 13s2.5-1 2.5-2.5S9.5 8 8 8z"/><path d="M12 4c-1.5 0-2.5 1-2.5 2.5S10.5 9 12 9s2.5-1 2.5-2.5S13.5 4 12 4z"/>
        </svg>
    ),
    pen: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>
    ),
    commercial: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
    ),
    excavator: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M14.531 12.469 6.619 20.38a1.5 1.5 0 0 1-2.121-2.121l7.91-7.912"/><path d="M15.586 11.414 18.5 8.5a1.5 1.5 0 0 0-2.121-2.121l-2.914 2.914"/><path d="m14.5 12.5-1.086-1.086"/><path d="M12.5 14.5 11.414 15.586"/><path d="M16.5 10.5 17.586 9.414"/><path d="M9.414 17.586 8.5 18.5a1.5 1.5 0 0 0 2.121 2.121l2.914-2.914"/><path d="M20.531 6.469a1.5 1.5 0 0 0-2.121-2.121L10.5 12.258l2.121 2.121 7.91-7.91Z"/>
        </svg>
    ),
    construction: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
        </svg>
    ),
    cabinet: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <rect x="2" y="3" width="20" height="18" rx="2" ry="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="8" y1="12" x2="8.01" y2="12"/><line x1="16" y1="12" x2="16.01" y2="12"/>
        </svg>
    ),
    lightbulb: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
        </svg>
    ),
    tv: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>
        </svg>
    ),
    wheel: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="22" y1="12" x2="16" y2="12"/><line x1="8" y1="12" x2="2" y2="12"/><line x1="19.07" y1="4.93" x2="14.83" y2="9.17"/><line x1="9.17" y1="14.83" x2="4.93" y2="19.07"/><line x1="19.07" y1="19.07" x2="14.83" y2="14.83"/><line x1="9.17" y1="9.17" x2="4.93" y2="4.93"/>
        </svg>
    ),
    wrench: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
    ),
    solar: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("size-[22px] shrink-0 text-slate-700", props?.className)} {...props}>
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="7" y1="5" x2="7" y2="19"/><line x1="17" y1="5" x2="17" y2="19"/>
        </svg>
    ),
    default: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`size-[22px] shrink-0 text-slate-700 ${props?.className || ''}`} {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
    )
};

export const ALIBABA_CATEGORIES = [
    { id: 'cat-1', nom: 'Vêtements & Accessoires', icon: ALIBABA_ICONS.dress, color: 'bg-white text-slate-800', filter: 'Vêtements' },
    { id: 'cat-2', nom: 'Électronique grand public', icon: ALIBABA_ICONS.headset, color: 'bg-white text-slate-800', filter: 'Electronique' },
    { id: 'cat-3', nom: 'Maison & Jardin', icon: ALIBABA_ICONS.home, color: 'bg-white text-slate-800', filter: 'Maison' },
    { id: 'cat-4', nom: 'Sports & Loisirs', icon: ALIBABA_ICONS.sports, color: 'bg-white text-slate-800', filter: 'Sport' },
    { id: 'cat-5', nom: 'Bijoux, Lunettes & Montres', icon: ALIBABA_ICONS.diamond, color: 'bg-white text-slate-800', filter: 'Bijoux' },
    { id: 'cat-6', nom: "Tenues de sport et vêtements d'extérieur", icon: ALIBABA_ICONS.tshirt, color: 'bg-white text-slate-800', filter: 'Sport' },
    { id: 'cat-7', nom: 'Produits de beauté', icon: ALIBABA_ICONS.beauty, color: 'bg-white text-slate-800', filter: 'Beauté' },

    // Nouveaux ajouts - Image 2
    { id: 'cat-8', nom: 'Équipements & Fournitures Électriques', icon: ALIBABA_ICONS.plug, color: 'bg-white text-slate-800', filter: 'Équipement' },
    { id: 'cat-9', nom: 'Sûreté & sécurité', icon: ALIBABA_ICONS.security, color: 'bg-white text-slate-800', filter: 'Sécurité' },
    { id: 'cat-10', nom: 'Manutention', icon: ALIBABA_ICONS.forklift, color: 'bg-white text-slate-800', filter: 'Manutention' },
    { id: 'cat-11', nom: 'Instrument & Équipement de test', icon: ALIBABA_ICONS.test, color: 'bg-white text-slate-800', filter: 'Équipement' },
    { id: 'cat-12', nom: "Transmission d'énergie", icon: ALIBABA_ICONS.energy, color: 'bg-white text-slate-800', filter: 'Énergie' },
    { id: 'cat-13', nom: 'Composants électroniques', icon: ALIBABA_ICONS.microchip, color: 'bg-white text-slate-800', filter: 'Électronique' },
    { id: 'cat-14', nom: 'Véhicules et transport', icon: ALIBABA_ICONS.truck, color: 'bg-white text-slate-800', filter: 'Véhicule' },
    { id: 'cat-15', nom: 'Agriculture, Aliments & Boissons', icon: ALIBABA_ICONS.agriculture, color: 'bg-white text-slate-800', filter: 'Agriculture' },
    { id: 'cat-16', nom: 'Matières premières', icon: ALIBABA_ICONS.materials, color: 'bg-white text-slate-800', filter: 'Matériaux' },
    { id: 'cat-17', nom: 'Services de fabrication', icon: ALIBABA_ICONS.factory, color: 'bg-white text-slate-800', filter: 'Service' },
    { id: 'cat-18', nom: 'Service', icon: ALIBABA_ICONS.server, color: 'bg-white text-slate-800', filter: 'Service' },

    // Nouveaux ajouts - Image 3
    { id: 'cat-19', nom: 'Chaussures & Accessoires', icon: ALIBABA_ICONS.shoe, color: 'bg-white text-slate-800', filter: 'Chaussures' },
    { id: 'cat-20', nom: 'Bagages, Sacs, Étuis', icon: ALIBABA_ICONS.bag, color: 'bg-white text-slate-800', filter: 'Bagages' },
    { id: 'cat-21', nom: 'Emballage & Impression', icon: ALIBABA_ICONS.box, color: 'bg-white text-slate-800', filter: 'Emballage' },
    { id: 'cat-22', nom: 'Parents, Enfants & Jouets', icon: ALIBABA_ICONS.toy, color: 'bg-white text-slate-800', filter: 'Jouets' },
    { id: 'cat-23', nom: 'Hygiène perso & Ménage', icon: ALIBABA_ICONS.hygiene, color: 'bg-white text-slate-800', filter: 'Hygiène' },
    { id: 'cat-24', nom: 'Médical & Santé', icon: ALIBABA_ICONS.medical, color: 'bg-white text-slate-800', filter: 'Santé' },
    { id: 'cat-25', nom: 'Cadeaux & Artisanat', icon: ALIBABA_ICONS.gift, color: 'bg-white text-slate-800', filter: 'Cadeaux' },
    { id: 'cat-26', nom: 'Animalerie', icon: ALIBABA_ICONS.paw, color: 'bg-white text-slate-800', filter: 'Animalerie' },
    { id: 'cat-27', nom: 'Fournitures de bureau', icon: ALIBABA_ICONS.pen, color: 'bg-white text-slate-800', filter: 'Bureau' },

    // Nouveaux ajouts - Image 4
    { id: 'cat-28', nom: 'Machines industrielles', icon: ALIBABA_ICONS.factory, color: 'bg-white text-slate-800', filter: 'Machine' },
    { id: 'cat-29', nom: 'Équipements et machines commerciaux', icon: ALIBABA_ICONS.commercial, color: 'bg-white text-slate-800', filter: 'Équipement' },
    { id: 'cat-30', nom: 'Machines pour le Bâtiment & la Construction', icon: ALIBABA_ICONS.excavator, color: 'bg-white text-slate-800', filter: 'Construction' },
    { id: 'cat-31', nom: 'Construction & Immobilier', icon: ALIBABA_ICONS.construction, color: 'bg-white text-slate-800', filter: 'Construction' },
    { id: 'cat-32', nom: 'Meubles', icon: ALIBABA_ICONS.cabinet, color: 'bg-white text-slate-800', filter: 'Meubles' },
    { id: 'cat-33', nom: 'Lumière & Éclairage', icon: ALIBABA_ICONS.lightbulb, color: 'bg-white text-slate-800', filter: 'Lumière' },
    { id: 'cat-34', nom: 'Électroménager', icon: ALIBABA_ICONS.tv, color: 'bg-white text-slate-800', filter: 'Électroménager' },
    { id: 'cat-35', nom: 'Fournitures & Outils auto', icon: ALIBABA_ICONS.wheel, color: 'bg-white text-slate-800', filter: 'Auto' },
    { id: 'cat-36', nom: 'Pièces & Accessoires pour véhicules', icon: ALIBABA_ICONS.wrench, color: 'bg-white text-slate-800', filter: 'Auto' },
    { id: 'cat-37', nom: 'Bricolage & Quincaillerie', icon: ALIBABA_ICONS.wrench, color: 'bg-white text-slate-800', filter: 'Bricolage' },
    { id: 'cat-38', nom: 'Énergies renouvelables', icon: ALIBABA_ICONS.solar, color: 'bg-white text-slate-800', filter: 'Énergie' },
];

export const getCategoryIconComponent = (name, props = {}) => {
    if (!name) return ALIBABA_ICONS.default(props);
    const lowerName = name.toLowerCase();
    const cat = ALIBABA_CATEGORIES.find(c => lowerName.includes(c.filter.toLowerCase()) || c.nom.toLowerCase().includes(lowerName) || lowerName.includes(c.nom.toLowerCase()));
    if (cat) {
        const IconComp = cat.icon;
        return <IconComp {...props} />;
    }
    
    // Fallbacks based on keywords
    if (lowerName.includes('vêtement') || lowerName.includes('mode') || lowerName.includes('textile') || lowerName.includes('accessoire') || lowerName.includes('chaussure') || lowerName.includes('bagage')) return ALIBABA_ICONS.dress(props);
    if (lowerName.includes('électronique') || lowerName.includes('tech') || lowerName.includes('informatique') || lowerName.includes('composant')) return ALIBABA_ICONS.microchip(props);
    if (lowerName.includes('maison') || lowerName.includes('jardin') || lowerName.includes('construction') || lowerName.includes('immobilier') || lowerName.includes('meuble')) return ALIBABA_ICONS.home(props);
    if (lowerName.includes('sport') || lowerName.includes('loisir')) return ALIBABA_ICONS.sports(props);
    if (lowerName.includes('bijou') || lowerName.includes('montre') || lowerName.includes('lunette')) return ALIBABA_ICONS.diamond(props);
    if (lowerName.includes('beauté') || lowerName.includes('santé') || lowerName.includes('hygiène') || lowerName.includes('médical')) return ALIBABA_ICONS.beauty(props);
    if (lowerName.includes('auto') || lowerName.includes('véhicule') || lowerName.includes('transport')) return ALIBABA_ICONS.truck(props);
    if (lowerName.includes('industrie') || lowerName.includes('fabrication') || lowerName.includes('machine')) return ALIBABA_ICONS.factory(props);
    if (lowerName.includes('agriculture') || lowerName.includes('aliment') || lowerName.includes('boisson')) return ALIBABA_ICONS.agriculture(props);
    if (lowerName.includes('bricolage') || lowerName.includes('outil')) return ALIBABA_ICONS.wrench(props);
    
    return ALIBABA_ICONS.default(props);
};

