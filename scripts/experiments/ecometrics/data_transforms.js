
/**
 * @file
 * Provides utilities to facilitate data normalization.
 *
 * The "Ecometrics" experiment uses 2 types of entities :
 *	- devices impact measures
 *	- co2 equivalences
 *
 * For now, we hardcode the list of keys for each one to consolidate the data.
 */

const slugify = require('@sindresorhus/slugify');

// This follows more or less the Boavizta column names. We'll use a subset.
// See https://github.com/Boavizta/environmental-footprint-data/blob/main/boavizta-data-us.csv
// See https://gitlab.inria.fr/guenneba/ecodiag/-/blob/master/src/devices.js
const devicesKeys = [
	"id", // to export a device selection list as URL query parameter
	"manufacturer",
	"name",
	"category",
	"subcategory",
	"kg_co2eq", // 'kg_co_2eq_total' in Boavizta (production + transport)
	"yearly_kwh", // 'yearly_tec_k_wh' in Boavizta, "kWh/an" (power consumption)
	"use_percent", // 'use' in Boavizta
	"manufacturing_percent", // 'manufacturing' in Boavizta
	"lifetime",
	"use_location",
	"date", // model released on this date
	// "sources",
	"error_percent", // error
	// "weight", // ? no unit provided (Boavizta)
	// "assembly_location",
	// "screen_size",
	// "server_type",
	// "hdd_ssd",
	// "ram",
	// "cpu",
	// "u"
];

// This flattens the datagir data, almost used "as is".
// See https://github.com/datagir/monconvertisseurco2/blob/master/public/data/equivalents.json
const co2EqKeys = [
	"id",
	"name_fr",
	"emoji",
	"total",
	"about"
];

/**
 * CSV extracted data helper.
 *
 * Both csvLine and keys arrays MUST have the same size (required to match).
 */
const arr2Props = (csvLine, keys) => {
	const obj = {};
	csvLine.forEach((value, i) => {
		if (!keys[i]) {
			return
		}
		obj[keys[i]] = value;
	});
	return obj;
};

/**
 * Sorts device object keys in the correct order.
 *
 * The order of keys must be the same for the props2Arr() function to work.
 * @see scripts/experiments/ecometrics/extract.js
 *
 * @param {Object} device : normalized device object.
 */
const sortDeviceObjKeys = device => {
	const orderedObj = {};
	devicesKeys.forEach(key => orderedObj[key] = device[key]);
	return orderedObj;
};

/**
 * Generates a unique numerical device "fingerprint".
 *
 * Best guess is to use a slug of manufacturer + subcategory + device name as a
 * kind of fingerprint (because in the future, when updates of sources are
 * fetched, the other props might be more likely to vary and/or be completed).
 *
 * We'll also store an array of fingerprints to make sure we avoid duplicates.
 * @see generateDevicesIds()
 *
 * @param {Object} device : normalized device object.
 */
const getDeviceFingerprint = device => slugify(
	`${device.manufacturer} ${device.subcategory} ${device.name}`,
	{ separator: '_' }
);

/**
 * Generates a 53-bit hash.
 *
 * See https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480#52171480
 */
const cyrb53 = (str, seed = 0) => {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
	h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1>>>0);
};

/**
 * Generates unique numerical device IDs.
 *
 * @see getDeviceFingerprint()
 *
 * @param {Object} data : whole ecometrics dataset, where data.devices contains
 *   the list of every aggregated devices' objects.
 */
const generateDevicesIds = data => {
	// Associates fingerprints to every data.devices, drop the ones which don't
	// have enough data to get one (presumably inexploitable).
	data.devices
		.map(device => device.fingerprint = getDeviceFingerprint(device))
		.filter(device => device.fingerprint && device.fingerprint.length);

	// Prevent duplicates.
	let dedup = {};
	// Debug (these duplicates appear discardable) :
	// data.devices.forEach(device => {
	// 	if (!dedup[device.fingerprint]) {
	// 		dedup[device.fingerprint] = [];
	// 	}
	// 	dedup[device.fingerprint].push(device);
	// });
	// let duplicatesCount = 0;
	// Object.keys(dedup).forEach(fingerprint => {
	// 	if (dedup[fingerprint].length > 1) {
	// 		duplicatesCount++;
	// 		console.log(dedup[fingerprint]);
	// 	}
	// });
	// console.log(duplicatesCount);

	// Flatten - keep only the last of all duplicates.
	data.devices.forEach(device => {
		const d = {...device};
		delete d['fingerprint'];
		dedup[device.fingerprint] = d;
	});

	data.deviceFingerprints = Object.keys(dedup);
	data.deviceFingerprints.sort();

	const sortedDevices = [];
	data.deviceFingerprints.forEach((fingerprint, i) => {
		sortedDevices[i] = dedup[fingerprint];

		// If the items change place in the sorted array, the fingerprint will not
		// change. TODO evalute collision risk of truncating at 8 chars ?
		sortedDevices[i].id = `${cyrb53(fingerprint)}`.substring(0, 8);
	});

	data.devices = sortedDevices;
};

/**
 * Normalizes Boavizta keys.
 */
const normalizeBoaviztaKey = rawKey => {
	const map = {
		"kg_co_2eq_total": "kg_co2eq",
		"yearly_tec_k_wh": "yearly_kwh",
		"use": "use_percent",
		"manufacturing": "manufacturing_percent",
		"error": "error_percent"
	};
	return map[rawKey] || rawKey;
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
	const keys = rawKeys.map(rawKey => normalizeBoaviztaKey(rawKey))
		.filter(key => devicesKeys.includes(key));

	// Transform column names in a key/value object.
	colNames.forEach((colName, i) => {
		const key = normalizeBoaviztaKey(rawKeys[i]);
		if (devicesKeys.includes(key)) {
			output.devicesColNames[key] = colName;
		}
	});

	// Transform CSV line items from linear arrays of values to key/value objects.
	input = input.map(csvLine => arr2Props(csvLine, rawKeys));

	// Filter out the keys we won't use in the "Ecometrics" experiment.
	// Make sure we have the correct number of keys.
	input.forEach((deviceRaw, i) => {
		const cleanedObj = {};
		Object.keys(deviceRaw).forEach(rawKey => {
			const key = normalizeBoaviztaKey(rawKey);
			if (devicesKeys.includes(key)) {
				cleanedObj[key] = `${deviceRaw[rawKey] || ''}`.trim();
			}
		});
		devicesKeys.forEach(key => {
			if (!(key in cleanedObj)) {
				cleanedObj[key] = '';
			}
		});
		output.boaviztaDevices[i] = sortDeviceObjKeys(cleanedObj);
	});

	return output;
};

/**
 * Normalizes Ecodiag keys.
 */
const normalizeEcodiagKeys = rawKey => {
	const map = {
		// "label_fr": "", // TODO [evol] string translations.
    "label_en": "name",
    "label": "name",
    "grey_CO2": "kg_co2eq",
    "yearly_consumption": "yearly_kwh",
    "duration": "lifetime"
	};
	return map[rawKey] || rawKey;
};

/**
 * Normalizes all ecodiag entries at once.
 *
 * @see scripts/experiments/ecometrics/ecodiag/devices.js
 *
 * @param {Object} input the ecodiagDeviceList.
 * @returns {Array} list of normalized device objects.
 */
const devicesFromEcodiagNormalizeAll = input => {
	const output = [];
	const models = [];
	const defaultsByCategoryRaw = {};

	Object.keys(input).forEach(categoryRaw => {
		if ('models' in input[categoryRaw]) {
			Object.keys(input[categoryRaw].models).forEach(modelRaw => {
				input[categoryRaw].models[modelRaw].subcategory = categoryRaw;
				models.push({...input[categoryRaw].models[modelRaw]});

				// Erase while we process so we can get the rest as defaults below.
				delete input[categoryRaw].models[modelRaw];
			});

			delete input[categoryRaw].models;
			input[categoryRaw].subcategory = categoryRaw;
			models.push({...input[categoryRaw]});

			// Used to complete missing entries below.
			defaultsByCategoryRaw[categoryRaw] = {...input[categoryRaw]};
		} else {
			input[categoryRaw].subcategory = categoryRaw;
			models.push({...input[categoryRaw]});
		}
	});

	// Manual adjustments.
	models.map(model => {
		if (!model.subcategory) {
			return;
		}

		// Fill in missing values (TODO confirm this is inherited).
		if (model.subcategory in defaultsByCategoryRaw) {
			Object.keys(defaultsByCategoryRaw[model.subcategory]).forEach(rawKey => {
				if (!(rawKey in model)) {
					model[rawKey] = defaultsByCategoryRaw[model.subcategory][rawKey];
				}
			});
			// TODO workaround naming issues.
			if ('label_en' in model && model.label_en !== model.subcategory) {
				model.label_en = model.subcategory + ' ' + model.label_en;
			} else if ('label' in model && model.label !== model.subcategory) {
				model.label_en = model.subcategory + ' ' + model.label;
			}
		}

		// Roughly map to Boavizta categorization.
		if (model.subcategory === 'server') {
			model.category = 'Datacenter';
		} else {
			model.category = 'Workplace';
		}

		// Convert objects to values for kg_co2eq.
		if ('grey_CO2' in model && typeof model.grey_CO2 === 'object') {
			model.kg_co2eq = model.grey_CO2.mean;
			model.error_percent = (model.grey_CO2.std * 100).toFixed(2);
		}

		// Normalize keys.
		const cleanedObj = {};

		Object.keys(model).forEach(rawKey => {
			const key = normalizeEcodiagKeys(rawKey);
			if (devicesKeys.includes(key)) {
				if (model[rawKey] == 'N/A') {
					model[rawKey] = '';
				}
				cleanedObj[key] = `${model[rawKey] || ''}`.trim();
			}
		});

		devicesKeys.forEach(key => {
			if (!(key in cleanedObj)) {
				cleanedObj[key] = '';
			}
		});

		// The order of keys must be the same for the props2Arr() function to work.
		// @see scripts/experiments/ecometrics/extract.js
		const orderedObj = sortDeviceObjKeys(cleanedObj);

		// TODO unusable titles (lots of duplicates with distinct values - we need
		// just a few generic entries here, no time for now to dig deeper -> skip
		// if we already have an identical title).
		let alreadyExists = false;
		output.forEach(device => {
			if (device.name === orderedObj.name) {
				alreadyExists = true;
			}
		});
		if (!alreadyExists) {
			orderedObj.name = orderedObj.name.charAt(0).toUpperCase() + orderedObj.name.slice(1) + ' - ecodiag';
			output.push(orderedObj);
		}
	});

	return output;
}

/**
 * Normalizes co2Eq objects from extracted data sources.
 *
 * @param {Object} input the raw items to normalize.
 * @returns {Object} the correctly formatted object.
 */
const co2EqNormalizeItem = input => {
	const output = {};

	// Example input :
	// {
  //   "id": 32,
  //   "name": {
  //     "fr": "Jour[s] de chauffage (gaz)"
  //   },
  //   "emoji": "🏘️",
  //   "total": 18.63,
  //   "default": true,
  //   "defaultEmbed": true,
  //   "about": "(snip HTML string)"
  // },

	co2EqKeys.forEach(k => {
		if (k in input) {
			output[k] = `${input[k] || ''}`.trim();
		} else {
			switch (k) {
				case 'name_fr':
					output[k] = `${input.name.fr || ''}`.trim();
					break;
			}
		}
	});

	return output;
};

module.exports = {
	devicesKeys,
	devicesFromBoaviztaNormalizeAll,
	devicesFromEcodiagNormalizeAll,
	generateDevicesIds,
	co2EqKeys,
	co2EqNormalizeItem
};
