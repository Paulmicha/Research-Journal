/**
 * @file
 * Loosely defines our main entities for the Ecometrics experiment.
 */

const slugify = require('@sindresorhus/slugify');
const { sortObjectKeys } = require('../utils');
const { generateLocationID } = require('./location');

// Common columns for carbon intensity data.
const carbonIntensityKeys = [
	// "id",
	"location", // n:1 entity reference to a unique "location" entity
	"carbon_intensity", // Grid carbon intensity (gCO2eq / kWh)
	// "source"
];

/**
 * Shared Carbon Intensity (CI) normalizations.
 */
const commonCINormalization = (ci, substitutions) => {
	const normalizedCI = {};

	// Normalize keys.
	Object.keys(ci).forEach(rawKey => {
		const key = substitutions['keys'][rawKey] || rawKey;
		if (carbonIntensityKeys.includes(key)) {
			normalizedCI[key] = `${ci[rawKey] || ''}`.trim();
		}
	});

	// Make sure we're not missing any key + filter out any "N/A" value.
	carbonIntensityKeys.forEach(key => {
		if (!(key in normalizedCI) || normalizedCI[key] === 'N/A') {
			normalizedCI[key] = '';
		}
	});

	// Reference location entity. This can only work with objects having 1 or more
	// keys and values in common with location objects (i.e. "continent",
	// "country", "region", "city").
	normalizedCI.location = generateLocationID(ci);

	// The order of keys must be the same for the props2Arr() function to work.
	// @see scripts/experiments/ecometrics/extract.js
	return sortObjectKeys(normalizedCI, carbonIntensityKeys);
};

module.exports = {
	carbonIntensityKeys,
	commonCINormalization
};
