<script>
	import Select from 'svelte-select';
	import { route } from '../../stores/route.js';
	import { deviceStore, selectedDeviceStore } from '../../stores/ecometrics.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';

	// Sharing link reacts to current selection store.
	let shareLink = '';
	let shareableLinkInput;

	selectedDeviceStore.subscribe(selectedDevices => {
		if (selectedDevices.length) {
			const parts = [];
			shareLink = 'http://' + $route.host + '/' + $route.path + '?s=';

			selectedDevices.forEach(device => {
				parts.push(`${device.data.id}:q${device.qty}:a${device.age || device.data.age}`);
			});

			shareLink += parts.join(',');
		}
	});

	/**
	 * Copy shareable link button click handler.
	 */
	const copyShareableLink = e => {
		e.preventDefault();
		shareableLinkInput.focus();
    shareableLinkInput.select();
    try {
      document.execCommand('copy');
    } catch (err) {
			alert('Error : you will need to copy the link manually.');
		}
	};

	// Define the search filters by "keys" (the rows' columns).
	// @see static/data/ecometrics.json
	// @see static/data/ecometrics.sqlite (alternative impl. to compare later on)
	// ["manufacturer","name","category","subcategory","kg_co_2eq_total","use","yearly_tec_k_wh","lifetime","use_location","date","sources","error","manufacturing","weight","assembly_location","screen_size","server_type","hdd_ssd","ram","cpu","u"]
	let selectedDevice;
	let selectOptions = [];
	const searchKeys = ['name'];

	// TODO deprecated (not needed anymore since the removal of input + btn "add").
	// Contains the current quantity value once the selection is made when adding
	// to the list of selected devices.
	let quantity = 1;

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

					// Other props not used by the Select component are kept in the bound
					// "selectedValue" -> attach our devices data to easily get it back
					// upon selection.
					// @see addSelectedDevice()
					selectOptions.push({ key, value, label, data: device });
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
	 * Resets the "device add" selector.
	 */
	const resetDeviceSelector = () => {
		quantity = 1;
		selectedDevice = null;
	};

	/**
	 * Adds selected device (with quantity) to the list.
	 */
	const addSelectedDevice = async () => {
		// e.preventDefault();
		if (!selectedDevice) {
			return;
		}

		selectedDeviceStore.update(selectedDevices => {
			selectedDevice.pos = selectedDevices.length;
			selectedDevice.qty = quantity;
			selectedDevices.push(selectedDevice);
			return selectedDevices;
		});

		// TODO when this is called on:select on the <Select /> instance, the reset
		// will not work immediately. Find better workaround than delaying.
		// resetDeviceSelector();
		let failsafe = 99;
		while (selectedDevice && failsafe > 0) {
			await new Promise(resolve => setTimeout(resetDeviceSelector, 150));
			failsafe--;
		}

		// e.target.blur();
	};

	/**
	 * Removes selected device from the list.
	 */
	const removeSelectedDevice = (e, deviceToRemove) => {
		e.preventDefault();
		selectedDeviceStore.update(selectedDevices => {
			selectedDevices.forEach((device, i) => {
				if (device.data.id === deviceToRemove.data.id) {
					selectedDevices.splice(i, 1);
				}
			});
			// Update positions to maintain correct numbering of items in list.
			selectedDevices = [...selectedDevices];
			selectedDevices.forEach((device, i) => {
				selectedDevices[i].pos = i;
			});
			return selectedDevices;
		});
	};

	/**
	 * Updates selected device.
	 */
	const updateSelectedDevice = (e, deviceToUpdate) => {
		e.preventDefault();

		// Get the new values.
		const scope = e.target.closest('tr');
		const newAge = scope.querySelector('input[name="age"]').value;
		const newQty = scope.querySelector('input[name="qty"]').value;

		selectedDeviceStore.update(selectedDevices => {
			selectedDevices.forEach((device, i) => {
				if (device.data.id === deviceToUpdate.data.id) {
					// Apply Changes.
					selectedDevices[i].qty = newQty;
					selectedDevices[i].age = newAge;
				}
			});
			return selectedDevices;
		});

		e.target.blur();
	};

	/**
	 * Empties the whole list of selected devices.
	 */
	const clearSelection = e => {
		selectedDeviceStore.set([]);
		resetDeviceSelector();
	};

</script>

{#if $deviceStore.devices.length}
	<form class="selector">
		<div class="select">
			<Select items={getSelectOptions($deviceStore.devices)}
				bind:selectedValue={selectedDevice}
				on:select={addSelectedDevice}
				placeholder="Search for devices to add to the list..."
			/>
		</div>
		<!-- <div>
			&times;
		</div>
		<div class="nb">
			<input type="number" min="1" bind:value={quantity} />
		</div>
		<div>
			<button class="btn" on:click={addSelectedDevice}>Add</button>
		</div> -->
	</form>
{:else}
	<LoadingSpinner />
{/if}

{#if $selectedDeviceStore.length}
	<form class="full-vw">
		<table class="selection">
			<thead>
				<tr>
					<!-- <th>#</th> -->
					<th>Device</th>
					<th>Quantity</th>
					<th>Age (years)</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each $selectedDeviceStore as device}
					<tr>
						<!-- <td>{ device.pos }</td> -->
						<td>{ device.data.manufacturer } { device.data.name }</td>
						<td>
							<div class="nb--s">
								<input class="input--s" type="number" min="1" name="qty"
									value={device.qty}
									on:change={e => updateSelectedDevice(e, device)}
									/>
							</div>
						</td>
						<td>
							<!-- { device.age || device.data.age } -->
							<div class="nb--s">
								<input class="input--s" type="number" min="0" name="age"
									value={device.age || device.data.age}
									on:change={e => updateSelectedDevice(e, device)}
									/>
							</div>
						</td>
						<td>
							<!-- <button class="btn btn--s" on:click={e => updateSelectedDevice(e, device)}>Update</button> -->
							<button class="btn btn--s" on:click={e => removeSelectedDevice(e, device)}>Remove</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="bottom-zone">
			<button class="btn btn--s" on:click={clearSelection}>Clear selection</button>
			<button class="btn btn--s"
				on:click={copyShareableLink}
				title="This link contains the current selection. Opening it will preset this page with this list."
			>
				Copy shareable link
			</button>
			(to send this list to someone)
			<input
				class="u-sr-only"
				type="text"
				aria-hidden="true"
				bind:this={shareableLinkInput}
				value="{shareLink}"
			/>
		</div>
	</form>
{:else}
	<p>↑ Please select one or more devices.</p>
{/if}

<style>
	.selector {
		display: flex;
		justify-items: center;
		align-items: center;
		margin-top: calc(var(--space) / 2);
		margin-bottom: var(--space);
	}
	.select {
		flex-grow: 1;
	}
	/* .selector > * + * {
		padding-left: var(--space-s);
	}
	.nb {
		width: 5rem;
	}
	.nb > input {
		width: 4rem;
	} */
	.nb--s > input {
		width: 3.3rem;
	}
	.selection {
		margin: 0 auto var(--space-l) auto;
	}
	.selection td,
	.selection th {
		padding: calc(var(--space-s) / 2) var(--space-s);
	}
	.bottom-zone {
		margin: var(--space-l);
		text-align: center;
	}
	.bottom-zone > * {
		display: inline-block;
		width: auto;
	}
</style>
