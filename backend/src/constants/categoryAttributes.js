/**
 * Réexport backend — profils partagés (source : frontend/src/lib).
 */
const path = require('path');
const { pathToFileURL } = require('url');

const profilesUrl = pathToFileURL(
    path.join(__dirname, '../../../frontend/src/lib/categoryAttributeProfiles.js')
).href;

let profiles = null;

async function initCategoryAttributes() {
    if (!profiles) {
        profiles = await import(profilesUrl);
    }
    return profiles;
}

function requireProfiles() {
    if (!profiles) {
        throw new Error(
            'Profils catégories non chargés — initCategoryAttributes() doit être appelé au démarrage.'
        );
    }
    return profiles;
}

module.exports = {
    initCategoryAttributes,
    get CATEGORY_ATTRIBUTES() { return requireProfiles().CATEGORY_ATTRIBUTE_PROFILES; },
    get GENERIC_PROFILE() { return requireProfiles().GENERIC_PROFILE; },
    get ALL_PROFILE_IDS() { return requireProfiles().ALL_PROFILE_IDS; },
    getAttributesForCategory: (...args) => requireProfiles().getAttributesForCategory(...args),
    buildAttributePromptBlock: (...args) => requireProfiles().buildAttributePromptBlock(...args),
    filterAttributsForProfile: (...args) => requireProfiles().filterAttributsForProfile(...args),
    mapAiResponseToAttributs: (...args) => requireProfiles().mapAiResponseToAttributs(...args),
};
