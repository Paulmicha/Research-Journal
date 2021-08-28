<script>
	import Select from 'svelte-select';
	import { deviceStore, selectionStore, carbonIntensityStore } from '../../stores/ecometrics.js';
	import { preferencesStore } from '../../stores/preferences.js';
	import { getDeviceUseDefaultValue } from '../../lib/ecometrics/selection.js';
	import EcoMetricsShareLink from './EcoMetricsShareLink.svelte';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import Tooltip from '../Tooltip.svelte';

	let selectedItem;
	let selectOptions = [];
	let totalNbOfDevices = 0;
	let totalNbOfServices = 0;

	let regionTooltipId;
	let regionTooltipTrigger;
	let regionTooltipMethods;

	selectionStore.subscribe(selection => {
		if (selection.devices.length) {
			totalNbOfDevices = 0;
			selection.devices.forEach(device => {
				totalNbOfDevices += parseInt(device.qty);
			});
		}
		totalNbOfServices = selection.services.length;
	});

	/**
	 * Populates the multi-select field items.
	 */
	const getSelectOptions = sources => {
		sources.forEach(source => {
			let value = source[key];

			value = value.trim();
			if (!value.length) {
				return;
			}

			// Special : manufacturer will be concatenated with the source name.
			if ('manufacturer' in source && source.manufacturer.trim().length) {
				value = `${source.manufacturer.trim()} ${value}`;
			}
			// if ('category' in source && source.category.trim().length) {
			// 	value = `${value} (${source.category.trim()})`;
			// }

			// Remove special characters.
			// value = slugify(value, { lowercase: false, separator: ' ' });

			// TODO figure out simplest way to make this case insensitive.
			// const valCaseInsensitive = slugify(value, { separator: ' ' });

			// Format the displayed option text.
			// const label = `${value} <span style="color:grey">(${key.replaceAll('_', ' ')})</span>`;
			const label = value;

			// Other props not used by the Select component are kept in the bound
			// "selectedValue" -> attach our sources data to easily get it back
			// upon selection.
			// @see addSelectedDevice()
			selectOptions.push({ key, value, label, data: source });
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
		selectedItem = null;
	};

	/**
	 * Adds selected device (with quantity) to the list.
	 */
	const addSelectedDevice = async () => {
		// e.preventDefault();
		if (!selectedItem) {
			return;
		}

		selectionStore.update(selection => {
			selectedItem.pos = selection.devices.length;
			selectedItem.qty = quantity;
			selectedItem.deploys_nb = getDeviceUseDefaultValue(selectedItem, 'deploys_nb');
			selectedItem.deploys_duration = getDeviceUseDefaultValue(selectedItem, 'deploys_duration');
			selectedItem.backups_nb = getDeviceUseDefaultValue(selectedItem, 'backups_nb');
			selectedItem.backups_duration = getDeviceUseDefaultValue(selectedItem, 'backups_duration');
			selectedItem.hours = getDeviceUseDefaultValue(selectedItem, 'hours');
			selection.devices.push(selectedItem);
			return selection;
		});

		// TODO when this is called on:select on the <Select /> instance, the reset
		// will not work immediately. Find better workaround than delaying.
		// resetDeviceSelector();
		let failsafe = 99;
		while (selectedItem && failsafe > 0) {
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
		selectionStore.update(selection => {
			selection.devices.forEach((device, i) => {
				if (device.data.id === deviceToRemove.data.id) {
					selection.devices.splice(i, 1);
				}
			});
			// Update positions to maintain correct numbering of items in list.
			selection.devices = [...selection.devices];
			selection.devices.forEach((device, i) => {
				selection.devices[i].pos = i;
			});
			return selection;
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

		selectionStore.update(selection => {
			selection.devices.forEach((device, i) => {
				if (device.data.id === deviceToUpdate.data.id) {
					selection.devices[i].qty = newQty;
					selection.devices[i].hours = newHours;
					selection.devices[i].deploys_nb = newDeploysNb;
					selection.devices[i].deploys_duration = newDeploysDuration;
					selection.devices[i].backups_nb = newBackupsNb;
					selection.devices[i].backups_duration = newBackupsDuration;
				}
			});
			return selection;
		});

		e.target.blur();
	};

	/**
	 * Empties the whole list of selected devices.
	 */
	const clearSelection = e => {
		selectionStore.update(selection => {
			selection.devices = [];
			return selection;
		});
		resetDeviceSelector();
	};

	/**
	 * Toggles the collapsible selection list.
	 */
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
				bind:selectedValue={selectedItem}
				on:select={addSelectedDevice}
				placeholder="Search for devices to add to the list..."
			/>
		</div>
		<div class="location">
			<p>Default location: { $selectionStore.defaultLocation }</p>
			<button
				class="btn btn--s"
				bind:this={regionTooltipTrigger}
				aria-describedby={regionTooltipId}
				on:click|preventDefault={regionTooltipMethods.toggle}
				title="This will apply to all selected items, unless specified differently on each individual item below"
			>
				Location
			</button>
			{#if regionTooltipTrigger}
				<Tooltip
					trigger={regionTooltipTrigger}
					bind:id={regionTooltipId}
					bind:exposedMethods={regionTooltipMethods}
				>
					<p>test</p>
				</Tooltip>
			{/if}
		</div>
	</form>
{:else}
	<LoadingSpinner />
{/if}

{#if $selectionStore.devices.length}
	<details open={$preferencesStore.ecometricsDeviceSelectionListState}>
		<summary on:click={e => toggleEcometricsDeviceSelectionListState(e)}>
			Selection{ $selectionStore.devices.length ? ` (${totalNbOfDevices} devices)` : '' }
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
					{#each $selectionStore.devices as device, i}
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
									<!--
										TODO region selector.
										make a modal for each line, not just servers + distinguish
										datacenters from electricity grid carbon instensity.
									-->
									<div class="inner-form-item">
										<select>
											{#each $carbonIntensityStore as ci}
												<option>
													{ ci.country_code || '' }
													{ ci.continent || '' }
													{ ci.country || '' }
													{ ci.region || '' }
													{ ci.city || '' }
													{ ci.known_services ? '(' + ci.known_services + ')' : '' }
												</option>
											{/each}
										</select>
									</div>
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
				<EcoMetricsShareLink />
			</div>
		</form>
	</details>
{:else}
	<p>↑ Please select one or more devices.</p>
{/if}

<style>
	.selector {
		/* display: flex;
		justify-items: center;
		align-items: center; */
		margin-top: calc(var(--space) / 2);
		margin-bottom: var(--space);
	}
	/* .select {
		flex-grow: 1;
	} */
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
