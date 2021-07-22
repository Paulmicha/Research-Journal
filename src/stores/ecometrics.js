/**
 * @file
 * Contains shared "Ecometrics" experiment stores.
 */

// import { writable, derived } from 'svelte/store';
import { writable } from 'svelte/store';

export const deviceStore = writable({
	"devices": [],
	"devicesColNames": []
});

// Make the selection options initially the same as the whole dataset. The
// available options will be reduced when users apply filters to select their
// list of devices.
// Update : either use https://github.com/PixievoltNo1/svelte-writable-derived
// or make more "atomic" writable stores. Let's try the latter first.
// export const selectionStore = derived(
// 	deviceStore,
// 	$deviceStore => {
// 		const options = [];
// 		$deviceStore.rows.forEach(row => {
// 			const option = {};
// 			row.forEach(kv => option[kv.key] = kv.val || '');
// 			options.push(option);
// 		});
// 		return { options };
// 	}
// );

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
