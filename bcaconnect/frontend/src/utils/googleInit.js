/**
 * googleInit.js – Centralised Google Identity Services (GSI) loader.
 * Ensures the GSI script is injected only once and provides a cleanup function.
 * Usage:
 *   import { initGoogleSSO } from '../../utils/googleInit';
 *   const cleanup = initGoogleSSO(callback);
 *   // When component unmounts, call cleanup();
 */

export function initGoogleSSO(callback) {
  // If the script is already present, we don't add another.
  let script = document.getElementById('google-gsi-script');
  if (!script) {
    script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  // When the script loads, initialize Google SSO.
  const onLoad = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  };

  // Attach load handler (if script already loaded, call immediately).
  if (script.readyState === 'complete' || script.readyState === 'loaded') {
    onLoad();
  } else {
    script.addEventListener('load', onLoad);
  }

  // Return cleanup that removes the load listener and optionally the script.
  return () => {
    script && script.removeEventListener('load', onLoad);
    // Do not remove the script globally; keep it for other components.
    // If you really need to remove, uncomment the line below:
    // script && script.parentNode && script.parentNode.removeChild(script);
  };
}
