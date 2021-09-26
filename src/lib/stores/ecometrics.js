/**
 * @file
 * Contains shared "Ecometrics" experiment stores.
 */

import { writable } from 'svelte/store';

// TODO uniformize data structure (objects keyed by ID for all entities with ID)
export const deviceStore = writable({
	devices: [],
	devicesColNames: [],
	devicesIcons: {}
});

export const serviceStore = writable({
	services: {},
	servicesIcons: {}
});

export const co2EqStore = writable([]);
export const carbonIntensityStore = writable([]);
export const locationEntityStore = writable({});
export const totalsStore = writable({});

export const randomizedDeviceImgStore = writable([]);
export const clickedDeviceImgStore = writable({});

// Anytime the store changes, update the corresponding local storage value.
// See https://dev.to/danawoodman/svelte-quick-tip-connect-a-store-to-local-storage-4idi
let defaultSelectionStoreVal = {
	device: [],
	service: [],
	defaultLocation: false
};
const createBrowserSelectionStore = () => {
	const storedVal = localStorage.getItem('ecometricsSelectionV4');
	if (storedVal && storedVal.length) {
		defaultSelectionStoreVal = JSON.parse(storedVal);
	}
	const selectionStore = writable(defaultSelectionStoreVal);
	selectionStore.subscribe(selection => localStorage.setItem(
		'ecometricsSelectionV4',
		JSON.stringify(selection)
	));
	return selectionStore;
};
export const selectionStore = typeof localStorage === 'undefined'
  ? writable(defaultSelectionStoreVal)
  : createBrowserSelectionStore();
