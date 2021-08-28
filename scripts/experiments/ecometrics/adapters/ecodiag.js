/**
 * @file
 * Contains utilities to transform raw data from diverse sources.
 */

const { commonDeviceNormalization } = require('../entities/device');

const substitutions = {
	"keys": {
		"label_en": "name",
		"label": "name",
		"grey_CO2": "kg_co2eq",
		"yearly_consumption": "yearly_kwh",
		"duration": "lifetime"
	},
	"subcategories": {
		"pad": "tablet",
		"screen": "monitor",
		"wifihub": "router"
	}
};

/**
 * Normalizes all ecodiag entries at once.
 *
 * @see scripts/experiments/ecometrics/manual-data/ecodiag.js
 *
 * @param {Object} input the ecodiagDeviceList.
 * @returns {Array} list of normalized device objects.
 */
const devicesFromEcodiagNormalizeAll = input => {
	const output = [];
	const devices = [];
	const defaultsByCategoryRaw = {};

	Object.keys(input).forEach(categoryRaw => {
		if ('models' in input[categoryRaw]) {
			Object.keys(input[categoryRaw].models).forEach(modelRaw => {
				const item = input[categoryRaw].models[modelRaw];

				// Some entries are not objects, just numbers.
				if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
					item.subcategory = categoryRaw;
					devices.push({...item});
				} else if (isFinite(String(item))) {
					devices.push({
						name: modelRaw,
						subcategory: categoryRaw,
						kg_co2eq: item
					});
				}

				// Erase while we process so we can get the rest as defaults below.
				delete input[categoryRaw].models[modelRaw];
			});

			delete input[categoryRaw].models;
			input[categoryRaw].subcategory = categoryRaw;
			devices.push({...input[categoryRaw]});

			// Used to complete missing entries below.
			defaultsByCategoryRaw[categoryRaw] = {...input[categoryRaw]};
		} else {
			input[categoryRaw].subcategory = categoryRaw;
			devices.push({...input[categoryRaw]});
		}
	});

	// Manual adjustments.
	devices.map(device => {
		if (!device.subcategory) {
			return;
		}

		// Fill in missing values (TODO confirm this is inherited).
		if (device.subcategory in defaultsByCategoryRaw) {
			Object.keys(defaultsByCategoryRaw[device.subcategory]).forEach(rawKey => {
				if (!(rawKey in device)) {
					device[rawKey] = defaultsByCategoryRaw[device.subcategory][rawKey];
				}
			});
			// TODO workaround naming issues.
			if ('label_en' in device && device.label_en !== device.subcategory) {
				device.label_en = device.subcategory + ' ' + device.label_en;
			} else if ('label' in device && device.label !== device.subcategory) {
				device.label_en = device.subcategory + ' ' + device.label;
			}
		}

		// Roughly map to Boavizta categorization.
		if (device.subcategory === 'server') {
			device.category = 'Datacenter';
		} else {
			device.category = 'Workplace';
		}

		// Convert objects to values for kg_co2eq.
		if ('grey_CO2' in device && typeof device.grey_CO2 === 'object') {
			device.kg_co2eq = device.grey_CO2.mean;
			device.error_percent = (device.grey_CO2.std * 100).toFixed(2);
		}

		// The order of keys must be the same for the props2Arr() function to work.
		// @see scripts/experiments/ecometrics/extract.js
		const normalizedDevice = commonDeviceNormalization(device, substitutions);

		// TODO unusable titles (lots of duplicates with distinct values - we need
		// just a few generic entries here, no time for now to dig deeper -> skip
		// if we already have an identical title).
		let alreadyExists = false;
		output.forEach(device => {
			if (device.name === normalizedDevice.name) {
				alreadyExists = true;
			}
		});
		if (!alreadyExists) {
			// Apply uppercase on 1st character + append suffix.
			normalizedDevice.name = normalizedDevice.name.charAt(0).toUpperCase() + normalizedDevice.name.slice(1) + ' - ecodiag';
			output.push(normalizedDevice);
		}
	});

	return output;
}

module.exports = {
	devicesFromEcodiagNormalizeAll
};
