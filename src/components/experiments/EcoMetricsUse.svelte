<script>
	import { displayNb } from '../../lib/generic_utils.js';
	import { deviceStore, serviceStore, selectionStore, totalsStore, carbonIntensityStore } from '../../stores/ecometrics.js';
	import { getDeviceImg, getDeviceLabel, getDeviceKwhPerPeriod } from '../../lib/ecometrics/device.js';
	import { getServiceImg } from '../../lib/ecometrics/service.js';
	import { getLocationCarbonIntensity, getLocationLabel } from '../../lib/ecometrics/location.js';
	import Tooltip from '../Tooltip.svelte';
  import EcoMetricsCo2Equivalents from './EcoMetricsCo2Equivalents.svelte';

	let period = 'month';
	let periodTooltipTrigger;
	let periodTooltipMethods;

	/**
	 * Toggles the period tooltip and updates its trigger ref if necessary.
	 *
	 * This allows to use multiple triggers for the same Tooltip instance. It
	 * allows to avoid duplicating / recreating its contents.
	 *
	 * @param {Object} e the DOM click event of the last trigger used to open the
	 *  tooltip "singleton".
	 */
	const togglePeriodTooltip = e => {
		if (periodTooltipMethods.getCurrentTrigger() !== e.target) {
			periodTooltipMethods.recreate(e.target);
			periodTooltipMethods.open();
		} else {
			periodTooltipMethods.toggle();
		}
	}

	// let useStats = {};

	// totalsStore.subscribe(totals => {
	// 	if ($selectionStore.devices.length) {
	// 		$selectionStore.devices.forEach(device => {
	// 			console.log(device);
	// 		});
	// 	}
	// 	console.log(totals);
	// });

	selectionStore.subscribe(selection => {
		// console.log(selection);
	});

</script>

<!--
	The period selector is done in a "singleton" tooltip (allows to be changed
	from elswhere), same as the location selector.
	@see src/components/experiments/EcoMetricsSelector.svelte
-->
<div class="period-selector-wrap">
	<span>All values are computed for a period of</span>&nbsp;:
	<button
		class="link"
		bind:this={ periodTooltipTrigger }
		aria-describedby="period-selector"
		on:click|preventDefault={ togglePeriodTooltip }
		title="Change the period for computing totals"
	>
		1 { period }
	</button>
</div>
{#if periodTooltipTrigger}
	<Tooltip
		id="period-selector"
		trigger={ periodTooltipTrigger }
		bind:exposedMethods={ periodTooltipMethods }
	>
		<label>
			<input type="radio" bind:group={period} name="period" value="day" />
			day
		</label>
		<label>
			<input type="radio" bind:group={period} name="period" value="week" />
			week
		</label>
		<label>
			<input type="radio" bind:group={period} name="period" value="month" />
			month
		</label>
		<label>
			<input type="radio" bind:group={period} name="period" value="year" />
			year
		</label>
	</Tooltip>
{/if}

<!-- For each selected item, display the details of the calculations -->
{#if $selectionStore.device.length || $selectionStore.service.length}
	<section>
		<h2>Details</h2>
		<div class="details-zone full-vw fill-h">
			<div class="f-grid f-grid--g">
				{#if $selectionStore.device.length}
					<div class="f-grid-item">
						<h3>Devices</h3>
						{#each $selectionStore.device as entity}
							<div class="selection-item">
								<div class="selection-icon">
									{@html getDeviceImg(entity, $deviceStore.devicesIcons) }
								</div>
								<div class="selection-details">
									<h4>{ getDeviceLabel(entity) }</h4>
									Based on the estimated carbon intensity of the main use location of this device (about { getLocationCarbonIntensity(entity.selectionSettings.location || $selectionStore.defaultLocation, $carbonIntensityStore) } gCO2e/kWh in { getLocationLabel(entity.selectionSettings.location || $selectionStore.defaultLocation) }) and the estimated Kw/h per { period } ({ displayNb(getDeviceKwhPerPeriod(entity, period)) }), the estimated footprint amounts to :<br/>
									<strong>
										{ displayNb(getDeviceKwhPerPeriod(entity, period) * getLocationCarbonIntensity(entity.selectionSettings.location || $selectionStore.defaultLocation, $carbonIntensityStore) / 1000) }
									</strong>
									Kg CO2 / { period }
								</div>
							</div>
						{/each}
					</div>
				{/if}
				{#if $selectionStore.service.length}
					<div class="f-grid-item">
						<h3>Services</h3>
						{#each $selectionStore.service as service}
							<div class="selection-item">
								<div class="selection-icon">
									{@html getServiceImg(service, $serviceStore.servicesIcons) }
								</div>
								<div class="selection-details">
									<h4>{ service.name }</h4>
									<dl>
										<dt>Carbon intensity</dt>
										<dd>TODO</dd>
									</dl>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}


<!-- TODO redo that part entirely -->

{#if $totalsStore.yearly_kwh.value}
	<section>
		<h2>CO2 Equivalents</h2>
		<div class="rich-text">
			<p>Currently specified use of devices and services amounts to a total of <strong>{ displayNb($totalsStore.yearly_kwh.value) }</strong> Kw/h - that is, <strong>TODO</strong> Kg CO2 Equivalents - over a period of <button
				class="link"
				aria-describedby="period-selector"
				on:click|preventDefault={ togglePeriodTooltip }
				title="Change the period for computing totals"
			>
				1 { period }
			</button>. Here's a list of corresponding measures for reference :</p>
		</div>
		<EcoMetricsCo2Equivalents />
	</section>
{/if}

<style>
	.period-selector-wrap {
		margin-top: var(--space);
	}
	.f-grid {
		--gutter: 1.66rem;
	}
	.f-grid-item {
		max-width: 90%;
	}
	.f-grid,
	.f-grid-item {
		padding-top: 0;
	}
	.selection-item {
		display: flex;
	}
	.selection-item + .selection-item {
		border-top: 1px solid #AFAFAF;
		margin-top: var(--space);
		padding-top: var(--space);
	}
	.selection-icon {
		min-width: 2em;
	}
	.selection-details {
		flex-grow: 1;
		margin-left: var(--space);
	}
	@media (min-width: 60ch) {
		.f-grid {
			--gutter: 2.5rem;
		}
		.f-grid-item {
			max-width: 70ch;
		}
		.f-grid-item > h3 {
			text-align: center;
		}
	}
</style>
