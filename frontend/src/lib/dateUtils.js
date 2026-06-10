/**
 * Extrait une date fiable depuis un enregistrement API (snake_case ou camelCase Sequelize).
 */
export function getRecordTimestamp(record) {
    if (!record || typeof record !== 'object') return null;
    const raw = record.created_at ?? record.createdAt ?? record.updated_at ?? record.updatedAt ?? record.date;
    if (!raw) return null;
    const date = raw instanceof Date ? raw : new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatRecordTime(record, locale = 'fr-FR', options = { hour: '2-digit', minute: '2-digit' }) {
    const date = getRecordTimestamp(record);
    if (!date) return '—';
    return date.toLocaleTimeString(locale, options);
}

export function formatRecordDateTime(record, locale = 'fr-FR') {
    const date = getRecordTimestamp(record);
    if (!date) return '—';
    return date.toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
