
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
	"screen_size",
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

// Common columns for carbon intensity data.
const carbonIntensityKeys = [
	"country_code",
	"continent",
	"country",
	"region",
	"city",
	"carbon_intensity", // Grid carbon intensity (gCO2eq / kWh)
	"known_services",
	"source"
];

const substitutions = {
	"boavizta": {
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
	},
	"ecodiag": {
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
	},
	"greenAlgorithms": {
		"keys": {
			"location": "country_code",
			"continentName": "continent",
			"countryName": "country",
			"regionName": "region",
			"carbonIntensity": "carbon_intensity",
			"Type": "type"
		}
	},
	"googleCloudPlatform": {
		"keys": {
			"location": "city",
			"grid_carbon_intensity_g_co_2eq_k_wh": "carbon_intensity"
		}
	}
};

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
 * Sorts object keys in the order specified by given array.
 *
 * The order of keys must be the same for the props2Arr() function to work.
 * @see scripts/experiments/ecometrics/extract.js
 *
 * @param {Object} o : the object whose keys are to be sorted.
 * @param {Array} orderedKeys : array of keys in the correct order.
 */
const sortObjectKeys = (o, orderedKeys) => {
	const orderedObj = {};
	orderedKeys.forEach(key => orderedObj[key] = o[key]);
	return orderedObj;
};

/**
 * Generates given device "fingerprint".
 *
 * Best guess is to use a slug of manufacturer + subcategory + device name as a
 * kind of fingerprint (because in the future, when updates of sources are
 * fetched, the other props might be more likely to vary and/or be completed).
 *
 * @see generateDevicesIds()
 *
 * @param {Object} device : normalized device object.
 * @return {String} : hopefully stable-ish value to be transformed into a hash.
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
 * Determines the screen size of given device.
 */
const getDeviceScreenSize = device => {
	if (device.screen_size.length) {
		return device.screen_size;
	}
	const regex = /\s([0-9]+)(\.[0-9]+)?[\-|\.|"|\s?inche?s?]/g;
	const match = regex.exec(device.name);
	if (match && match[1]) {
		return match[1];
	}
	return '';
};

/**
 * Shared devices normalizations.
 */
const commonDeviceNormalization = (device, source) => {
	const normalizedDevice = {};

	// Normalize keys.
	Object.keys(device).forEach(rawKey => {
		const key = substitutions[source]['keys'][rawKey] || rawKey;
		if (devicesKeys.includes(key)) {
			normalizedDevice[key] = `${device[rawKey] || ''}`.trim();
		}
	});

	// Make sure we're not missing any key + filter out any "N/A" value.
	devicesKeys.forEach(key => {
		if (!(key in normalizedDevice) || normalizedDevice[key] === 'N/A') {
			normalizedDevice[key] = '';
		}
	});

	// Normalize subcategories.
	normalizedDevice.subcategory = slugify(normalizedDevice.subcategory, { separator: '_' });
	Object.keys(substitutions[source]['subcategories']).forEach(oldCat => {
		if (normalizedDevice.subcategory === oldCat) {
			normalizedDevice.subcategory = substitutions[source]['subcategories'][oldCat];
		}
	});

	// Determine screensize (if applicable).
	if (!normalizedDevice.screen_size.length) {
		normalizedDevice.screen_size = getDeviceScreenSize(normalizedDevice);
	}

	// The order of keys must be the same for the props2Arr() function to work.
	// @see scripts/experiments/ecometrics/extract.js
	return sortObjectKeys(normalizedDevice, devicesKeys);
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
	const keys = rawKeys.map(rawKey => substitutions['boavizta']['keys'][rawKey] || rawKey)
		.filter(key => devicesKeys.includes(key));

	// Transform column names in a key/value object.
	colNames.forEach((colName, i) => {
		const key = substitutions['boavizta']['keys'][rawKeys[i]];
		if (devicesKeys.includes(key)) {
			output.devicesColNames[key] = colName;
		}
	});

	// Transform CSV line items from linear arrays of values to key/value objects.
	input = input.map(csvLine => arr2Props(csvLine, rawKeys));

	// Filter out the keys we won't use in the "Ecometrics" experiment.
	// Make sure we have the correct number of keys.
	input.forEach((device, i) => {
		output.boaviztaDevices[i] = commonDeviceNormalization(device, 'boavizta');
	});

	return output;
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
		const normalizedDevice = commonDeviceNormalization(device, 'ecodiag');

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

	const deviceFingerprints = Object.keys(dedup);
	deviceFingerprints.sort();

	const sortedDevices = [];
	deviceFingerprints.forEach((fingerprint, i) => {
		sortedDevices[i] = dedup[fingerprint];

		// If the items change place in the sorted array, the fingerprint will not
		// change. TODO evalute collision risk of truncating at 8 chars ?
		sortedDevices[i].id = `${cyrb53(fingerprint)}`.substring(0, 8);
	});

	data.devices = sortedDevices;
};

/**
 * Associates fallback values when some metrics are missing based on averages.
 */
const generateDevicesFallbackValues = data => {
	const incomplete = [];
	const averages = {};

	// In the absence of screen or screen size, devices names are considered
	// closest if they both contain these same words :
	const matchingWords = ['tower', 'station'];

	data.devices.forEach(device => {
		if (device.yearly_kwh.length && device.name.includes('average')) {
			if (!averages[device.subcategory]) {
				averages[device.subcategory] = [];
			}
			averages[device.subcategory].push(device);
		}
	});

	data.devices.map((device, i) => {
		if (device.yearly_kwh.length) {
			return;
		}

		// Look for matching Ecodiag "average devices" by subcategory and screen
		// size.
		if (device.subcategory in averages) {
			let noneMatched = true;
			const incompleteDeviceScreenSize = getDeviceScreenSize(device);

			averages[device.subcategory].forEach(averageDevice => {
				if (!incompleteDeviceScreenSize.length) {
					matchingWords.forEach(w => {
						if (device.name.toLowerCase().includes(w) && averageDevice.name.toLowerCase().includes(w)) {
							noneMatched = false;
							device.yearly_kwh = averageDevice.yearly_kwh;
							// Debug.
							// console.log("fallback: " + device.name + " -> " + averageDevice.name + `(${device.yearly_kwh})`);
						}
					});
				} else if (incompleteDeviceScreenSize === getDeviceScreenSize(averageDevice)) {
					device.yearly_kwh = averageDevice.yearly_kwh;
					// Debug.
					// console.log("fallback: " + device.name + " -> " + averageDevice.name + `(${device.yearly_kwh})`);
				}
			});

			// Last resort : use the first average device in same category.
			if (noneMatched) {
				device.yearly_kwh = averages[device.subcategory][0].yearly_kwh;

				// Debug.
				// console.log("fallback: " + device.name + " -> " + averages[device.subcategory][0].name + `(${device.yearly_kwh})`);
			}
		} else {
			// Debug.
			// console.log("no matching category for " + device.name);
			// console.log(device);

			// We're down to just 2 devices with no yearly power consumption
			// estimates : keyboard and mouse -> skip those for now.
			data.devices.splice(i, 1);
		}
	});
};

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

/**
 * Shared Carbon Intensity (CI) normalizations.
 */
const commonCINormalization = (ci, source) => {
	const normalizedCI = {};

	// Normalize keys.
	Object.keys(ci).forEach(rawKey => {
		const key = substitutions[source]['keys'][rawKey] || rawKey;
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

	// The order of keys must be the same for the props2Arr() function to work.
	// @see scripts/experiments/ecometrics/extract.js
	return sortObjectKeys(normalizedCI, carbonIntensityKeys);
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
		const key = substitutions['greenAlgorithms']['keys'][rawKeys[i]] || colName;
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
		output.greenAlgorithmsCI[i] = commonCINormalization(ci, 'greenAlgorithms');
	});

	return output;
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
			ci = commonCINormalization(ci, 'googleCloudPlatform');
			ci.source = "Google Cloud Platform";
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
							ci.city = '';
							ci.region = 'Iowa';
							break;
						case 'east1':
							ci.city = '';
							ci.region = 'South Carolina';
							ci.known_services = 'Gitlab';
							break;
						case 'east4':
							ci.city = '';
							ci.region = 'Northern Virginia';
							break;
						case 'west1':
							ci.city = '';
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
							ci.city = '';
							break;
						case 'west1':
							ci.country_code = 'BE';
							ci.country = "Belgium";
							ci.city = '';
							break;
						case 'west4':
							ci.country_code = 'NL';
							ci.country = "Netherlands";
							ci.city = '';
							break;
					}
					break;
			}
			return ci;
		})
	};
};

module.exports = {
	devicesKeys,
	devicesFromBoaviztaNormalizeAll,
	devicesFromEcodiagNormalizeAll,
	generateDevicesIds,
	generateDevicesFallbackValues,
	co2EqKeys,
	co2EqNormalizeItem,
	carbonIntensityKeys,
	greenAlgorithmsCINormalizeAll,
	googleCloudPlatformCINormalizeAll
};
