/**
 * @file
 * Contains utilities to transform raw data from diverse sources.
 */

const { carbonIntensityKeys, commonCINormalization } = require('../entities/carbonIntensity');
const { arr2Props, sortObjectKeys } = require('../utils');

const substitutions = {
	"keys": {
		"location": "country_code",
		"continentName": "continent",
		"countryName": "country",
		"regionName": "region",
		"carbonIntensity": "carbon_intensity",
		"Type": "type"
	}
};

/**
 * Normalizes all Green Algorithms Carbon Intensity entries from extracted CSV.
 *
 * Example of a single line entry :
 * US-SC,North America,United States of America,South Carolina,302.63,Region,carbonfootprint (June 2020 v1.4),Figures from 2018 (published in 2020)
 * @see private/footprint-data/CI_aggregated.csv
 *
 * @param {Array} input the extracted CSV data to normalize.
 * @returns {Object} like {
 * 	"greenAlgorithmsCI": {Array} of normalized objects.
 * 	"greenAlgorithmsCIColNames": {Object} Column names mapped by carbonIntensityKeys.
 * }
 */
const greenAlgorithmsCINormalizeAll = input => {
	const output = {};
	output.greenAlgorithmsCI = [];
	output.greenAlgorithmsCIColNames = {};

	// This file has 2 lines for header. We want the 2nd.
	input.shift();
	const rawKeys = input.shift();

	// Transform column names in a key/value object.
	rawKeys.forEach((colName, i) => {
		const key = substitutions.keys[rawKeys[i]] || colName;
		if (carbonIntensityKeys.includes(key)) {
			output.greenAlgorithmsCIColNames[key] = colName;
		}
	});
	output.greenAlgorithmsCIColNames = sortObjectKeys(output.greenAlgorithmsCIColNames, carbonIntensityKeys);

	// Transform CSV line items from linear arrays of values to key/value objects.
	input = input.map(csvLine => arr2Props(csvLine, rawKeys));

	// Filter out the keys we won't use in the "Ecometrics" experiment.
	// Make sure we have the correct number of keys.
	input.forEach((ci, i) => {
		output.greenAlgorithmsCI[i] = commonCINormalization(ci, substitutions);
	});

	return output;
};

module.exports = {
	greenAlgorithmsCINormalizeAll
};
