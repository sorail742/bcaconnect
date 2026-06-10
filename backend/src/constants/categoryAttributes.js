/**
 * Réexport backend — profils partagés (source : frontend/src/lib).
 */
const path = require('path');
const profiles = require(path.join(__dirname, '../../../frontend/src/lib/categoryAttributeProfiles.cjs'));

module.exports = {
    CATEGORY_ATTRIBUTES: profiles.CATEGORY_ATTRIBUTE_PROFILES,
    GENERIC_PROFILE: profiles.GENERIC_PROFILE,
    ALL_PROFILE_IDS: profiles.ALL_PROFILE_IDS,
    getAttributesForCategory: profiles.getAttributesForCategory,
    buildAttributePromptBlock: profiles.buildAttributePromptBlock,
    filterAttributsForProfile: profiles.filterAttributsForProfile,
    mapAiResponseToAttributs: profiles.mapAiResponseToAttributs,
};
