/**
 * Réexporte les profils partagés + styles UI pour le formulaire vendeur.
 */
import * as shared from './categoryAttributeProfiles.cjs';

export const CATEGORY_ATTRIBUTES = shared.CATEGORY_ATTRIBUTE_PROFILES;
export const GENERIC_PROFILE = shared.GENERIC_PROFILE;
export const ALL_PROFILE_IDS = shared.ALL_PROFILE_IDS;
export const getAttributesForCategory = shared.getAttributesForCategory;
export const filterAttributsForProfile = shared.filterAttributsForProfile;
export const mapAiResponseToAttributs = shared.mapAiResponseToAttributs;
export const buildAttributePromptBlock = shared.buildAttributePromptBlock;

export const ATTRIBUTE_COLOR_MAP = {
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-600',    label: 'text-blue-500',    badge: 'bg-blue-100 text-blue-700' },
    purple:  { bg: 'bg-purple-50',  border: 'border-purple-100',  text: 'text-purple-600',  label: 'text-purple-500',  badge: 'bg-purple-100 text-purple-700' },
    indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-100',  text: 'text-indigo-600',  label: 'text-indigo-500',  badge: 'bg-indigo-100 text-indigo-700' },
    green:   { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', label: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    pink:    { bg: 'bg-pink-50',    border: 'border-pink-100',    text: 'text-pink-600',    label: 'text-pink-500',    badge: 'bg-pink-100 text-pink-700' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-600',   label: 'text-amber-500',   badge: 'bg-amber-100 text-amber-700' },
    red:     { bg: 'bg-red-50',     border: 'border-red-100',     text: 'text-red-600',     label: 'text-red-500',     badge: 'bg-red-100 text-red-700' },
    cyan:    { bg: 'bg-cyan-50',    border: 'border-cyan-100',    text: 'text-cyan-600',    label: 'text-cyan-500',    badge: 'bg-cyan-100 text-cyan-700' },
    stone:   { bg: 'bg-stone-50',   border: 'border-stone-100',   text: 'text-stone-600',   label: 'text-stone-500',   badge: 'bg-stone-100 text-stone-700' },
    orange:  { bg: 'bg-orange-50',  border: 'border-orange-100',  text: 'text-orange-600',  label: 'text-orange-500',  badge: 'bg-orange-100 text-orange-700' },
    teal:    { bg: 'bg-teal-50',    border: 'border-teal-100',    text: 'text-teal-600',    label: 'text-teal-500',    badge: 'bg-teal-100 text-teal-700' },
    violet:  { bg: 'bg-violet-50',  border: 'border-violet-100',  text: 'text-violet-600',  label: 'text-violet-500',  badge: 'bg-violet-100 text-violet-700' },
    sky:     { bg: 'bg-sky-50',     border: 'border-sky-100',     text: 'text-sky-600',     label: 'text-sky-500',     badge: 'bg-sky-100 text-sky-700' },
    rose:    { bg: 'bg-rose-50',    border: 'border-rose-100',    text: 'text-rose-600',    label: 'text-rose-500',    badge: 'bg-rose-100 text-rose-700' },
    lime:    { bg: 'bg-lime-50',    border: 'border-lime-100',    text: 'text-lime-600',    label: 'text-lime-500',    badge: 'bg-lime-100 text-lime-700' },
    fuchsia: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-100', text: 'text-fuchsia-600', label: 'text-fuchsia-500', badge: 'bg-fuchsia-100 text-fuchsia-700' },
    yellow:  { bg: 'bg-yellow-50',  border: 'border-yellow-100',  text: 'text-yellow-600',  label: 'text-yellow-500',  badge: 'bg-yellow-100 text-yellow-700' },
    slate:   { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-600',   label: 'text-slate-500',   badge: 'bg-slate-100 text-slate-700' },
};
