/** Routes sans navbar/footer publics (dashboard, auth, etc.) */
const AUTH_LAYOUT_HIDDEN = [
    '/login',
    '/register',
    '/onboarding',
    '/forgot-password',
    '/reset-password',
    '/ai-mode',
];

const DASHBOARD_PREFIXES = [
    '/dashboard',
    '/messages',
    '/wallet',
    '/profile',
    '/orders',
    '/notifications',
    '/settings',
    '/credits',
    '/tracking',
    '/payments',
    '/vendor',
    '/admin',
    '/bank',
    '/carrier',
    '/dispute',
    '/disputes',
    '/technician',
    '/group-purchase',
    '/sav',
    '/cart',
    '/checkout',
    '/payment',
];

/** Sans navbar/footer mais scroll page normale (formulaires longs) */
const SCROLLABLE_HIDDEN_LAYOUT = ['/cart', '/checkout', '/payment'];

export function shouldHidePublicLayout(pathname = '') {
    if (AUTH_LAYOUT_HIDDEN.includes(pathname)) return true;
    return DASHBOARD_PREFIXES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
}

export function shouldLockViewport(pathname = '') {
    if (!shouldHidePublicLayout(pathname)) return false;
    return !SCROLLABLE_HIDDEN_LAYOUT.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
}
