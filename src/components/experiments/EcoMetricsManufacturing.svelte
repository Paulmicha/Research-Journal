<script>
	import {
		deviceStore,
		selectionStore,
		totalsStore,
		randomizedDeviceImgStore,
		clickedDeviceImgStore
	} from '../../stores/ecometrics.js';
	import { preferencesStore } from '../../stores/preferences.js';
	import { randomizeArray, displayNb, limitDecimals, getValuePercentInRange } from '../../lib/generic_utils.js';
	import { getDeviceLabel, getDeviceInfo, getDeviceImg } from '../../lib/ecometrics/device.js';
	import SidePanel from '../SidePanel.svelte';
	import Chart from 'svelte-frappe-charts';
  import EcoMetricsCo2Equivalents from './EcoMetricsCo2Equivalents.svelte';

	// Allows to trigger actions in SidePanel components.
	let deviceSidePanelMethods;

	// Used for both graphs (bars + pie).
	let co2EqChartData = {
		"labels": [],
		"datasets": []
	};

	/**
	 * Returns 1 scaled image per quantity of device as array of objects.
	 *
   * @param {Object} device : the device entity object.
   * @param {Number} lowestKgCo2Value
   * @param {Number} highestKgCo2Value
	 * @returns {Array} list of objects for all icons (SVG markup, scale, entity).
	 */
	const getDeviceImgRepeated = (device, lowestKgCo2Value, highestKgCo2Value) => {
		const deviceImgs = [];
		const minSize = 3; // in rem
		const maxSize = 12; // in rem
		const svg = getDeviceImg(device, $deviceStore.devicesIcons);
		const value = device.kg_co2eq;

		// When only 1 device is selected, use median value.
		let scale = ((maxSize - minSize) / 2).toFixed(2);
		if (lowestKgCo2Value !== highestKgCo2Value) {
			const percent = getValuePercentInRange(value, lowestKgCo2Value, highestKgCo2Value);
			scale = (minSize + percent * (maxSize - minSize) / 100).toFixed(2);
		}

		// debug.
		// console.log(device.kg_co2eq + ' / ' + highestKgCo2Value + ' , s = ' + scale);

		for (let i = 1; i <= (device.selectionSettings.qty || 1); i++) {
			deviceImgs.push({
				svg,
				scale,
				device
			});
		}

		return deviceImgs;
	};

	/**
	 * Renders scaled devices images in a random order.
	 */
	const getDeviceImgRandomized = (selectedDevices, lowestKgCo2Value, highestKgCo2Value) => {
		let images = [];

		// Merge all scaled images into the same array.
		selectedDevices.forEach(device => {
			const scaledImages = getDeviceImgRepeated(device, lowestKgCo2Value, highestKgCo2Value);
			images = [...images, ...scaledImages];
		});

		// Output randomized items.
		return randomizeArray(images);
	};

	selectionStore.subscribe(selection => {
		const labels = [];
		const datasetCo2Eq = [];
		const datasetYearlyKwh = [];

		let datasetCo2EqMissing = 0;
		let datasetYearlyKwhMissing = 0;

		// TODO seed charts with IPCC target / hab / year reference ?
		// const labels = ['IPCC Target (Kg Co2 Eq / hab / year)'];
		// const datasetCo2Eq = [2100];
		// const datasetYearlyKwh = [0];

		const newMinMaxValues = {
			"lowestKgCo2Value": 999999,
			"highestKgCo2Value": 0
		};

		if (selection.device.length) {
			selection.device.forEach(device => {
				let kg_co2eq = 0;
				labels.push((device.selectionSettings.qty || 1) + " × " + getDeviceLabel(device));

				if (device.kg_co2eq && !isNaN(parseInt(device.kg_co2eq))) {
					kg_co2eq = parseInt(device.kg_co2eq);
					datasetCo2Eq.push(limitDecimals(kg_co2eq * (device.selectionSettings.qty || 1), 2));
				} else {
					datasetCo2Eq.push(kg_co2eq);
					datasetCo2EqMissing++;
				}

				if (device.yearly_kwh && !isNaN(parseInt(device.yearly_kwh))) {
					datasetYearlyKwh.push(limitDecimals(device.yearly_kwh * (device.selectionSettings.qty || 1), 2));
				} else {
					datasetYearlyKwh.push(0);
					datasetYearlyKwhMissing++;
				}

				if (kg_co2eq < newMinMaxValues.lowestKgCo2Value) {
					newMinMaxValues.lowestKgCo2Value = kg_co2eq;
				}
				if (kg_co2eq > newMinMaxValues.highestKgCo2Value) {
					newMinMaxValues.highestKgCo2Value = kg_co2eq;
				}
			});
		}
		// TODO that would require to "wrap" the <Tab> component in another one
		// specific to this particular use case, where its instance would react to
		// the changes in the preferencesStore and make the switch.
		// -> For now, just provide an explanation text.
		// else if (
		// 	selection.service.length
		// 	&& ('ecometricsLastActiveTab' in $preferencesStore ? $preferencesStore.ecometricsLastActiveTab : 1) == 1
		// ) {
			// When there's no device (only services) and the current selected tab is
			// "Manufacturing", there would be nothing to show, so switch by default
			// to the "Use" tab.
			// preferencesStore.update(prefs => {
			// 	prefs.ecometricsLastActiveTab = 2;
			// 	return prefs;
			// });
		// }

		co2EqChartData = {
			"labels": labels,
			"datasets": [
				{
					"name": "Production (Kg Co2 Eq)",
					"values": datasetCo2Eq
				},
				{
					"name": "Power (yearly Kw/h)",
					"values": datasetYearlyKwh
				}
			]
		};

		if (datasetCo2Eq.length && datasetYearlyKwh.length) {
			totalsStore.set({
				"kg_co2eq": {
					"value": datasetCo2Eq.reduce((x, y) => x + y),
					"missing": datasetCo2EqMissing
				},
				"yearly_kwh": {
					"value": datasetYearlyKwh.reduce((x, y) => x + y),
					"missing": datasetYearlyKwhMissing
				}
			});
		} else {
			totalsStore.set({});
		}

		if (selection.device.length) {
			randomizedDeviceImgStore.set(
				getDeviceImgRandomized(
					selection.device,
					newMinMaxValues.lowestKgCo2Value,
					newMinMaxValues.highestKgCo2Value
				)
			);
		}
	});

	/**
	 * Opens side panel (device images measure items' click handler).
	 */
	const showDeviceInfo = (e, deviceImg) => {
		e.preventDefault();
		clickedDeviceImgStore.set(deviceImg);
		deviceSidePanelMethods.open();
	};

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

{#if $selectionStore.device.length}

	<!-- Debug. -->
	<!-- <pre style="font-size:.75rem">{JSON.stringify(co2EqChartData, null, 2)}</pre> -->
	<!-- <pre style="font-size:.75rem">{JSON.stringify($totalsStore, null, 2)}</pre> -->

	<div class="ecometrics-dataviz">
		<section>
			<h2>Devices Manufacturing</h2>
			<details open={$preferencesStore.ecometricsCollapsibleWarningsState}>
				<summary on:click|preventDefault={ toggleCollapsibleWarningsState }>
					Warnings&nbsp;⚠️
				</summary>
				<p>This is an informational interactive data visualization webpage, not an <abbr title="Life Cycle Assessment">LCA</abbr> tool.</p>
				<h3>Some of the things currently not accounted for</h3>
				<p>Any environmental indicator other than CO2 emissions - i.e. other <abbr title="Green House Gases">GHG</abbr> Emissions, Eutrophication, Industrial Waste, Biodiversity Loss, Fine Particles, Ecotoxicity...</p>
				<h3>What is estimated</h3>
				<p>CO2 equivalent of devices manufacturing (sources : see below).</p>
				<h3>Why</h3>
				<figure>
					<blockquote cite="https://designcommun.fr/cahiers/situer-le-numerique/">
						<p>En valeur absolue, le numérique ne consomme pas autant d’énergie que d’autres secteurs comme le transport ou la bâtiment, toutefois c’est aujourd’hui le secteur qui connaît la plus forte croissance de sa consommation énergétique. Il en va de même avec les émissions de gaz à effet de serre, aucun autre secteur augmente ses émissions à hauteur de 8% par an.</p>
					</blockquote>
					<figcaption>
						— Gauthier Roussilhe,
						<cite>
							<a href="https://designcommun.fr/cahiers/situer-le-numerique/">
								Situer le Numérique
							</a>
						</cite>
						(2020/11/11)
					</figcaption>
				</figure>
			</details>
			{#if $selectionStore.device.length > 1}
				<h3>Totals</h3>
				<div class="full-vw">
					<div class="f-grid f-grid--center f-grid--g">
						<!-- <div class="chart-wrap">
							<Chart data={co2EqChartData} type="bar" valuesOverPoints="1" />
						</div> -->
						<div class="chart-wrap">
							<Chart data={co2EqChartData} type="pie" maxSlices="13" />
						</div>
					</div>
				</div>
			{/if}
			<h3>Per device</h3>
			<p>The size of each one of the <strong>{ $randomizedDeviceImgStore.length }</strong> devices represents its manufacturing impact (in Kg Co2 emissions) relative to those of the other devices in current selection :</p>
			<div class="full-vw device-pictos">
				{#each $randomizedDeviceImgStore as deviceImg}
					<button
						style="font-size:{ deviceImg.scale }rem"
						title="{ getDeviceLabel(deviceImg.device) }"
						aria-controls="device-info-panel"
						on:click={ e => showDeviceInfo(e, deviceImg) }
					>
						{@html deviceImg.svg }
					</button>
				{/each}
			</div>
			<SidePanel dir="rtl" bind:exposedMethods={deviceSidePanelMethods}
				id="device-info-panel"
				label="Device info"
			>
				{#if $clickedDeviceImgStore && 'device' in $clickedDeviceImgStore }
					<h2 class="no-m-t">{ getDeviceLabel($clickedDeviceImgStore.device) }</h2>
					<dl>
						{#each getDeviceInfo($clickedDeviceImgStore.device, $deviceStore.devicesColNames) as prop}
							<dt>{ prop.label }</dt>
							<dd>{ prop.value }</dd>
						{/each}
					</dl>
				{/if}
			</SidePanel>
		</section>

		<section>
			<h2>CO2 Equivalents</h2>
			<div class="rich-text">
				<p>Current selection of devices amounts to a total of <strong>{ displayNb($totalsStore.kg_co2eq.value) }</strong> Kg CO2 Equivalents for their production. Here's a list of corresponding measures for reference :</p>
			</div>
			<EcoMetricsCo2Equivalents totalKgEqCo2={$totalsStore.kg_co2eq.value} />
		</section>
	</div>
{:else}
	<h2>There's no device in current selection</h2>
	<p>For services impacts, go to the "Use" tab above.</p>
{/if}

<style>
	.no-m-t {
		margin-top: 0;
	}
	.chart-wrap {
		max-width: 100%;
	}
	@media screen and (min-width:110ch) {
		.chart-wrap {
			width: 50%;
			max-width: 66ch;
		}
	}
	.device-pictos {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		padding: var(--space);
	}
	:global(.device-pictos > button) {
		position: relative;
		display: flex;
		align-items: center;
		margin-bottom: calc(var(--space) * -.75);
		padding: var(--space);
		width: 1em;
		height: 1em;
	}
	:global(.device-pictos > button::before),
	:global(.device-pictos > button::before) {
		position: absolute;
		top: 0;
		left: 0;
		content: '';
		border-radius: 50%;
		border: 1px solid black;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity ease-out .25s;
		z-index: -1;
	}
	:global(.device-pictos > button:hover::before),
	:global(.device-pictos > button:focus::before) {
		opacity: 1;
	}
	:global(.device-pictos > button > svg) {
		width: 100%;
		height: 100%;
	}
</style>
