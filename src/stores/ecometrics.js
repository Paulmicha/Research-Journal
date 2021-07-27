/**
 * @file
 * Contains shared "Ecometrics" experiment stores.
 */

import { writable } from 'svelte/store';

export const deviceStore = writable({
	"devices": [],
	"devicesColNames": [],
	// "devicesDistinctValues": {},
	"devicesIcons": {}
	// "devicesLowestKgCo2Value": 0,
	// "devicesHighestKgCo2Value": 0
});

// Anytime the store changes, update the corresponding local storage value.
// See https://dev.to/danawoodman/svelte-quick-tip-connect-a-store-to-local-storage-4idi
const createBrowserSelectedDeviceStore = () => {
	let defaultVal = [];
	const storedVal = localStorage.getItem('ecometricsSelection');
	if (storedVal && storedVal.length) {
		defaultVal = JSON.parse(storedVal);
	}
	const selectedDeviceStore = writable(defaultVal);
	selectedDeviceStore.subscribe(deviceList => localStorage.setItem(
		'ecometricsSelection',
		JSON.stringify(deviceList)
	));
	return selectedDeviceStore;
};
export const selectedDeviceStore = typeof localStorage === 'undefined'
  ? writable([])
  : createBrowserSelectedDeviceStore();

export const co2EqStore = writable([]);
export const selectedCo2EqStore = writable({});
export const totalsStore = writable({});

export const selectedMinMaxValues = writable({
	"lowestKgCo2Value": 999999,
	"highestKgCo2Value": 0
});
