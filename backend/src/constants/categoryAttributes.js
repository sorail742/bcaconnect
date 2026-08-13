/**
 * Réexport backend — profils d'attributs partagés (voir
 * categoryAttributeProfiles.js pour l'origine/la raison de la duplication).
 */
const profiles = require('./categoryAttributeProfiles');

async function initCategoryAttributes() {
    return profiles;
}

module.exports = {
    initCategoryAttributes,
    CATEGORY_ATTRIBUTES: profiles.CATEGORY_ATTRIBUTE_PROFILES,
    GENERIC_PROFILE: profiles.GENERIC_PROFILE,
    ALL_PROFILE_IDS: profiles.ALL_PROFILE_IDS,
    getAttributesForCategory: profiles.getAttributesForCategory,
    buildAttributePromptBlock: profiles.buildAttributePromptBlock,
    filterAttributsForProfile: profiles.filterAttributsForProfile,
    mapAiResponseToAttributs: profiles.mapAiResponseToAttributs,
};
