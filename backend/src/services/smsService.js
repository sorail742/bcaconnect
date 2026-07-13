/**
 * Service SMS Phase 3 — providers pluggables.
 * Dev : SMS_ENABLED=true SMS_PROVIDER=console
 * Prod : SMS_PROVIDER=http + SMS_WEBHOOK_URL (gateway Africa's Talking, Twilio, etc.)
 */

const SMS_ENABLED = process.env.SMS_ENABLED === 'true';
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'console';
const SMS_WEBHOOK_URL = process.env.SMS_WEBHOOK_URL;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'BCAConnect';

function normalizePhone(phone) {
    if (!phone) return null;
    const digits = String(phone).replace(/\D/g, '');
    if (!digits) return null;
    if (digits.startsWith('224')) return `+${digits}`;
    if (digits.length === 9) return `+224${digits}`;
    return digits.startsWith('+') ? phone : `+${digits}`;
}

async function sendViaConsole(phone, message) {
    console.log(`[SMS:console -> ${phone}] ${message}`);
    return { ok: true, provider: 'console' };
}

async function sendViaHttp(phone, message) {
    if (!SMS_WEBHOOK_URL) {
        console.warn('[SMS] SMS_WEBHOOK_URL manquant — fallback console');
        return sendViaConsole(phone, message);
    }

    const res = await fetch(SMS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: phone,
            from: SMS_SENDER_ID,
            message,
        }),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`SMS webhook ${res.status}: ${body.slice(0, 200)}`);
    }

    return { ok: true, provider: 'http', status: res.status };
}

/**
 * @param {string} phone - Numéro destinataire
 * @param {string} message - Contenu SMS (160 car. recommandé)
 * @returns {Promise<{ok?: boolean, skipped?: boolean, reason?: string}>}
 */
async function sendSms(phone, message) {
    if (!SMS_ENABLED) {
        return { skipped: true, reason: 'disabled' };
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
        return { skipped: true, reason: 'no_phone' };
    }

    const text = String(message).slice(0, 160);

    try {
        switch (SMS_PROVIDER) {
            case 'http':
                return await sendViaHttp(normalized, text);
            case 'console':
            default:
                return await sendViaConsole(normalized, text);
        }
    } catch (err) {
        console.error('[SMS] Échec envoi:', err.message);
        return { ok: false, error: err.message };
    }
}

module.exports = { sendSms, normalizePhone, SMS_ENABLED };
