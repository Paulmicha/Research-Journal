<script>
	import { displayNb } from '../../lib/generic_utils.js';
	import {
		deviceStore,
		serviceStore,
		selectionStore,
		carbonIntensityStore,
		locationEntityStore
	} from '../../stores/ecometrics.js';
	import { preferencesStore } from '../../stores/preferences.js';
	import { getDeviceImg, getDeviceLabel, getDeviceKwhPerPeriod } from '../../lib/ecometrics/device.js';
	import {
		getServiceImg,
		getServiceKwhPerPeriodEstimates
	} from '../../lib/ecometrics/service.js';
	import { getLocationCarbonIntensity, getLocationLabel } from '../../lib/ecometrics/location.js';
	import { getSelectedItemSetting } from '../../lib/ecometrics/selection.js';
	import Chart from 'svelte-frappe-charts';
	import Tooltip from '../Tooltip.svelte';
  import EcoMetricsCo2Equivalents from './EcoMetricsCo2Equivalents.svelte';
  import Ellipsis from '../Ellipsis.svelte';

	let period = 'month';
	let periodTooltipTrigger;
	let periodTooltipMethods;

	let totalKwhPerYear = 0;
	let totalKgCo2PerYear = 0;

	let deviceUseCo2EqChartData = {
		"labels": [],
		"datasets": []
	};
	let serviceUseCo2EqChartData = {
		"labels": [],
		"datasets": []
	};
	const estimates = {
		device: {},
		service: {}
	};

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
	const getEntityCo2Footprint = (entity, kwhPerYear) => kwhPerYear
		* getLocationCarbonIntensity(
			entity.selectionSettings.location || $selectionStore.defaultLocation,
			$carbonIntensityStore,
			Object.values($locationEntityStore)
		)
		/ 1000;

	// Whenever current selection gets updated, re-calculate all values.
	selectionStore.subscribe(selection => {
		const deviceLabels = [];
		const datasetDeviceKgCo2PerYear = [];
		const serviceLabels = [];
		const datasetServiceKgCo2PerYear = [];

		totalKwhPerYear = 0;
		totalKgCo2PerYear = 0;

		// Devices.
		selection.device.forEach(entity => {
			estimates.device[entity.id] = {
				power: {
					year: getSelectedItemSetting(entity, 'qty') * getDeviceKwhPerPeriod(entity, 'year'),
					month: getSelectedItemSetting(entity, 'qty') * getDeviceKwhPerPeriod(entity, 'month'),
					week: getSelectedItemSetting(entity, 'qty') * getDeviceKwhPerPeriod(entity, 'week'),
					day: getSelectedItemSetting(entity, 'qty') * getDeviceKwhPerPeriod(entity, 'day')
				}
			};
			estimates.device[entity.id].co2 = {
				year: getEntityCo2Footprint(entity, estimates.device[entity.id].power.year)
			};
			estimates.device[entity.id].co2.month = convertValuePerYearToPeriod(
				estimates.device[entity.id].co2.year,
				'month'
			);
			estimates.device[entity.id].co2.week = convertValuePerYearToPeriod(
				estimates.device[entity.id].co2.year,
				'week'
			);
			estimates.device[entity.id].co2.day = convertValuePerYearToPeriod(
				estimates.device[entity.id].co2.year,
				'day'
			);
			totalKwhPerYear += estimates.device[entity.id].power.year;
			totalKgCo2PerYear += estimates.device[entity.id].co2.year;
			deviceLabels.push(getDeviceLabel(entity));
			datasetDeviceKgCo2PerYear.push(estimates.device[entity.id].co2.year);
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

		// Services.
		selection.service.forEach(entity => {
			// Unlike devices, service power consumption is divided in "types" of
			// estimates (currently cloud + data transfer).
			estimates.service[entity.id] = {
				powerPerType: {
					year: getServiceKwhPerPeriodEstimates(entity, 'year'),
					month: getServiceKwhPerPeriodEstimates(entity, 'month'),
					week: getServiceKwhPerPeriodEstimates(entity, 'week'),
					day: getServiceKwhPerPeriodEstimates(entity, 'day')
				}
			};
			estimates.service[entity.id].power = {
				year: estimates.service[entity.id].powerPerType.year.cloud
					+ estimates.service[entity.id].powerPerType.year.transfer,
				month: estimates.service[entity.id].powerPerType.month.cloud
					+ estimates.service[entity.id].powerPerType.month.transfer,
				week: estimates.service[entity.id].powerPerType.week.cloud
					+ estimates.service[entity.id].powerPerType.week.transfer,
				day: estimates.service[entity.id].powerPerType.day.cloud
					+ estimates.service[entity.id].powerPerType.day.transfer
			};
			estimates.service[entity.id].co2 = {
				year: getEntityCo2Footprint(entity, estimates.service[entity.id].power.year)
			};
			estimates.service[entity.id].co2.month = convertValuePerYearToPeriod(
				estimates.service[entity.id].co2.year,
				'month'
			);
			estimates.service[entity.id].co2.week = convertValuePerYearToPeriod(
				estimates.service[entity.id].co2.year,
				'week'
			);
			estimates.service[entity.id].co2.day = convertValuePerYearToPeriod(
				estimates.service[entity.id].co2.year,
				'day'
			);
			totalKwhPerYear += estimates.service[entity.id].power.year;
			totalKgCo2PerYear += estimates.service[entity.id].co2.year;
			serviceLabels.push(entity.name);
			datasetServiceKgCo2PerYear.push(estimates.service[entity.id].co2.year);
		});
		serviceUseCo2EqChartData = {
			"labels": serviceLabels,
			"datasets": [
				{
					"name": "Emissions from power consumption (Kg Co2 per year)",
					"values": datasetServiceKgCo2PerYear
				}
			]
		};
	});

	/**
	 * Toggles the collapsible warnings.
	 */
	const toggleCollapsibleWarningsState = () => {
		preferencesStore.update(prefs => {
			prefs.ecometricsCollapsibleWarningsState = !prefs.ecometricsCollapsibleWarningsState;
			return prefs;
		});
	};
</script>

<!--
	The period selector is done in a "singleton" tooltip (allows to be changed
	from elswhere), same as the location selector.
	@see src/components/experiments/EcoMetricsSelector.svelte
-->
<section class="rich-text">
	<h2>Devices and Services Use</h2>
	<details open={$preferencesStore.ecometricsCollapsibleWarningsState}>
		<summary on:click|preventDefault={ toggleCollapsibleWarningsState }>
			Warnings&nbsp;⚠️
		</summary>
		<p>This is an informational interactive data visualization webpage, not an <abbr title="Life Cycle Assessment">LCA</abbr> tool.</p>
		<p>For services, we can only make very approximative (and probably wrong) estimates. Insufficient data is currently available to make any "realistic" estimates for services running on public cloud vendors (<a href="https://davidmytton.blog/assessing-the-suitability-of-the-greenhouse-gas-protocol-for-calculation-of-emissions-from-public-cloud-computing-workloads/" target="_blank">Mytton, 2020</a>). At the time of writing (2021-09-18), I was only able to find metrics from 2 providers : <a href="https://pue.dc5.scaleway.com/en/" target="_blank">Scaleway</a> and <a href="https://www.cnbc.com/2021/04/20/microsoft-tells-cloud-customers-about-data-center-energy-efficiency.html" target="_blank">Microsoft</a>.</p>
		<p>Precisely differenciating datacenters, points of presence (PoP), and hyperscalers can even prove difficult : <q cite="http://www.theses.fr/2019SACLT036" lang="fr">la définition du data center est suffisamment floue pour englober des objets très différents, de l’armoire informatique à des bâtiments de plusieurs dizaines de milliers de mètres carrés. Face à cette hétérogénéité, les acteurs du monde du data center utilisent différents types de distinctions, s’appuyant sur la taille (« hyperscale », « intermédiaire », « petit »), l’activité économique des opérateurs (colocation, entreprise, hébergeur), le niveau de sécurité de l’information (Tier 3, Tier 4)</q> (<a href="http://www.theses.fr/2019SACLT036" target="_blank">Marquet, 2019</a>). We can think of these as the main components of the infrastructure of "the cloud".</p>
		<p>Services that do <strong>not</strong> run in the cloud are exceptions. Difficulties to get reliable metrics also come from the complexity and increasingly adaptive, on-demand nature of the way physical resources are allocated (CPU, RAM, storage). Some initiatives may be useful to try and make your own measures, such as <a href="https://github.com/hubblo-org/scaphandre" target="_blank">Scaphandre</a> or <a href="https://github.com/marmelab/argos" target="_blank">Argos</a>.</p>
		<h3>Some of the things currently not accounted for</h3>
		<ul>
			<li>Some impacts of data transmission to the device(s) used for using the services, e.g. <q cite="https://journalofcloudcomputing.springeropen.com/articles/10.1186/s13677-020-00185-8">internal network traffic which makes up a significant amount of data transfer and is doubling every 12–15  months</q>, mobile traffic (edge, 3G, 4G, etc)... <q cite="https://journalofcloudcomputing.springeropen.com/articles/10.1186/s13677-020-00185-8">71% of the global population is expected to have mobile connectivity by 2023 and smartphone traffic [is] growing 7% annually</q> (<a href="https://davidmytton.blog/assessing-the-suitability-of-the-greenhouse-gas-protocol-for-calculation-of-emissions-from-public-cloud-computing-workloads/" target="_blank">Mytton, 2020</a>).</li>
			<li>The Power Usage Effectiveness (PUE) - how much extra energy is needed to operate the data centre (cooling, lighting etc.) - and Water Usage Effectiveness (WUE) of datacenters.</li>
			<li>The Pragmatic Scaling Factor (PSF) used to take into account multiple identical runs of algorithms (e.g. for testing or optimisation).</li>
		</ul>
		<h3>What is estimated</h3>
		<p>CO2 equivalent of power consumption per { period } (sources : see below).</p>
	</details>
	<!-- TODO default location selector ? -->
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
						{#if $selectionStore.device.length > 1}
							<Chart data={deviceUseCo2EqChartData} type="pie" maxSlices="33" />
						{/if}
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
											<td class="unit">gCO2e/kWh</td>
										</tr>
									{/if}
									<tr>
										<td>
											Estimated power consumption for using this device <strong>{ getSelectedItemSetting(entity, 'hours_per_day') }</strong>&nbsp;hours per day on average&nbsp;:
										</td>
										<td class="val">
											<strong>{ displayNb(estimates.device[entity.id].power[period]) }</strong>
										</td>
										<td class="unit">Kw/h&nbsp;per&nbsp;{ period }</td>
									</tr>
									<tr>
										<td>
											&rarr;&nbsp;Estimated footprint (for { getSelectedItemSetting(entity, 'qty') } device{ getSelectedItemSetting(entity, 'qty') > 1 ? 's' : '' })&nbsp;:
										</td>
										<td class="val">
											<strong>{ displayNb(estimates.device[entity.id].co2[period]) }</strong>
										</td>
										<td class="unit">KgCO2e&nbsp;per&nbsp;{ period }</td>
									</tr>
								</table>
							</div>
						{/each}
					</div>
				{/if}
				{#if $selectionStore.service.length}
					<div class="f-grid-item rich-text">
						<h3>Services</h3>
						{#if $selectionStore.service.length > 1}
							<Chart data={serviceUseCo2EqChartData} type="pie" maxSlices="33" />
						{/if}
						{#each $selectionStore.service as entity}
							<div class="selection-item">
								<h4 class="selection-label">
									<span class="selection-icon selection-icon--s">
										{@html getServiceImg(entity, $serviceStore.servicesIcons) }
									</span>
									<span>{ entity.name }</span>
								</h4>
								<!-- Debug. -->
								<!-- <pre>{ JSON.stringify(entity, null, 2) }</pre> -->
								{#if entity.notes.length || (getSelectedItemSetting(entity, 'useHost'))}
									<details>
										<summary>Notes</summary>
										{#if entity.notes}
											{#each entity.notes as note}
												{#if 'info' in note}
													<div class="u-m-b">⚠️&nbsp;{@html note.info }</div>
												{:else}
													<div>From <a href={ note.source } target="_blank">source</a> (retrieved on { note.retrieved }) :</div>
													<blockquote cite={ note.source }>
														{@html note.content }
													</blockquote>
												{/if}
											{/each}
										{/if}
										{#if getSelectedItemSetting(entity, 'useHost')}
											<p>⚠️&nbsp;Hosting a service in "the cloud" implies at least a fraction of an amount of permanent power consumption. But <strong>it's currently an impossible thing to generalize</strong> - among other reasons, because :</p>
											<ul>
												<li>internally, the underlying support could be shared, dedicated, baremetal, virtualized</li>
												<li>the tech stack and choices of technical implementation of the service itself imply enormous differences on server ressources use - i.e. static, "serverless", etc. Furthermore, <q cite="https://www.cnbc.com/2021/04/20/microsoft-tells-cloud-customers-about-data-center-energy-efficiency.html">hyperscale data centers are 98% more efficient than on-premises data centers that companies, governments and schools operate for themselves.</q> (<a href="https://www.cnbc.com/2021/04/20/microsoft-tells-cloud-customers-about-data-center-energy-efficiency.html" target="_blank">source</a>, 2021/04/20)</li>
												<li>it also largely depends on the volumes of traffic served (yet another metric currently not factored in this tool)</li>
											</ul>
											<p>So the (wrong) estimate we're using here is based on averaged findings for <abbr title="Amazon Web Services">AWS</abbr> EC2 instances by <a href="https://medium.com/teads-engineering/estimating-aws-ec2-instances-power-consumption-c9745e347959" target="_blank">Benjamin Davy</a> (published 2021/03/25) and the different factors in "advanced settings" in the collapsible selection list above.</p>
										{/if}
									</details>
								{/if}
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
								{#if estimates.service[entity.id].co2[period] > 0}
									<table>
										{#if entity.selectionSettings.location}
											<tr>
												<td>
													Specific location for this service&nbsp;: <Ellipsis valign="middle" text="{ getLocationLabel(entity.selectionSettings.location) }" />
													<br />
													&rarr;&nbsp;Estimated carbon intensity&nbsp;:
												</td>
												<td class="val">
													<strong>{ displayNb(getLocationCarbonIntensity(entity.selectionSettings.location, $carbonIntensityStore, Object.values($locationEntityStore))) }</strong>
												</td>
												<td class="unit">gCO2e/kWh</td>
											</tr>
										{/if}
										{#if estimates.service[entity.id].powerPerType[period].cloud > 0}
											<tr>
												<td class="push">Estimated cloud power consumption</td>
												<td class="val">
													<strong>{ displayNb(estimates.service[entity.id].powerPerType[period].cloud * 1000) }</strong>
												</td>
												<td class="unit">W/h&nbsp;per&nbsp;{ period }</td>
											</tr>
										{/if}
										{#if estimates.service[entity.id].powerPerType[period].transfer > 0}
											<tr>
												<td class="push">Estimated data transfer consumption</td>
												<td class="val">
													<strong>{ displayNb(estimates.service[entity.id].powerPerType[period].transfer * 1000) }</strong>
												</td>
												<td class="unit">W/h&nbsp;per&nbsp;{ period }</td>
											</tr>
										{/if}
										<tr>
											<td class="push">
												&rarr;&nbsp;Estimated footprint&nbsp;:
											</td>
											<td class="val">
												<strong>{ displayNb(estimates.service[entity.id].co2[period] * 1000) }</strong>
											</td>
											<td class="unit">gCO2e&nbsp;per&nbsp;{ period }</td>
										</tr>
									</table>
								{:else}
									<p>We are currently unable to provide any estimates on any metric for this service.</p>
								{/if}
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

<style>
	details + p {
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
		width: 100%;
	}
	td {
		border: 0 none;
		padding: 0;
		vertical-align: bottom;
	}
	td + td {
		padding-left: var(--space);
	}
	td.push {
		width: 100%;
	}
	td.val {
		text-align: right;
	}
	td.unit {
		white-space: nowrap;
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
