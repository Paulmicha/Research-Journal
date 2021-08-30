<script>
	import {
		deviceStore,
		selectionStore,
		locationEntityStore
	} from '../../stores/ecometrics.js';
	import { preferencesStore } from '../../stores/preferences.js';
	import { getLocationLabel } from '../../lib/ecometrics/location.js';
	import { clearSelection, removeSelectedItem, updateSelectedItem } from '../../lib/ecometrics/selection.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import Tooltip from '../Tooltip.svelte';
	import EcoMetricsShareLink from './EcoMetricsShareLink.svelte';
	import EcoMetricsSelectMain from './EcoMetricsSelectMain.svelte';
	import EcoMetricsSelectLocation from './EcoMetricsSelectLocation.svelte';
	import EcoMetricsSelectionSettings from './EcoMetricsSelectionSettings.svelte';

	let totalNbOfDevices = 0;
	let totalNbOfServices = 0;

	let locationTooltipTrigger;
	let regionTooltipMethods;

	// Automatically update the totals whenever current selection changes.
	selectionStore.subscribe(selection => {
		if (selection.device.length) {
			totalNbOfDevices = 0;
			selection.device.forEach(device => {
				totalNbOfDevices += parseInt(device.selectionSettings.qty);
			});
		}
		totalNbOfServices = selection.service.length;
	});

	/**
	 * Reacts to default location changes.
	 */
	const updateDefaultSelectedLocation = e => {
		selectionStore.update(selection => {
			selection.defaultLocation = $locationEntityStore[e.detail.entity.id];
			return selection;
		});
		regionTooltipMethods.close();
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
		<div class="location">
			<p>
				<span title="This will apply to all selected items, unless specified differently on each individual item below">
					🗺️ Default location :
				</span>
				<button
					class="btn btn--s"
					bind:this={locationTooltipTrigger}
					aria-describedby='tooltip-default-location'
					on:click|preventDefault={regionTooltipMethods.toggle}
					title="Change the default location"
				>
					{ getLocationLabel($selectionStore.defaultLocation) }
				</button>
			</p>
			{#if locationTooltipTrigger}
				<Tooltip
					id='tooltip-default-location'
					trigger={locationTooltipTrigger}
					bind:exposedMethods={regionTooltipMethods}
				>
					<div class='location-select'>
						<EcoMetricsSelectLocation on:select={updateDefaultSelectedLocation} />
					</div>
				</Tooltip>
			{/if}
		</div>
	</form>
{:else}
	<LoadingSpinner />
{/if}

{#if $selectionStore.device.length || $selectionStore.service.length}
	<details open={$preferencesStore.ecometricsDeviceSelectionListState}>
		<summary on:click={e => toggleEcometricsDeviceSelectionListState(e)}>
			Selection
			({totalNbOfDevices} device{ totalNbOfDevices > 1 ? 's' : '' },
			{totalNbOfServices} service{ totalNbOfServices > 1 ? 's' : '' })
		</summary>
		<form class="full-vw">
			<table class="selection">
				<thead>
					<tr>
						<th>Type</th>
						<th>Name</th>
						<th class="u-center">Use</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>


					<!-- TODO merge devices and services in the same loop to preserve order ? -->

					{#each $selectionStore.device as device}
						<tr>
							<td>
								<span class="type-icon" title="{ device.subcategory }">
									{@html (device.subcategory in $deviceStore.devicesIcons) ? $deviceStore.devicesIcons[device.subcategory] : $deviceStore.devicesIcons.box }
								</span>
							</td>
							<td>{ device.manufacturer } { device.name }</td>
							<td>
								<EcoMetricsSelectionSettings entity={device} />
							</td>
							<td>
								<button
									class="btn btn--s"
									on:click|preventDefault={ () => removeSelectedItem(device) }
								>
									Remove
								</button>
							</td>
						</tr>
					{/each}

					{#each $selectionStore.service as service}
						<tr>
							<td>
								(TODO service icons ?)
							</td>
							<td>{ service.name }</td>
							<td>
								<EcoMetricsSelectionSettings entity={service} />
							</td>
							<td>
								<button
									class="btn btn--s"
									on:click|preventDefault={ () => removeSelectedItem(service) }
								>
									Remove
								</button>
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
	.location-select {
		width: 42ch;
		max-width: 90vw;
	}
</style>
