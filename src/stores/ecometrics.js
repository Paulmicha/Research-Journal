/**
 * @file
 * Contains shared "Ecometrics" experiment stores.
 */

import { writable, derived } from 'svelte/store';

export const deviceStore = writable({
	"rows": [],
	"colNames": []
});

// Make the selection options initially the same as the whole dataset. The
// available options will be reduced when users apply filters to select their
// list of devices.
export const selectionStore = derived(
	deviceStore,
	$deviceStore => {
		const options = [];
		$deviceStore.rows.forEach(row => {
			const option = {};
			row.forEach(kv => option[kv.key] = kv.val || '');
			options.push(option);
		})
		return { options };
	}
);
