<script>
	import {
		deviceStore,
		selectionStore,
		locationEntityStore,
		serviceStore
	} from '../../stores/ecometrics.js';
	import { preferencesStore } from '../../stores/preferences.js';
	import { getLocationLabel } from '../../lib/ecometrics/location.js';
	import {
		clearSelection,
		removeSelectedItem,
		updateSelectedItem,
		getSelectedEntity
	} from '../../lib/ecometrics/selection.js';
	import { getServiceImg } from '../../lib/ecometrics/service.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import Tooltip from '../Tooltip.svelte';
	import EcoMetricsShareLink from './EcoMetricsShareLink.svelte';
	import EcoMetricsSelectMain from './EcoMetricsSelectMain.svelte';
	import EcoMetricsSelectLocation from './EcoMetricsSelectLocation.svelte';
	import EcoMetricsSelectionSettings from './EcoMetricsSelectionSettings.svelte';

	let totalNbOfDevices = 0;
	let totalNbOfServices = 0;

	let defaultLocationTooltipTrigger;
	let locationTooltipMethods;

	// Automatically update the totals whenever current selection changes.
	selectionStore.subscribe(selection => {
		if (selection.device.length) {
			totalNbOfDevices = 0;
			selection.device.forEach(device => {
				if (device.selectionSettings.qty) {
					totalNbOfDevices += parseInt(device.selectionSettings.qty);
				} else {
					totalNbOfDevices++;
				}
			});
		}
		totalNbOfServices = selection.service.length;
	});

	/**
	 * Toggles the location tooltip and updates its trigger ref if necessary.
	 *
	 * This allows to use multiple triggers for the same Tooltip instance. It
	 * allows to avoid duplicating / recreating its contents.
	 * @see src/components/experiments/EcoMetricsSelectionSettings.svelte
	 *
	 * @param {Object} e the DOM click event of the last trigger used to open the
	 *   location tooltip "singleton".
	 */
	const toggleLocationTooltip = e => {
		if (locationTooltipMethods.getCurrentTrigger() !== e.target) {
			locationTooltipMethods.recreate(e.target);
			locationTooltipMethods.open();
		} else {
			locationTooltipMethods.toggle();
		}
	}

	/**
	 * Selects a location from the "singleton" tooltip.
	 */
	const selectLocation = e => {
		const currentTrigger = locationTooltipMethods.getCurrentTrigger();

		// For the default location selector, update the locationEntityStore.
		if (currentTrigger === defaultLocationTooltipTrigger) {
			selectionStore.update(selection => {
				selection.defaultLocation = $locationEntityStore[e.detail.entity.id];
				return selection;
			});
			locationTooltipMethods.close();
			return;
		}

		// For the location selector on individual selected entities, update the
		// selectionStore.
		if (!currentTrigger.hasAttribute('data-entity-id') || !currentTrigger.hasAttribute('data-entity-type')) {
			return;
		}
		const entity = getSelectedEntity(
			$selectionStore,
			currentTrigger.getAttribute('data-entity-type'),
			currentTrigger.getAttribute('data-entity-id')
		);
		if (!entity) {
			return;
		}
		let newSettings = {};
		if ('selectionSettings' in entity) {
			newSettings = entity.selectionSettings;
		}
		newSettings.location = $locationEntityStore[e.detail.entity.id];
		updateSelectedItem(entity, newSettings);
		locationTooltipMethods.close();
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
					class="link link--s"
					bind:this={defaultLocationTooltipTrigger}
					aria-describedby='tooltip-default-location'
					on:click|preventDefault={toggleLocationTooltip}
					title="Change the default location"
				>
					{ getLocationLabel($selectionStore.defaultLocation) }
				</button>
			</p>
			{#if defaultLocationTooltipTrigger}
				<Tooltip
					id='tooltip-default-location'
					trigger={defaultLocationTooltipTrigger}
					bind:exposedMethods={locationTooltipMethods}
				>
					<div class='location-select'>
						<EcoMetricsSelectLocation on:select={selectLocation} />
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

					{#each $selectionStore.device as device, i}
						<tr>
							<td>
								<span class="selection-icon" title="{ device.subcategory }">
									{@html (device.subcategory in $deviceStore.devicesIcons) ? $deviceStore.devicesIcons[device.subcategory] : $deviceStore.devicesIcons.box }
								</span>
							</td>
							<td>{ device.manufacturer } { device.name }</td>
							<td>
								<EcoMetricsSelectionSettings
									{ toggleLocationTooltip }
									entity={ device }
									pos={ i }
								/>
							</td>
							<td>
								<button
									class="btn btn--s"
									on:click|preventDefault={ () => removeSelectedItem(device, i) }
								>
									Remove
								</button>
							</td>
						</tr>
					{/each}

					{#each $selectionStore.service as service, i}
						<tr>
							<td>
								<span class="selection-icon">
									{@html getServiceImg(service, $serviceStore.servicesIcons) }
								</span>
							</td>
							<td>{ service.name }</td>
							<td>
								<EcoMetricsSelectionSettings
									{ toggleLocationTooltip }
									entity={ service }
									pos={ i }
								/>
							</td>
							<td>
								<button
									class="btn btn--s"
									on:click|preventDefault={ () => removeSelectedItem(service, i) }
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
		margin-top: calc(var(--space) / 2);
		margin-bottom: var(--space);
	}
	:global(.selection-icon) {
		display: inline-block;
		vertical-align: middle;
		width: 2em;
		height: 2em;
	}
	:global(.selection-icon > svg) {
		display: inline-block;
		margin: -10%;
		width: 120%;
		height: 120%;
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
	.location {
		margin-top: var(--space-s);
		font-size: .8rem;
	}
	.location-select {
		width: 42ch;
		max-width: 90vw;
	}
</style>
