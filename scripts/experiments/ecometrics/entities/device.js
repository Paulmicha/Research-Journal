/**
 * @file
 * Loosely defines our main entities for the Ecometrics experiment.
 */

const slugify = require('@sindresorhus/slugify');
const { sortObjectKeys, cyrb53 } = require('../utils');

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
const getFingerPrint = device => slugify(
	`${device.manufacturer} ${device.subcategory} ${device.name}`,
	{ separator: '_' }
);

/**
 * Determines the screen size of given device.
 */
const getScreenSize = device => {
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
const commonDeviceNormalization = (device, substitutions) => {
	const normalizedDevice = {};

	// Normalize keys.
	Object.keys(device).forEach(rawKey => {
		const key = substitutions['keys'][rawKey] || rawKey;
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
	Object.keys(substitutions['subcategories']).forEach(oldCat => {
		if (normalizedDevice.subcategory === oldCat) {
			normalizedDevice.subcategory = substitutions['subcategories'][oldCat];
		}
	});

	// Determine screensize (if applicable).
	if (!normalizedDevice.screen_size.length) {
		normalizedDevice.screen_size = getScreenSize(normalizedDevice);
	}

	// The order of keys must be the same for the props2Arr() function to work.
	// @see scripts/experiments/ecometrics/extract.js
	return sortObjectKeys(normalizedDevice, devicesKeys);
};

/**
* Generates unique numerical device IDs.
*
* @see getFingerPrint()
*
* @param {Object} data : whole ecometrics dataset, where data.devices contains
*   the list of every aggregated devices' objects.
*/
const generateDevicesIds = data => {
	// Associates fingerprints to every data.devices, drop the ones which don't
	// have enough data to get one (presumably inexploitable).
	data.devices
		.map(device => device.fingerprint = getFingerPrint(device))
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
			const incompleteDeviceScreenSize = getScreenSize(device);

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
				} else if (incompleteDeviceScreenSize === getScreenSize(averageDevice)) {
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

module.exports = {
	devicesKeys,
	commonDeviceNormalization,
	generateDevicesIds,
	generateDevicesFallbackValues
};
