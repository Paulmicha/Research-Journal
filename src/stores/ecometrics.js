/**
 * @file
 * Contains shared "Ecometrics" experiment stores.
 */

import { writable } from 'svelte/store';

export const deviceStore = writable({
	"devices": [],
	"devicesColNames": []
});

// Update : only use the select to add devices to list (not for filtering rows).
// export const filteredDeviceStore = writable([]);
export const deviceHashTableStore = writable([]);

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
