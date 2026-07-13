/**
 * Google Identity Services (GSI) — chargement script + init + bouton.
 */

const PLACEHOLDER_IDS = new Set([
  '',
  'votre_client_id_google',
  'your_google_client_id',
]);

export function isGoogleAuthConfigured() {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  return Boolean(id && !PLACEHOLDER_IDS.has(id));
}

export function getGoogleOAuthOriginsToRegister() {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002';
  const defaults = ['http://localhost:3002', 'http://127.0.0.1:3002'];
  return [...new Set([origin, ...defaults])];
}

export function logGoogleOAuthSetupHint() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  const origins = getGoogleOAuthOriginsToRegister();
  const clientSuffix = import.meta.env.VITE_GOOGLE_CLIENT_ID?.slice(-24) || '(non défini)';
  console.info(
    `[BCA Google OAuth] Client ID (fin) : …${clientSuffix}\n` +
    `Origines JavaScript autorisées (Google Cloud) :\n` +
    origins.map((o) => `  • ${o}`).join('\n')
  );
}

function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    let script = document.getElementById('google-gsi-script');
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Échec chargement Google GSI'));
      document.head.appendChild(script);
      return;
    }

    if (script.readyState === 'complete' || script.readyState === 'loaded') {
      resolve();
    } else {
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('Échec chargement Google GSI')), { once: true });
    }
  });
}

function containerHasGoogleButton(el) {
  if (!el) return false;
  return Boolean(
    el.querySelector('iframe')
    || el.querySelector('[role="button"]')
    || el.children.length > 0
  );
}

/**
 * @param {Function} credentialCallback
 * @param {Function} [onReady] — ({ configured, renderButton }) après init GSI
 */
export function initGoogleSSO(credentialCallback, onReady) {
  let cancelled = false;

  (async () => {
    if (!isGoogleAuthConfigured()) {
      onReady?.({ configured: false, renderButton: () => false });
      return;
    }

    try {
      await loadGsiScript();
      if (cancelled) return;

      if (!window.google?.accounts?.id) {
        onReady?.({ configured: false, renderButton: () => false });
        return;
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: credentialCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'popup',
      });

      logGoogleOAuthSetupHint();

      const renderBtn = (containerId) => renderGoogleButton(containerId);

      onReady?.({ configured: true, renderButton: renderBtn });
    } catch (err) {
      console.warn('[Google SSO]', err.message);
      onReady?.({ configured: false, renderButton: () => false });
    }
  })();

  return () => {
    cancelled = true;
  };
}

/**
 * @returns {boolean} true si le bouton semble rendu
 */
export function renderGoogleButton(containerId, options = {}) {
  const el = typeof containerId === 'string'
    ? document.getElementById(containerId)
    : containerId;

  if (!el || !window.google?.accounts?.id || !isGoogleAuthConfigured()) {
    return false;
  }

  el.innerHTML = '';

  const width = Math.min(400, Math.max(el.offsetWidth || 320, 280));

  try {
    window.google.accounts.id.renderButton(el, {
      theme: 'outline',
      size: 'large',
      width,
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      locale: 'fr',
      type: 'standard',
      ...options,
    });
  } catch (err) {
    console.warn('[Google SSO] renderButton:', err.message);
    return false;
  }

  return containerHasGoogleButton(el);
}

/** Réessaie le rendu jusqu'à ce que le conteneur DOM existe (max ~3 s). */
export function renderGoogleButtonWithRetry(containerId, renderFn = renderGoogleButton) {
  let attempts = 0;
  const maxAttempts = 20;

  const tick = () => {
    const el = document.getElementById(containerId);
    if (!el) {
      if (++attempts < maxAttempts) setTimeout(tick, 150);
      return;
    }

    if (renderFn(containerId)) return;

    if (++attempts < maxAttempts) {
      setTimeout(tick, 150);
    } else if (import.meta.env.DEV) {
      console.warn('[Google SSO] Bouton non rendu — vérifier origines JavaScript dans Google Cloud.');
    }
  };

  tick();
}

/** Bouton secours : ouvre le flux Google (popup) si renderButton échoue. */
export function openGoogleSignInPopup() {
  if (!window.google?.accounts?.id || !isGoogleAuthConfigured()) {
    return false;
  }
  window.google.accounts.id.prompt();
  return true;
}
