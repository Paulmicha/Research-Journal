<script>
	import Select from 'svelte-select';
	import { deviceStore, filteredDeviceStore, selectedDeviceStore } from '../../stores/ecometrics.js';

	// TODO rework data model to accomodate other sources.
	// @see scripts/experiments/ecometrics/fetch.sh
	// @see scripts/experiments/ecometrics/extract.js
	let initialDevices = [];
	deviceStore.subscribe(storedDevices => {
		if ('rows' in storedDevices && storedDevices.rows.length) {
			storedDevices.rows.forEach(row => {
				const device = {};
				row.forEach(kv => device[kv.key] = kv.val || '');
				initialDevices.push(device);
			});
			filteredDeviceStore.set(initialDevices);
		}
	});

	// Define the search filters by "keys" (the rows' columns).
	// @see static/data/ecometrics.json
	// @see static/data/ecometrics.sqlite (alternative impl. to compare later on)
	// ["manufacturer","name","category","subcategory","kg_co_2eq_total","use","yearly_tec_k_wh","lifetime","use_location","date","sources","error","manufacturing","weight","assembly_location","screen_size","server_type","hdd_ssd","ram","cpu","u"]
	let activeFilters;
	let selectOptions = [];
	const searchKeys = ['name'];
	let filterOp = 'or';

	/**
	 * Populates the multi-select field items.
	 */
	const getSelectOptions = devices => {
		devices.forEach(device => {
			searchKeys.forEach(key => {
				if (key in device) {
					let value = device[key];

					value = value.trim();
					if (!value.length) {
						return;
					}

					// Special : manufacturer will be concatenated with the device name.
					if (key === 'name') {
						if ('manufacturer' in device && device.manufacturer.trim().length) {
							value = `${device.manufacturer.trim()} ${value}`;
						}
						// if ('category' in device && device.category.trim().length) {
						// 	value = `${value} (${device.category.trim()})`;
						// }
					}

					// Remove special characters.
					// value = slugify(value, { lowercase: false, separator: ' ' });

					// TODO figure out simplest way to make this case insensitive.
					// const valCaseInsensitive = slugify(value, { separator: ' ' });

					// Format the displayed option text.
					// const label = `${value} <span style="color:grey">(${key.replaceAll('_', ' ')})</span>`;
					const label = value;

					selectOptions.push({ key, value, label });
				}
			});
		});

		// Remove duplicates.
		let seen = {};
		const dedup = selectOptions.filter(item =>
			seen.hasOwnProperty(item.label) ? false : (seen[item.label] = true)
		);

		// Sort alphabetically.
		dedup.sort((a, b) => a.label.localeCompare(b.label));

		return dedup;
	};


	/**
	 * Filters results based on the multi-select field current selection.
	 */
	 const applyFilter = () => {
		if (!activeFilters) {
			clearFilters();
			return;
		}
		switch (filterOp) {
			case 'and':
				applyFilterAnd();
				break;
			case 'or':
				applyFilterOr();
				break;
		}
	};

	/**
	 * Applies "and" filtering for the multi-select field.
	 */
	const applyFilterAnd = () => {
		filteredDeviceStore.update(currentResults => {
			let newResults = [];

			for (let i = 0; i < initialDevices.length; i++) {
				const result = initialDevices[i];
				let allFilterValuesMatch = true;

				// If we use the <Select> component for a single value, activeFilters
				// will not be an array.
				if (!Array.isArray(activeFilters)) {
					activeFilters = [activeFilters];
				}

				activeFilters.forEach(activeFilter => {
					// TODO [evol] make this thing more generic : deal with keys that
					// contain arrays.
					// if (activeFilter.key === 'reactions' && 'reactions' in result && result.reactions.length) {
					// 	let noneMatches = true;
					// 	result.reactions.forEach(reaction => {
					// 		if (reaction.name === activeFilter.value) {
					// 			noneMatches = false;
					// 		}
					// 	});
					// 	if (noneMatches) {
					// 		allFilterValuesMatch = false;
					// 	}
					// } else
					if (!(activeFilter.key in result) || !result[activeFilter.key].includes(activeFilter.value)) {
						allFilterValuesMatch = false;
					}
				});

				if (allFilterValuesMatch) {
					newResults.push(result);
				}
			}

			return newResults;
		});
	};

	/**
	 * Applies "or" filtering for the multi-select field.
	 */
	const applyFilterOr = () => {
		filteredDeviceStore.update(currentResults => {
			let newResults = [];

			for (let i = 0; i < initialDevices.length; i++) {
				const result = initialDevices[i];
				let anyFilterValueMatches = false;

				// If we use the <Select> component for a single value, activeFilters
				// will not be an array.
				if (!Array.isArray(activeFilters)) {
					activeFilters = [activeFilters];
				}

				activeFilters.forEach(activeFilter => {
					// TODO [evol] make this thing more generic : deal with keys that
					// contain arrays.
					// if (activeFilter.key === 'reactions' && 'reactions' in result && result.reactions.length) {
					// 	result.reactions.forEach(reaction => {
					// 		if (reaction.name === activeFilter.value) {
					// 			anyFilterValueMatches = true;
					// 		}
					// 	});
					// } else
					if (activeFilter.key in result && result[activeFilter.key].includes(activeFilter.value)) {
						anyFilterValueMatches = true;
					}
				});

				if (anyFilterValueMatches) {
					newResults.push(result);
				}
			}

			return newResults;
		});
	};

	/**
	 * Resets selection to initial options.
	 */
  const clearFilters = () => {
		filteredDeviceStore.set(initialDevices);
	};

	/**
	 * Adds selected device.
	 *
	 * TODO remove the results we don't use.
	 */
	const addSelectedDevice = e => {
		selectedDeviceStore.update(selectedDevices => {
			if (!Array.isArray(activeFilters)) {
				activeFilters = [activeFilters];
			}
			activeFilters.forEach(activeFilter => {
				selectedDevices.push(activeFilter);
			});
		});
		e.preventDefault();
	};

</script>

{#if $deviceStore.rows.length}
	<p>Please select one or more devices :</p>
	<form>
		<div class="select">
			<Select items={getSelectOptions($filteredDeviceStore)}
				on:select={applyFilter}
				on:clear={clearFilters}
				bind:selectedValue={activeFilters}
				placeholder="Search here to add device to the list"
			/>
		</div>
		<div>
			&times;
		</div>
		<div class="nb">
			<input type="number" value="1" />
		</div>
		<div>
			<button class="btn" on:click={addSelectedDevice}>Add</button>
		</div>
		<!-- <div>
			<div class="radio">
				<input type="radio" id="filter-op-or" name="filter-op" value="or"
					bind:group={filterOp}
					on:change={applyFilter}
					/>
				<label for="filter-op-or">Or</label>
			</div>
			<div class="radio">
				<input type="radio" id="filter-op-and" name="filter-op" value="and"
					bind:group={filterOp}
					on:change={applyFilter}
					/>
				<label for="filter-op-and">And</label>
			</div>
		</div> -->
	</form>
{/if}

{#if $selectedDeviceStore.length}
	{#each $selectedDeviceStore as selectedDevice}
		<p>{ selectedDevice }</p>
	{/each}
{/if}

<style>
	form {
		display: flex;
		justify-items: center;
		align-items: center;
		margin-top: calc(var(--space) / 2);
	}
	form > * + * {
		padding-left: var(--space-s);
	}
	.select {
		flex-grow: 1;
	}
	.nb {
		width: 5rem;
	}
	.nb > input {
		min-width: 4rem;
	}
	/* .u-fs-s {
		font-size: .75rem;
	} */
	/* .u-fs-m {
		font-size: 1.15rem;
	} */
	/* .radio,
	.radio > * {
		cursor: pointer;
	}
	.radio {
		display: flex;
	}
	.radio label {
		padding-left: var(--space-s);
	}
	.radio label:hover {
		text-decoration: underline;
	} */
</style>
