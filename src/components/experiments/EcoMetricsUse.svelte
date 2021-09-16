<script>
	import { displayNb } from '../../lib/generic_utils.js';
	import {
		deviceStore,
		serviceStore,
		selectionStore,
		carbonIntensityStore,
		locationEntityStore
	} from '../../stores/ecometrics.js';
	import { getDeviceImg, getDeviceLabel, getDeviceKwhPerPeriod } from '../../lib/ecometrics/device.js';
	import {
		getServiceImg,
		estimateCloudConsumption,
		estimateDataTransferConsumption
	} from '../../lib/ecometrics/service.js';
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

	/**
	 * Gets total result according to current period selector value.
	 */
	const convertValuePerYearToPeriod = (value, newPeriod) => {
		switch (newPeriod) {
			case 'day':
				return value / 365;
			case 'week':
				return value / 52;
			case 'month':
				return value / 12;
		}
		return value;
	}

	/**
	 * in KgCo2PerYear
	 */
	const getDeviceFootprint = entity => getDeviceKwhPerPeriod(entity, 'year')
		* getLocationCarbonIntensity(
			entity.selectionSettings.location || $selectionStore.defaultLocation,
			$carbonIntensityStore
		)
		/ 1000;

	let totalKwhPerYear = 0;
	let totalKgCo2PerYear = 0;
	let deviceUseCo2EqChartData = {
		"labels": [],
		"datasets": []
	};

	selectionStore.subscribe(selection => {
		const deviceLabels = [];
		const datasetDeviceKgCo2PerYear = [];

		totalKwhPerYear = 0;
		totalKgCo2PerYear = 0;

		// TODO services.
		selection.device.forEach(entity => {
			datasetDeviceKgCo2PerYear.push(
				getSelectedItemSetting(entity, 'qty') * getDeviceFootprint(entity)
			);
			deviceLabels.push(getDeviceLabel(entity));
			totalKwhPerYear += getDeviceKwhPerPeriod(entity, 'year');
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

		if (datasetDeviceKgCo2PerYear.length) {
			totalKgCo2PerYear = datasetDeviceKgCo2PerYear.reduce((x, y) => x + y);
		}
	});

	/**
	 * Determines if a service need to display a <detail> tag for more info.
	 * @param entity
	 */
	const displayServiceDetails = entity => entity.notes.length
		|| (getSelectedItemSetting(entity, 'useHost') && entity.type === 'cloud');
</script>

<!--
	The period selector is done in a "singleton" tooltip (allows to be changed
	from elswhere), same as the location selector.
	@see src/components/experiments/EcoMetricsSelector.svelte
-->
<section class="rich-text">
	<h2>Devices and Services Use</h2>
	<p>As a general warning, for services, we can only make very approximative (and probably wrong) estimates. Virtually no data is currently available to make any "realistic" estimates for services running on public cloud vendors (<a href="https://davidmytton.blog/assessing-the-suitability-of-the-greenhouse-gas-protocol-for-calculation-of-emissions-from-public-cloud-computing-workloads/" target="_blank">Mytton, 2020</a>). Services that do <strong>not</strong> run in the cloud are exceptions. This opacity also comes from the complexity and increasingly adaptive, on-demand nature of the way physical resources are allocated (primarily vCPU, RAM, storage).</p>
	<h3>What is currently not accounted for</h3>
	<ul>
		<li>Any environmental indicator other than CO2 emissions - i.e. Water Usage Effectiveness (WUE), Eutrophication, Waste, Ecotoxicity...</li>
		<li>Network impacts for transferring data to the device(s) used for using the services - e.g. antennas (3G, 4G, Wifi), cables, <abbr title="Internet Exchange Point">IXP</abbr>s, etc. Getting estimates for these data volumes per service seem impossible to generalize for such a basic tool. We're not trying to make a professional <abbr title="Lifecycle Analysis">LCA</abbr> tool here.</li>
		<li>The PUE (Power Usage Effectiveness) - how much extra energy is needed to operate the data centre (cooling, lighting etc.) of datacenters.</li>
		<li>The PSF (Pragmatic Scaling Factor) - used to take into account multiple identical runs of algorithms (e.g. for testing or optimisation).</li>
	</ul>
	<h3>What impact is estimated</h3>
	<p>
		Estimated carbon intensity of electricity in selected default location ({ getLocationLabel($selectionStore.defaultLocation) })&nbsp;: <strong>{ displayNb(getLocationCarbonIntensity($selectionStore.defaultLocation, $carbonIntensityStore)) }</strong>&nbsp;gCO2e/kWh
	</p>
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
</section>

<!-- For each selected item, display the details of the calculations -->
{#if $selectionStore.device.length || $selectionStore.service.length}
	<section>
		<h2>Details</h2>
		<div class="details-zone full-vw fill-h">
			<div class="f-grid f-grid--g">
				{#if $selectionStore.device.length}
					<div class="f-grid-item">
						<h3>Devices</h3>
						<Chart data={deviceUseCo2EqChartData} type="pie" maxSlices="20" />
						{#each $selectionStore.device as entity}
							<div class="selection-item">
								<h4 class="selection-label">
									<span class="selection-icon">
										{@html getDeviceImg(entity, $deviceStore.devicesIcons) }
									</span>
									<span>{ getSelectedItemSetting(entity, 'qty') }&nbsp;×&nbsp;{ getDeviceLabel(entity) }</span>
								</h4>
								<table>
									{#if entity.selectionSettings.location}
										<tr>
											<td>
												Estimated carbon intensity of electricity in { getLocationLabel(entity.selectionSettings.location) }&nbsp;:
											</td>
											<td class="val">
												<strong>{ displayNb(getLocationCarbonIntensity(entity.selectionSettings.location, $carbonIntensityStore)) }</strong>
											</td>
											<td>gCO2e/kWh</td>
										</tr>
									{/if}
									<tr>
										<td>
											Estimated power consumption for using this device <strong>{ getSelectedItemSetting(entity, 'hours_per_day') }</strong>&nbsp;hours per day on average&nbsp;:
										</td>
										<td class="val">
											<strong>{ displayNb(getDeviceKwhPerPeriod(entity, period)) }</strong>
										</td>
										<td>Kw/h&nbsp;per&nbsp;{ period }</td>
									</tr>
									<tr>
										<td>
											&rarr;&nbsp;Estimated footprint (for { getSelectedItemSetting(entity, 'qty') } device{ getSelectedItemSetting(entity, 'qty') > 1 ? 's' : '' })&nbsp;:
										</td>
										<td class="val">
											<strong>{ displayNb(getSelectedItemSetting(entity, 'qty') * getDeviceKwhPerPeriod(entity, period) * getLocationCarbonIntensity(entity.selectionSettings.location || $selectionStore.defaultLocation, $carbonIntensityStore) / 1000) }</strong>
										</td>
										<td>Kg&nbsp;CO2&nbsp;per&nbsp;{ period }</td>
									</tr>
								</table>
							</div>
						{/each}
					</div>
				{/if}
				{#if $selectionStore.service.length}
					<div class="f-grid-item rich-text">
						<h3>Services</h3>
						{#each $selectionStore.service as entity}
							<div class="selection-item">
								<h4 class="selection-label">
									<span class="selection-icon selection-icon--s">
										{@html getServiceImg(entity, $serviceStore.servicesIcons) }
									</span>
									<span>{ entity.name }</span>
								</h4>
								{#if entity.services.length}
									<p>This service depends on : {#each entity.services as sid, i}
										{#if i !== 0}, {/if}
										<span class="selection-label-inline">
											<span class="selection-icon">
												{@html getServiceImg($serviceStore.services[sid], $serviceStore.servicesIcons) }
											</span>
											<span>{ $serviceStore.services[sid].name }</span>
										</span>
									{/each}</p>
								{/if}
								<!-- Debug. -->
								<!-- <pre>{ JSON.stringify(entity, null, 2) }</pre> -->
								{#if displayServiceDetails(entity)}
									<details>
										<summary>Details</summary>
										{#if entity.notes}
											{#each entity.notes as note}
												<p>
													From <a href={ note.source }>source</a> (retrieved on { note.retrieved }) :
												</p>
												{@html note.content }
											{/each}
										{/if}
										{#if getSelectedItemSetting(entity, 'useHost') && entity.type === 'cloud'}
											<p>Hosting a service like a webserver in the cloud implies at least a fraction of an amount of power consumption that is virtually permanent. But <strong>it's currently an impossible thing to generalize</strong> - i.e. the type of architecture could be shared, dedicated, baremetal, virtualized ; the tech "stack" and choices of technical implementation vary too drastically depending on what is hosted... So the (wrong) estimate we're using here assumes 1/4 vCPU and 1/4 Gb RAM in "idle" state as the baseline for a single "webserver" service, based on averaged findings for <abbr title="Amazon Web Services">AWS</abbr> EC2 instances by <a href="https://medium.com/teads-engineering/estimating-aws-ec2-instances-power-consumption-c9745e347959" target="_blank">Benjamin Davy</a> (published 2021/03/25).</p>
										{/if}
									</details>
								{/if}
								<table>
									{#if entity.selectionSettings.location}
										<tr>
											<td>
												Estimated carbon intensity of electricity in { getLocationLabel(entity.selectionSettings.location) }&nbsp;:
											</td>
											<td class="val">
												<strong>{ displayNb(getLocationCarbonIntensity(entity.selectionSettings.location, $carbonIntensityStore, Object.values($locationEntityStore))) }</strong>
											</td>
											<td>gCO2e/kWh</td>
										</tr>
									{/if}
									<tr>
										<td>Estimated cloud power consumption</td>
										<td class="val">{ displayNb(estimateCloudConsumption(entity)) }</td>
										<td>kW/h</td>
									</tr>
									<tr>
										<td>Estimated data transfer consumption (backups)</td>
										<td class="val">{ displayNb(estimateDataTransferConsumption(entity)) }</td>
										<td>kW/h per month</td>
									</tr>
								</table>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}

{#if totalKwhPerYear && totalKgCo2PerYear}
	<section>
		<h2>CO2 Equivalents (every { period })</h2>
		<div class="rich-text">
			<p>Currently specified use of devices and services amounts to a total of <strong>{ displayNb(convertValuePerYearToPeriod(totalKwhPerYear, period)) }</strong> Kw/h, which corresponds to <strong>{ displayNb(convertValuePerYearToPeriod(totalKgCo2PerYear, period)) }</strong> Kg CO2 Equivalents, over a period of <button
				class="link"
				aria-describedby="period-selector"
				on:click|preventDefault={ togglePeriodTooltip }
				title="Change the period for computing totals"
			>
				1 { period }
			</button>. Here's a list of measures for reference :</p>
		</div>
		<EcoMetricsCo2Equivalents totalKgEqCo2={ convertValuePerYearToPeriod(totalKgCo2PerYear, period) } />
	</section>
{/if}

<!-- TODO Information "singleton" tooltip for data transfers. -->
<!--
	estimate of 0.06 kWh/GB for 2015 is a new estimate proposed in this study,
	based on Krug and colleagues (2014) with updated data for 2015 from Krug
	(2016). kWh/GB = kilowatt-hours per gigabyte.
	See https://onlinelibrary.wiley.com/doi/full/10.1111/jiec.12630
-->

<style>
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
		font-size: .9rem;
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
	:global(.selection-label-inline > .selection-icon > svg) {
		margin: 0;
		width: 100%;
		height: 100%;
	}
	.selection-label-inline {
		display: inline-flex;
	}
	.selection-label-inline > .selection-icon {
		margin: 0 var(--space-xs) 0 0;
		width: 1.66ch;
		height: 1.66ch;
	}
	table {
		margin: 0;
	}
	td {
		border: 0 none;
		padding: 0;
		vertical-align: bottom;
	}
	td + td {
		padding-left: var(--space);
	}
	.val {
		text-align: right;
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
