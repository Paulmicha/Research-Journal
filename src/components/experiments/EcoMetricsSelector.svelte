<script>
	import Select from 'svelte-select';
	import { deviceStore, deviceHashTableStore, selectedDeviceStore } from '../../stores/ecometrics.js';

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
			deviceHashTableStore.set(initialDevices);
		}
	});

	// Define the search filters by "keys" (the rows' columns).
	// @see static/data/ecometrics.json
	// @see static/data/ecometrics.sqlite (alternative impl. to compare later on)
	// ["manufacturer","name","category","subcategory","kg_co_2eq_total","use","yearly_tec_k_wh","lifetime","use_location","date","sources","error","manufacturing","weight","assembly_location","screen_size","server_type","hdd_ssd","ram","cpu","u"]
	let selectedDevice;
	let selectOptions = [];
	const searchKeys = ['name'];

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

					selectOptions.push({ key, value, label, device });
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
	 * Adds selected device.
	 *
	 * TODO remove the results we don't use.
	 */
	const addSelectedDevice = e => {
		if (!selectedDevice) {
			e.preventDefault();
			return;
		}
		selectedDeviceStore.update(selectedDevices => {
			selectedDevices.push(selectedDevice);
			return selectedDevices;
		});
		e.preventDefault();
	};

</script>

{#if $deviceStore.rows.length}
	<p>Please select one or more devices :</p>
	<form>
		<div class="select">
			<Select items={getSelectOptions($deviceHashTableStore)}
				bind:selectedValue={selectedDevice}
				placeholder="Search for devices to add to the list..."
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
	</form>
{/if}

{#if $selectedDeviceStore.length}
	{#each $selectedDeviceStore as selectedDevice}
		<p>{ JSON.stringify(selectedDevice, ' ', 2) }</p>
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
</style>
