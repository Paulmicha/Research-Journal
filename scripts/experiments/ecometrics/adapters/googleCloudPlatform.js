/**
 * @file
 * Contains utilities to transform raw data from diverse sources.
 */

const slugify = require('@sindresorhus/slugify');
const { commonCINormalization } = require('../entities/carbonIntensity');
const { arr2Props } = require('../utils');

const substitutions = {
	"keys": {
		"location": "city",
		"grid_carbon_intensity_g_co_2eq_k_wh": "carbon_intensity"
	}
};

/**
 * Normalizes all Google Cloud Platform CI entries from extracted CSV.
 *
 * Example of a single line entry :
 * us-east1,South Carolina,0.27,480,0
 * @see private/footprint-data/GoogleCloudPlatform-region-carbon-info-2020.csv
 *
 * @param {Array} input the extracted CSV data to normalize.
 * @returns {Object} like {
 * 	"googleCloudPlatformCI": {Array} of normalized objects.
 * }
 */
const googleCloudPlatformCINormalizeAll = input => {
	const colNames = input.shift();
	const rawKeys = colNames.map(colName => slugify(colName, { separator: '_' }));

	// Transform CSV line items from linear arrays of values to key/value objects.
	input = input.map(csvLine => arr2Props(csvLine, rawKeys));

	// Transform the "Google Cloud Region" and "Location" columns to match the
	// normalized carbon intensity object format (without spending too much time
	// on it, in a "good enough for now" way).
	return {
		googleCloudPlatformCI: input.map(ci => {
			const parts = ci.google_cloud_region.split('-');
			switch (parts[0]) {
				case 'southamerica':
					ci.country_code = 'BR';
					ci.continent = "South America";
					ci.country = "Brazil";
					break;
				case 'northamerica':
					ci.country_code = 'CA';
					ci.continent = "North America";
					ci.country = "Canada";
					break;
				case 'asia':
					ci.continent = "Asia";
					break;
				case 'us':
					ci.country_code = 'US';
					ci.continent = "North America";
					ci.country = "United States of America";
					switch (parts[1]) {
						case 'central1':
							ci.location = '';
							ci.region = 'Iowa';
							break;
						case 'east1':
							ci.location = '';
							ci.region = 'South Carolina';
							ci.known_services = 'Gitlab';
							break;
						case 'east4':
							ci.location = '';
							ci.region = 'Northern Virginia';
							break;
						case 'west1':
							ci.location = '';
							ci.region = 'Oregon';
							break;
					}
					break;
				case 'europe':
					ci.continent = "Europe";
					switch (parts[1]) {
						case 'north1':
							ci.country_code = 'FI';
							ci.country = "Finland";
							ci.location = '';
							break;
						case 'west1':
							ci.country_code = 'BE';
							ci.country = "Belgium";
							ci.location = '';
							break;
						case 'west4':
							ci.country_code = 'NL';
							ci.country = "Netherlands";
							ci.location = '';
							break;
					}
					break;
			}
			return commonCINormalization(ci, substitutions);
		})
	};
};

module.exports = {
	googleCloudPlatformCINormalizeAll
};
