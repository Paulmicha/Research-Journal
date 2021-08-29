/**
 * @file
 * Loosely defines our main entities for the Ecometrics experiment.
 */

const slugify = require('@sindresorhus/slugify');
const { sortObjectKeys, cyrb53 } = require('../utils');

// Basic location entity to link carbon intensity data with cloud providers,
// services and devices use.
const locationKeys = [
	"id",
	"country_code",
	"continent",
	"country",
	"region",
	"city"
];

/**
 * Generates given location "fingerprint".
 *
 * @param {Object} location : the entity being created.
 * @return {String} : hopefully stable-ish value to be transformed into a hash.
 */
const getFingerprint = location => slugify(
	`${location.continent || ''} ${location.country || ''} ${location.region || ''} ${location.city || ''}`,
	{ separator: '_' }
);

/**
 * Generates unique numerical location IDs.
 *
 * @param {Object} location : the entity being created.
 */
const generateLocationID = location => `${cyrb53(getFingerprint(location))}`.substring(0, 8);

/**
 * Shared location normalizations.
 */
const locationNormalizeItem = location => {
	const normalized = {...location};

	// Make sure we're not missing any key + filter out any "Any" value.
	locationKeys.forEach(key => {
		if (!(key in normalized) || normalized[key] === 'Any') {
			normalized[key] = '';
		}
	});

	// Generate location ID.
	normalized.id = generateLocationID(location);

	return sortObjectKeys(normalized, locationKeys);
};

/**
 * Determines if a location already has a corresponding entity.
 *
 * @param {Object} locationBlueprint object that must represent exactly how the
 *   hypothetical location would be given an ID (i.e. : continent, country,
 *   region, city).
 * @param {Array} existingLocations list of all the existing location entities.
 * @returns {Boolean}
 */
const locationExists = (locationBlueprint, existingLocations) => {
	if (!existingLocations.length) {
		return false;
	}
	const lid = generateLocationID(locationBlueprint);
	for (let i = 0; i < existingLocations.length; i++) {
		const location = existingLocations[i];
		if (location.id == lid) {
			return true;
		}
	}
	return false;
};

module.exports = {
	locationKeys,
	locationNormalizeItem,
	generateLocationID,
	locationExists
};
