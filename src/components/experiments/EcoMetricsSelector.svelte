<script>
	import Select from 'svelte-select';
	import {
		deviceStore,
		selectionStore,
		locationEntityStore,
		serviceEntityStore
	} from '../../stores/ecometrics.js';
	import { preferencesStore } from '../../stores/preferences.js';
	import { getSelectedItemUseDefaultValue } from '../../lib/ecometrics/selection.js';
	import { getLocationLabel } from '../../lib/ecometrics/location.js';
	import { clearSelection, removeSelectedItem } from '../../lib/ecometrics/selection.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import Tooltip from '../Tooltip.svelte';
	import EcoMetricsShareLink from './EcoMetricsShareLink.svelte';
	import EcoMetricsSelectMain from './EcoMetricsSelectMain.svelte';

	let selectedLocation;
	let selectedDefaultLocation;
	let totalNbOfDevices = 0;
	let totalNbOfServices = 0;

	let regionTooltipId;
	let locationTooltipTrigger;
	let regionTooltipMethods;

	// Automatically update the totals whenever current selection changes.
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
	 * Populates the locations select options.
	 */
	const getLocationSelectOptions = locations => {
		const selectOptions = [];
		locations.forEach(location => {
			let label = getLocationLabel(location);
			selectOptions.push({ label, value: location.id, data: location });
		});
		selectOptions.sort((a, b) => a.label.localeCompare(b.label));
		return selectOptions;
	};

	/**
	 * Reacts to default location changes.
	 */
	const updateDefaultSelectedLocation = async () => {
		if (!selectedDefaultLocation) {
			return;
		}
		selectionStore.update(selection => {
			selection.defaultLocation = $locationEntityStore[selectedDefaultLocation.data.id];
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
				if (device.id === deviceToUpdate.id) {
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
			<EcoMetricsSelectMain />
		</div>


		<!-- TODO use the locationStore + new <Select> instance ? -->

		<div class="location">
			<p>
				🗺️ Default location :
				<button
					class="btn btn--s"
					bind:this={locationTooltipTrigger}
					aria-describedby={regionTooltipId}
					on:click|preventDefault={regionTooltipMethods.toggle}
					title="This will apply to all selected items, unless specified differently on each individual item below"
				>
					{ getLocationLabel($selectionStore.defaultLocation) }
				</button>
			</p>
			{#if locationTooltipTrigger}
				<Tooltip
					trigger={locationTooltipTrigger}
					bind:id={regionTooltipId}
					bind:exposedMethods={regionTooltipMethods}
				>
					<div class='location-select'>
						<Select items={getLocationSelectOptions(Object.values($locationEntityStore))}
							bind:selectedValue={selectedDefaultLocation}
							on:select={updateDefaultSelectedLocation}
							placeholder="Select the default location..."
						/>
					</div>
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
						<th>Type</th>
						<th>Name</th>
						<th>Quantity</th>
						<th class="u-center">Use</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each $selectionStore.devices as device, i}
						<tr>
							<td>
								<span class="type-icon" title="{ device.subcategory }">
									{@html (device.subcategory in $deviceStore.devicesIcons) ? $deviceStore.devicesIcons[device.subcategory] : $deviceStore.devicesIcons.box }
								</span>
							</td>
							<td>{ device.manufacturer } { device.name }</td>
							<td>
								<div class="nb--s">
									<input class="input--s" type="number" min="1" name="qty"
										value={ device.qty }
										on:change={ e => updateSelectedDevice(e, device) }
									/>
								</div>
							</td>


							<!-- TODO rwork the "use" column (diff service / device : separate <table>s ?) -->

							<td>
								{#if device.subcategory === 'server'}
									<div class="inner-form-item">
										<label for="deploys-per-month-{i}" title="on average, during the development phase of the project">Deploys per month</label>
										<input class="input--s" type="number" min="1" name="deploys_nb"
											id="deploys-per-month-{i}"
											value={ device.deploys_nb || getSelectedItemUseDefaultValue(device, 'deploys_nb') }
											on:change={ e => updateSelectedDevice(e, device) }
										/>
									</div>
									<div class="inner-form-item">
										<label for="deploys-duration-{i}" title="with CI tests">Average deploys duration (seconds)</label>
										<input class="input--s" type="number" min="1" name="deploys_duration"
											id="deploys-duration-{i}"
											value={ device.deploys_duration || getSelectedItemUseDefaultValue(device, 'deploys_duration') }
											on:change={ e => updateSelectedDevice(e, device) }
										/>
									</div>
									<div class="inner-form-item">
										<label for="backups-per-month-{i}" title="on average, during the development phase of the project">Backups per month</label>
										<input class="input--s" type="number" min="1" name="backups_nb"
											id="backups-per-month-{i}"
											value={ device.backups_nb || getSelectedItemUseDefaultValue(device, 'backups_nb') }
											on:change={ e => updateSelectedDevice(e, device) }
										/>
									</div>
									<div class="inner-form-item">
										<label for="backups-duration-{i}" title="with CI tests">Average backups duration (seconds)</label>
										<input class="input--s" type="number" min="1" name="backups_duration"
											id="backups-duration-{i}"
											value={ device.backups_duration || getSelectedItemUseDefaultValue(device, 'backups_duration') }
											on:change={ e => updateSelectedDevice(e, device) }
										/>
									</div>
								{/if}
								<div class="inner-form-item">
									<label for="hours-per-day-{i}">Average hours of use per day</label>
									<input class="input--s" type="number" min="1" name="hours"
										id="hours-per-day-{i}"
										value={ device.hours || getSelectedItemUseDefaultValue(device, 'hours') }
										on:change={ e => updateSelectedDevice(e, device) }
									/>
								</div>
							</td>


							<td>
								<button class="btn btn--s" on:click={ e => removeSelectedItem(e, device) }>Remove</button>
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
	.location-select {
		min-width: 33ch;
	}
</style>
