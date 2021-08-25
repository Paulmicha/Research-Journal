/**
 * @file
 * Contains generic stores for local preference / settings.
 */

import { writable } from 'svelte/store';

// Anytime the store changes, update the corresponding local storage value.
// See https://dev.to/danawoodman/svelte-quick-tip-connect-a-store-to-local-storage-4idi
const createPreferencesStore = () => {
	let defaultVal = { ecometricsDeviceSelectionListState: true };
	const storedVal = localStorage.getItem('preferences');
	if (storedVal && storedVal.length) {
		defaultVal = JSON.parse(storedVal);
	}
	const preferencesStore = writable(defaultVal);
	preferencesStore.subscribe(deviceList => localStorage.setItem(
		'preferences',
		JSON.stringify(deviceList)
	));
	return preferencesStore;
};
export const preferencesStore = typeof localStorage === 'undefined'
  ? writable([])
  : createPreferencesStore();
