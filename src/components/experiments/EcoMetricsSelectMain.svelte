<script>
	import { createEventDispatcher } from 'svelte';
	import Select from 'svelte-select';
	import { deviceStore, serviceStore } from '../../stores/ecometrics.js';
	import { addSelectedItem } from '../../lib/ecometrics/selection.js';

	let selectedValue;
	const dispatch = createEventDispatcher();

	/**
	 * Populates the main select options.
	 */
	const getSelectOptions = sources => {
		const selectOptions = [];
		sources.forEach(source => {
			let label = source.name;
			// For devices, 'manufacturer' will be concatenated with the 'name'.
			if ('manufacturer' in source && source.manufacturer.length) {
				label = `${source.manufacturer} ${label}`;
			}
			// Other props not used by the Select component are kept in the bound
			// "selectedValue" -> attach our sources data to easily get it back
			// upon selection.
			// @see addSelectedItem()
			selectOptions.push({ label, data: source });
		});
		// Sort alphabetically.
		selectOptions.sort((a, b) => a.label.localeCompare(b.label));
		return selectOptions;
	};

	/**
	 * Reacts to selection being made.
	 *
	 * @param {Object} option : selected option, see getSelectOptions().
	 */
	const selectionIsMade = async option => {
		addSelectedItem(option.data);
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
	items={getSelectOptions([
		...$deviceStore.devices,
		...Object.values($serviceStore.services)
	])}
	on:select={e => selectionIsMade(e.detail)}
	placeholder="Search for devices or services to add to the list..."
	bind:selectedValue={selectedValue}
/>
