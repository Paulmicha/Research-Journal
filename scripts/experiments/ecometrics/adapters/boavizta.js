/**
 * @file
 * Contains utilities to transform raw data from diverse sources.
 */

const slugify = require('@sindresorhus/slugify');
const { devicesKeys, commonDeviceNormalization } = require('../entities/device');
const { arr2Props } = require('../utils');

const substitutions = {
	"keys": {
		"kg_co_2eq_total": "kg_co2eq",
		"yearly_tec_k_wh": "yearly_kwh",
		"use": "use_percent",
		"manufacturing": "manufacturing_percent",
		"error": "error_percent"
	},
	"subcategories": {
		"workstation": "desktop"
	}
};

/**
 * Normalizes all boavizta entries at once from extracted CSV.
 *
 * @param {Array} input the extracted CSV data to normalize.
 * @returns {Object} like {
 * 	"boaviztaDevices": {Array} of normalized objects.
 * 	"devicesColNames": {Object} Column names mapped by devicesKeys.
 * }
 */
const devicesFromBoaviztaNormalizeAll = input => {
	const output = {};
	output.devicesColNames = {};
	output.boaviztaDevices = [];

	// Example of a single line entry (1st line contains column names) :
	// ["Lenovo","ThinkPad 8","Workplace","Laptop","159","15.00%","N/A","4","US","2015","https://(snip)","46.54%","","","CN","12.1","","","","",""]
	const colNames = input.shift();
	const rawKeys = colNames.map(colName => slugify(colName, { separator: '_' }));

	// Filter out column we won't use in the "Ecometrics" experiment.
	const keys = rawKeys.map(rawKey => substitutions.keys[rawKey] || rawKey)
		.filter(key => devicesKeys.includes(key));

	// Transform column names in a key/value object.
	colNames.forEach((colName, i) => {
		const key = substitutions.keys[rawKeys[i]];
		if (devicesKeys.includes(key)) {
			output.devicesColNames[key] = colName;
		}
	});

	// Transform CSV line items from linear arrays of values to key/value objects.
	input = input.map(csvLine => arr2Props(csvLine, rawKeys));

	// Filter out the keys we won't use in the "Ecometrics" experiment.
	// Make sure we have the correct number of keys.
	input.forEach((device, i) => {
		output.boaviztaDevices[i] = commonDeviceNormalization(device, substitutions);
	});

	return output;
};

module.exports = {
	devicesFromBoaviztaNormalizeAll
};
