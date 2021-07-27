<script>
	import {
		deviceStore,
		selectedDeviceStore,
		co2EqStore,
		selectedCo2EqStore,
		totalsStore
	} from '../../stores/ecometrics.js';
	import CardBase from '../CardBase.svelte';
	import SidePanel from '../SidePanel.svelte';
	import Chart from 'svelte-frappe-charts';

	// Allows to trigger actions in the SidePanel component.
	let sidePanelMethods;

	// ['Production (Kg Co2 Eq)', 'Power (yearly Kw/h)', 'IPCC Target (Kg Co2 Eq / year)']
	let co2EqChartData = {
		"labels": [],
		"datasets": []
	};

	/**
	 * Formats values to limit the number of decimal characters displayed.
	 *
	 * @param {Number} n : the number to format.
	 * @param {Integer} x : maximum decimal characters to display.
	 * @return {Number} : the formatted number.
	 */
	const limitDecimals = (n, x) =>  Math.round(n * Math.pow(10, x)) / Math.pow(10, x);

	/**
	 * Formats given device label.
	 *
	 * @param {Object} n : the device.
	 * @return {String} : the formatted label.
	 */
	const getDeviceLabel = device =>  device.data.manufacturer + ' ' + device.data.name;

	selectedDeviceStore.subscribe(selectedDevices => {
		const labels = [];
		const datasetCo2Eq = [];
		const datasetYearlyKwh = [];

		let datasetCo2EqMissing = 0;
		let datasetYearlyKwhMissing = 0;

		// TODO seed charts with IPCC target / hab / year reference ?
		// const labels = ['IPCC Target (Kg Co2 Eq / hab / year)'];
		// const datasetCo2Eq = [2100];
		// const datasetYearlyKwh = [0];

		if (selectedDevices.length) {
			selectedDevices.forEach(device => {
				labels.push(device.qty + " × " + getDeviceLabel(device));

				if (device.data.kg_co2eq && !isNaN(parseInt(device.data.kg_co2eq))) {
					datasetCo2Eq.push(limitDecimals(device.data.kg_co2eq * device.qty, 2));
				} else {
					datasetCo2Eq.push(0);
					datasetCo2EqMissing++;
				}

				if (device.data.yearly_kwh && !isNaN(parseInt(device.data.yearly_kwh))) {
					datasetYearlyKwh.push(limitDecimals(device.data.yearly_kwh * device.qty, 2));
				} else {
					datasetYearlyKwh.push(0);
					datasetYearlyKwhMissing++;
				}
			});
		}

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
	});

	/**
	 * Gets the KgEqCO2 of given equivalent measurement.
	 *
	 * @see scripts/experiments/ecometrics/fetch.sh
	 * @see private/co2-eq/equivalents.json
	 *
	 * @example
	 * 	// Apple 13-inch MacBook Pro 4 Thunderbolt 3 ports with 1TB (= 298 kg) :
	 * 	// How many Km by Car can I make for what it cost to build it ?
	 * 	km = getEqCo2(298, '🚗'); // We can use emojis (with quotes) !
	 * 	// Or :
	 * 	km = getEqCo2(298, 27976); // 27976 is the ID of the "Car" measurement.
	 */
	const getEqCo2 = (value, measurement) => {
		let result = false;
		$co2EqStore.forEach(eq => {
			if (eq.id === measurement || eq.emoji === measurement) {
				result = value / eq.total;
				if (result > 10) {
					result = parseInt(result);
					result = new Intl.NumberFormat('fr-FR').format(result);
				} else {
					result = result.toFixed(2);
				}
			}
		});
		// if (!isNaN(parseFloat(result)) && isFinite(result)) {
		// 	return result;
		// }
		// return 'No match';
		return result;
	};

	/**
	 * Opens side panel (co2 eq. measure items' click handler).
	 */
	const showCo2EqInfo = (e, co2Eq) => {
		selectedCo2EqStore.set(co2Eq);
		sidePanelMethods.open();
	};

	/**
	 * Returns device SVG code according to its type (subcategory).
	 */
	const getDeviceImg = device => {
		if (!$deviceStore || !$deviceStore.devicesIcons) {
			return '';
		}
		if (!(device.data.subcategory in $deviceStore.devicesIcons)) {
			return $deviceStore.devicesIcons.box;
		}
		return $deviceStore.devicesIcons[device.data.subcategory];
	};

	/**
	 * Workaround unable to repeat by quantity using svelte "each" syntax.
	 */
	const getDeviceImgWrapped = device => {
		let html = '';

		// TODO (wip) see https://css-tricks.com/create-a-tag-cloud-with-some-simple-css-and-even-simpler-javascript/
		const scale = device.data.kg_co2eq / highestValue * maxFontSize;

		for (let i = 1; i <= device.qty; i++) {
			// html += '<div class="device-picto" style="font-size:' + scale + 'rem" title="' + getDeviceLabel(device) + ' ' + i + '">';
			html += getDeviceImg(device);
			// html += '</div>';
		}
		return html;
	};

</script>

{#if $selectedDeviceStore.length}

	<!-- Debug. -->
	<!-- <pre style="font-size:.75rem">{JSON.stringify(co2EqChartData, null, 2)}</pre> -->
	<!-- <pre style="font-size:.75rem">{JSON.stringify($totalsStore, null, 2)}</pre> -->

	<div class="ecometrics-dataviz">
		<section>
			<h2>Devices comparison</h2>

			<h3>Totals</h3>
			<div class="full-vw">
				<div class="f-grid f-grid--center f-grid--g">
					<div class="chart-wrap">
						<Chart data={co2EqChartData} type="bar" valuesOverPoints="1" />
					</div>
					<div class="chart-wrap">
						<Chart data={co2EqChartData} type="pie" maxSlices="20" />
					</div>
				</div>
			</div>

			<h3>Per device</h3>
			<div class="full-vw u-center">
				<!-- <div class="f-grid f-grid--center f-grid--g f-grid--devices"> -->
					{#each $selectedDeviceStore as device, i}
						<!-- {#each Array(device.qty) as _, j} -->
							<!-- <div title={ j + ' / ' + device.qty + ' ' + getDeviceLabel(device) }> -->
								<!-- {@html getDeviceImg(device).repeat(device.qty) } -->
								{@html getDeviceImgWrapped(device) }
							<!-- </div> -->
						<!-- {/each} -->
					{/each}
				<!-- </div> -->
			</div>

		</section>

		<section>
			<h2>CO2 Equivalents</h2>

			<h3>Totals</h3>
			<div class="u-center">
				{#each $co2EqStore as co2Eq}
					<button
						class="measurement"
						aria-controls="co2-eq-info-panel"
						title={ co2Eq.name_fr }
						on:click={ e => showCo2EqInfo(e, co2Eq) }
					>
						{ co2Eq.emoji.trim() }<!--
						-->&nbsp;:&nbsp;<!--
						-->{ getEqCo2($totalsStore.kg_co2eq.value, co2Eq.id) }
					</button>
				{/each}
			</div>

			<h3>Per device</h3>
			<div class="details-zone full-vw fill-h">
				<div class="f-grid f-grid--center f-grid--g">
					{#each $selectedDeviceStore as device}
						<div class="item">

							<CardBase>
								<h3 slot="title">{ device.qty }&nbsp;&times;&nbsp;{ getDeviceLabel(device) }</h3>
								<div slot="content" class="u-center">
									{#each $co2EqStore as co2Eq}
										<button
											class="measurement"
											aria-controls="co2-eq-info-panel"
											title={ co2Eq.name_fr }
											on:click={ e => showCo2EqInfo(e, co2Eq) }
										>
											{ co2Eq.emoji.trim() }<!--
											-->&nbsp;:&nbsp;<!--
											-->{ getEqCo2(device.data.kg_co2eq * device.qty, co2Eq.id) }
										</button>
									{/each}

									<!-- Debug. -->
									<!-- <pre style="font-size:.75rem">{JSON.stringify(device, null, 2)}</pre> -->

								</div>
							</CardBase>

						</div>
					{/each}
				</div>

				<SidePanel bind:exposedMethods={sidePanelMethods} id="co2-eq-info-panel">
					{#if $selectedCo2EqStore && 'about' in $selectedCo2EqStore}
						<h2 class="no-m-t">{ $selectedCo2EqStore.emoji }&nbsp;{ $selectedCo2EqStore.name_fr }</h2>
						<p>{@html $selectedCo2EqStore.about }</p>
					{/if}
				</SidePanel>

			</div>
		</section>

		<section class="rich-text">
			<h2>Sources</h2>
			<ul>
				<li>
					<a href="https://github.com/Boavizta/environmental-footprint-data" target="_blank">
						Boavizta Project - Environmental Footprint Data
					</a>
				</li>
				<li>
					<a href="https://ecoinfo.cnrs.fr/ecodiag-calcul/" target="_blank">
						Ecodiag
					</a>
					by
					<a href="https://ecoinfo.cnrs.fr/" target="_blank">
						Ecoinfo (CNRS)
					</a>
				</li>
				<li>
					<a href="https://github.com/datagir/monconvertisseurco2" target="_blank">
						Mon convertisseur CO2
					</a>
					by
					<a href="https://datagir.ademe.fr/" target="_blank">
						Datagir
					</a>
					(<a href="https://data.ademe.fr/" target="_blank">ADEME</a> + <a href="https://beta.gouv.fr/">beta.gouv.fr / DINUM</a>)
				</li>
				<!-- <li>
					[wip]
					<a href="https://github.com/GreenAlgorithms/green-algorithms-tool" target="_blank">
						Green Algorithms
					</a>
					-
					Lannelongue, L., Grealey, J., Inouye, M., <a href="https://doi.org/10.1002/advs.202100707" target="_blank">Green Algorithms: Quantifying the Carbon Footprint of Computation</a>. Adv. Sci. 2021, 2100707.
				</li> -->
				<!-- <li>
					[wip]
					<a href="https://medium.com/teads-engineering/estimating-aws-ec2-instances-power-consumption-c9745e347959" target="_blank">
						Estimating AWS EC2 Instances Power Consumption
					</a>
					by Benjamin DAVY (2021/03/25)
				</li> -->
			</ul>
		</section>
	</div>
{/if}

<style>
	/* .p-h {
		padding: 0 var(--space);
	} */
	.no-m-t {
		margin-top: 0;
	}
	.chart-wrap {
		max-width: 100%;
	}
	.item {
		max-width: 30ch;
	}
	.measurement {
		padding-right: var(--space-s);
		cursor: pointer;
	}
	.measurement:hover {
		color: cornflowerblue;
	}
	.details-zone {
		position: relative;
	}
	@media screen and (min-width:110ch) {
		.chart-wrap {
			width: 50%;
			max-width: 66ch;
		}
	}
	/* .f-grid--devices {
		--item-width: 2rem;
	} */
	:global(.device-picto) {
		display: inline-block;
		width: 1em;
	}
	:global(.device-picto > svg) {
		max-width: 100%;
	}
</style>
