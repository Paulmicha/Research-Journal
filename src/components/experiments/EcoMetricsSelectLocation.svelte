<script>
	import { createEventDispatcher } from 'svelte';
	import Select from 'svelte-select';
	import { locationEntityStore } from '../../stores/ecometrics.js';
	import { getLocationLabel } from '../../lib/ecometrics/location.js';

	let selectedValue;
	const dispatch = createEventDispatcher();

	/**
	 * Populates the location select options.
	 */
	const getSelectOptions = locations => {
		const selectOptions = [];
		locations.forEach(location => {
			selectOptions.push({
				label: getLocationLabel(location),
				value: location.id,
				data: location
			});
		});
		selectOptions.sort((a, b) => a.label.localeCompare(b.label));
		return selectOptions;
	};

	/**
	 * Reacts to selection being made.
	 *
	 * @param {Object} option : selected option, see getSelectOptions().
	 */
	const selectionIsMade = async option => {
		dispatch('select', { entity: option.data });

		// TODO when this is called on:select on the <Select /> instance, the reset
		// will not work immediately -> find better workaround than delaying.
		let failsafe = 99;
		while (selectedValue && failsafe > 0) {
			await new Promise(resolve => setTimeout(() => {
				selectedValue = null;
				resolve();
			}, 150));
			failsafe--;
		}
	};
</script>

<Select
	items={getSelectOptions(Object.values($locationEntityStore))}
	on:select={e => selectionIsMade(e.detail)}
	placeholder="Search and select new location..."
	bind:selectedValue={selectedValue}
/>
