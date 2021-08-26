<script>
	import Select from 'svelte-select';
	import { route } from '../../stores/route.js';
	import { deviceStore, selectedDeviceStore } from '../../stores/ecometrics.js';
	import { preferencesStore } from '../../stores/preferences.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import SidePanel from '../SidePanel.svelte';

	// Sharing link reacts to current selection store.
	let totalNbOfDevices = 0;
	let shareLink = '';
	let shareableLinkInput;
	let toasterMethods;

	const oneLetterPropMap = {
		qty: 'q',
		deploys_nb: 'd',
		deploys_duration: 'u',
		backups_nb: 'b',
		backups_duration: 'r',
		hours: 'h'
	};

	selectedDeviceStore.subscribe(selectedDevices => {
		if (selectedDevices.length) {
			const parts = [];
			totalNbOfDevices = 0;

			// TODO reverse proxy... ?
			// shareLink = 'http://' + $route.host + '/' + $route.path + '?s=';
			shareLink = 'https://msc.paulmichalet.com/' + $route.path + '?s=';

			selectedDevices.forEach(device => {
				const subParts = [];
				Object.keys(oneLetterPropMap).forEach(k => subParts.push(
					oneLetterPropMap[k] + device[k]
				));
				parts.push(`${device.data.id}:${subParts.join(':')}`);
				totalNbOfDevices += parseInt(device.qty);
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
			toasterMethods.open();
			setTimeout(toasterMethods.close, 3000);
    } catch (err) {
			alert('Something prevents the "copy" action. You will need to copy the link manually.');
			shareableLinkInput.classList.remove('u-sr-only');
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
	 * Gets use stats defaults per device.
	 */
	const getDeviceUseDefaultValue = (device, use) => {
		switch (use) {
			case "hours":
				switch (device.data.subcategory) {
					case 'router':
					case 'server':
						return 24;
					case 'smartphone':
						return 2;
					case 'ipphone':
						return 1;
					default:
						return 6;
				}
			case "deploys_nb":
				if (device.data.subcategory !== 'server') {
					return 0;
				}
				return 4;
			case "deploys_duration":
				if (device.data.subcategory !== 'server') {
					return 0;
				}
				return 120;
			case "backups_nb":
			case "backups_duration":
				return 0;
		}
		return 6;
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
			selectedDevice.deploys_nb = getDeviceUseDefaultValue(selectedDevice, 'deploys_nb');
			selectedDevice.deploys_duration = getDeviceUseDefaultValue(selectedDevice, 'deploys_duration');
			selectedDevice.backups_nb = getDeviceUseDefaultValue(selectedDevice, 'backups_nb');
			selectedDevice.backups_duration = getDeviceUseDefaultValue(selectedDevice, 'backups_duration');
			selectedDevice.hours = getDeviceUseDefaultValue(selectedDevice, 'hours');
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

		const scope = e.target.closest('tr');
		const newQty = scope.querySelector('input[name="qty"]').value;
		const newHours = scope.querySelector('input[name="hours"]').value;
		const newDeploysNb = scope.querySelector('input[name="deploys_nb"]').value;
		const newDeploysDuration = scope.querySelector('input[name="deploys_duration"]').value;
		const newBackupsNb = scope.querySelector('input[name="backups_nb"]').value;
		const newBackupsDuration = scope.querySelector('input[name="backups_duration"]').value;

		selectedDeviceStore.update(selectedDevices => {
			selectedDevices.forEach((device, i) => {
				if (device.data.id === deviceToUpdate.data.id) {
					selectedDevices[i].qty = newQty;
					selectedDevices[i].hours = newHours;
					selectedDevices[i].deploys_nb = newDeploysNb;
					selectedDevices[i].deploys_duration = newDeploysDuration;
					selectedDevices[i].backups_nb = newBackupsNb;
					selectedDevices[i].backups_duration = newBackupsDuration;
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

	const toggleEcometricsDeviceSelectionListState = e => {
		e.preventDefault();
		preferencesStore.update(prefs => {
			prefs.ecometricsDeviceSelectionListState = !prefs.ecometricsDeviceSelectionListState;
			return prefs;
		});
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
	<details open={$preferencesStore.ecometricsDeviceSelectionListState}>
		<summary on:click={e => toggleEcometricsDeviceSelectionListState(e)}>
			Selection{ $selectedDeviceStore.length ? ` (${totalNbOfDevices} devices)` : '' }
		</summary>
		<form class="full-vw">
			<table class="selection">
				<thead>
					<tr>
						<!-- <th>#</th> -->
						<!-- <th>ID</th> -->
						<th>Type</th>
						<th>Name</th>
						<th>Quantity</th>
						<!-- <th>Age (years)</th> -->
						<!-- <th>Screen size</th> -->
						<th class="u-center">Use</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each $selectedDeviceStore as device, i}
						<tr>
							<!-- <td>{ device.pos }</td> -->
							<!-- <td>{ device.data.id }</td> -->
							<td>
								<span class="type-icon" title="{ device.data.subcategory }">
									{@html (device.data.subcategory in $deviceStore.devicesIcons) ? $deviceStore.devicesIcons[device.data.subcategory] : $deviceStore.devicesIcons.box }
								</span>
							</td>
							<td>{ device.data.manufacturer } { device.data.name }</td>
							<td>
								<div class="nb--s">
									<input class="input--s" type="number" min="1" name="qty"
										value={ device.qty }
										on:change={ e => updateSelectedDevice(e, device) }
									/>
								</div>
							</td>
							<!-- <td>
								<div class="nb--s">
									<input class="input--s" type="number" min="0" name="age"
										value={ device.age || device.data.age }
										on:change={ e => updateSelectedDevice(e, device) }
										/>
								</div>
							</td> -->
							<!-- <td>{ device.data.screen_size }</td> -->
							<td>
								{#if device.data.subcategory === 'server'}
									<div class="inner-form-item">
										<label for="deploys-per-month-{i}" title="on average, during the development phase of the project">Deploys per month</label>
										<input class="input--s" type="number" min="1" name="deploys_nb"
											id="deploys-per-month-{i}"
											value={ device.deploys_nb || getDeviceUseDefaultValue(device, 'deploys_nb') }
											on:change={ e => updateSelectedDevice(e, device) }
										/>
									</div>
									<div class="inner-form-item">
										<label for="deploys-duration-{i}" title="with CI tests">Average deploys duration (seconds)</label>
										<input class="input--s" type="number" min="1" name="deploys_duration"
											id="deploys-duration-{i}"
											value={ device.deploys_duration || getDeviceUseDefaultValue(device, 'deploys_duration') }
											on:change={ e => updateSelectedDevice(e, device) }
										/>
									</div>
									<div class="inner-form-item">
										<label for="backups-per-month-{i}" title="on average, during the development phase of the project">Backups per month</label>
										<input class="input--s" type="number" min="1" name="backups_nb"
											id="backups-per-month-{i}"
											value={ device.backups_nb || getDeviceUseDefaultValue(device, 'backups_nb') }
											on:change={ e => updateSelectedDevice(e, device) }
										/>
									</div>
									<div class="inner-form-item">
										<label for="backups-duration-{i}" title="with CI tests">Average backups duration (seconds)</label>
										<input class="input--s" type="number" min="1" name="backups_duration"
											id="backups-duration-{i}"
											value={ device.backups_duration || getDeviceUseDefaultValue(device, 'backups_duration') }
											on:change={ e => updateSelectedDevice(e, device) }
										/>
									</div>
								{/if}
								<div class="inner-form-item">
									<label for="hours-per-day-{i}">Average hours of use per day</label>
									<input class="input--s" type="number" min="1" name="hours"
										id="hours-per-day-{i}"
										value={ device.hours || getDeviceUseDefaultValue(device, 'hours') }
										on:change={ e => updateSelectedDevice(e, device) }
									/>
								</div>
							</td>
							<td>
								<button class="btn btn--s" on:click={ e => removeSelectedDevice(e, device) }>Remove</button>
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
	</details>

	<SidePanel bind:exposedMethods={toasterMethods} id="toaster" dir="btt" bg="mediumseagreen">
		<div class="u-center">
			<strong>Link copied to clipboard.</strong>
		</div>
	</SidePanel>

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
	.type-icon {
		display: inline-block;
		vertical-align: middle;
		width: 2em;
		height: 2em;
	}
	:global(.type-icon > svg) {
		display: inline-block;
		margin: -10%;
		width: 120%;
		height: 120%;
	}
	.nb--s > input,
	.inner-form-item > .input--s {
		width: 3.3rem;
	}
	.selection {
		margin: 0 auto var(--space-l) auto;
	}
	.selection td,
	.selection th {
		padding: calc(var(--space-s) / 2) var(--space-s);
	}
	.inner-form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.inner-form-item > label {
		display: inline-block;
		margin-left: auto;
		margin-right: var(--space-s);
		font-size: 80%;
		/* white-space: nowrap; */
		text-align: right;
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
