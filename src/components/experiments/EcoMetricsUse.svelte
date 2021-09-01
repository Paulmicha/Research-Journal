<script>
	import { displayNb } from '../../lib/generic_utils.js';
	import { deviceStore, serviceStore, selectionStore, totalsStore, carbonIntensityStore } from '../../stores/ecometrics.js';
	import { getDeviceImg, getDeviceLabel, getDeviceKwhPerPeriod } from '../../lib/ecometrics/device.js';
	import { getServiceImg } from '../../lib/ecometrics/service.js';
	import { getLocationCarbonIntensity, getLocationLabel } from '../../lib/ecometrics/location.js';
	import { getSelectedItemSetting } from '../../lib/ecometrics/selection.js';
	import Chart from 'svelte-frappe-charts';
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

	let deviceUseCo2EqChartData = {
		"labels": [],
		"datasets": []
	};

	selectionStore.subscribe(selection => {
		const deviceLabels = [];
		const datasetDeviceKgCo2PerYear = [];

		// TODO services.
		selection.device.forEach(entity => {
			datasetDeviceKgCo2PerYear.push(
				getDeviceKwhPerPeriod(entity, 'year') * getLocationCarbonIntensity(
					entity.selectionSettings.location || $selectionStore.defaultLocation,
					$carbonIntensityStore
				) / 1000
			);
			deviceLabels.push(getDeviceLabel(entity));
		});
		deviceUseCo2EqChartData = {
			"labels": deviceLabels,
			"datasets": [
				{
					"name": "Emissions from power consumption (Kg Co2 per year)",
					"values": datasetDeviceKgCo2PerYear
				}
			]
		};
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
							<div class="selection-item rich-text">
								<h4 class="selection-label">
									<span class="selection-icon">
										{@html getDeviceImg(entity, $deviceStore.devicesIcons) }
									</span>
									<span>{ getSelectedItemSetting(entity, 'qty') }&nbsp;×&nbsp;{ getDeviceLabel(entity) }</span>
								</h4>
								<!-- <p>
									Based on the estimated carbon intensity of the main use location of this device (about { getLocationCarbonIntensity(entity.selectionSettings.location || $selectionStore.defaultLocation, $carbonIntensityStore) } gCO2e/kWh in { getLocationLabel(entity.selectionSettings.location || $selectionStore.defaultLocation) }) and the estimated power consumption of this device ({ displayNb(getDeviceKwhPerPeriod(entity, period)) } Kw/h per { period }), the estimated footprint amounts to :
								</p> -->
								<ul>
									<li>Estimated carbon intensity of the main use location of this device&nbsp;: <strong>{ getLocationCarbonIntensity(entity.selectionSettings.location || $selectionStore.defaultLocation, $carbonIntensityStore) }</strong>&nbsp;gCO2e/kWh in { getLocationLabel(entity.selectionSettings.location || $selectionStore.defaultLocation) })</li>
									<li>Estimated power consumption for using this device <strong>{ getSelectedItemSetting(entity, 'hours_per_day') }</strong>&nbsp;hours per day on average&nbsp;: <strong>{ displayNb(getDeviceKwhPerPeriod(entity, period)) }</strong>&nbsp;Kw/h&nbsp;per&nbsp;{ period })</li>
								</ul>
								<p class="selection-result">
									Estimated footprint (for { getSelectedItemSetting(entity, 'qty') } device{ getSelectedItemSetting(entity, 'qty') > 1 ? 's' : '' })&nbsp;:
									<strong>
										{ displayNb(getSelectedItemSetting(entity, 'qty') * getDeviceKwhPerPeriod(entity, period) * getLocationCarbonIntensity(entity.selectionSettings.location || $selectionStore.defaultLocation, $carbonIntensityStore) / 1000) }
									</strong>&nbsp;Kg&nbsp;CO2&nbsp;/&nbsp;{ period }
								</p>
							</div>
						{/each}
						<div class="selection-chart">
							<Chart data={deviceUseCo2EqChartData} type="pie" maxSlices="20" />
						</div>
					</div>
				{/if}
				{#if $selectionStore.service.length}
					<div class="f-grid-item">
						<h3>Services</h3>
						{#each $selectionStore.service as service}
							<div class="selection-item">
								<h4 class="selection-label">
									<span class="selection-icon selection-icon--s">
										{@html getServiceImg(service, $serviceStore.servicesIcons) }
									</span>
									<span>{ service.name }</span>
								</h4>
								<p>TODO</p>
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
	.selection-item + .selection-item {
		border-top: 1px solid #AFAFAF;
		margin-top: var(--space);
		padding-top: var(--space);
	}
	.selection-label {
		display: flex;
		align-items: center;
		margin-bottom: var(--space-xs);
	}
	.selection-icon {
		margin-right: var(--space);
	}
	:global(.selection-icon.selection-icon--s > svg) {
		margin: 0;
		width: 100%;
		height: 100%;
	}
	.selection-result {
		display: block;
		margin-top: var(--space-s);
		text-align: center;
	}
	@media (min-width: 80ch) {
		.f-grid {
			--gutter: 2.5rem;
		}
		.f-grid-item {
			max-width: 66ch;
		}
		.f-grid-item > h3 {
			text-align: center;
		}
	}
</style>
