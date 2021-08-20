<script>
	import {
		deviceStore,
		selectedDeviceStore,
		// selectedMinMaxValues,
		co2EqStore,
		// selectedCo2EqStore,
		totalsStore,
		randomizedDeviceImgStore,
		clickedDeviceImgStore
	} from '../../stores/ecometrics.js';
	// import CardBase from '../CardBase.svelte';
	import SidePanel from '../SidePanel.svelte';
	import Chart from 'svelte-frappe-charts';

	// Allows to trigger actions in SidePanel components.
	// let eqCo2SidePanelMethods;
	let deviceSidePanelMethods;

	// Used for both graphs (bars + pie).
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
	 * Formats number for display.
	 */
	const displayNb = n => {
		let result;
		if (n > 10) {
			result = parseInt(n);
			result = new Intl.NumberFormat('fr-FR').format(result);
		} else {
			result = n.toFixed(2);
		}
		return result;
	};

	/**
	 * Formats given device label.
	 *
	 * @param {Object} device : the device.
	 * @return {String} : the formatted label.
	 */
	const getDeviceLabel = device =>  device.data.manufacturer + ' ' + device.data.name;

	/**
	 * Formats given device info for the side panel details.
	 *
	 * @param {Object} device : the device.
	 * @return {Array} of Objects like { label: "Title of value", value: "The value" }.
	 */
	const getDeviceInfo = device =>  {
		if (!$deviceStore || !$deviceStore.devicesColNames) {
			return '';
		}

		let info = [];
		const keysToRender = [
			"manufacturer",
			"category",
			"subcategory",
			"kg_co2eq",
			"yearly_kwh",
			"use_percent",
			"manufacturing_percent",
			"lifetime",
			"date",
			"error_percent",
			"screen_size",
			"age"
		];

		keysToRender.forEach(key => {
			if (device.data[key].length) {
				info.push({
					label: $deviceStore.devicesColNames[key] || key,
					value: device.data[key]
				});
			}
		});

		return info;
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
	 * Returns a % representing the position of a value in given range.
	 */
	const getValuePercentInRange = (value, min, max) => {
		return (value - min) / (max - min) * 100;
	};

	/**
	 * Returns 1 scaled image per quantity of device as array of objects.
	 */
	const getDeviceImgRepeated = (device, lowestKgCo2Value, highestKgCo2Value) => {
		const deviceImgs = [];
		const minSize = 2.5; // in rem
		const maxSize = 12; // in rem
		const svg = getDeviceImg(device);
		const value = device.data.kg_co2eq;

		// When only 1 device is selected, use median value.
		let scale = ((maxSize - minSize) / 2).toFixed(2);
		if (lowestKgCo2Value !== highestKgCo2Value) {
			const percent = getValuePercentInRange(value, lowestKgCo2Value, highestKgCo2Value);
			scale = (minSize + percent * (maxSize - minSize) / 100).toFixed(2);
		}

		// debug.
		// console.log(device.data.kg_co2eq + ' / ' + highestKgCo2Value + ' , s = ' + scale);

		for (let i = 1; i <= device.qty; i++) {
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

		// Randomize array.
		for (let i = images.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[images[i], images[j]] = [images[j], images[i]];
		}

		// Output randomized items.
		return images;
	};

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

		const newMinMaxValues = {
			"lowestKgCo2Value": 999999,
			"highestKgCo2Value": 0
		};

		if (selectedDevices.length) {
			selectedDevices.forEach(device => {
				let kg_co2eq = 0;
				labels.push(device.qty + " × " + getDeviceLabel(device));

				if (device.data.kg_co2eq && !isNaN(parseInt(device.data.kg_co2eq))) {
					kg_co2eq = parseInt(device.data.kg_co2eq);
					datasetCo2Eq.push(limitDecimals(kg_co2eq * device.qty, 2));
				} else {
					datasetCo2Eq.push(kg_co2eq);
					datasetCo2EqMissing++;
				}

				if (device.data.yearly_kwh && !isNaN(parseInt(device.data.yearly_kwh))) {
					datasetYearlyKwh.push(limitDecimals(device.data.yearly_kwh * device.qty, 2));
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

			// selectedMinMaxValues.update(stored => {
			// 	if (stored.lowestKgCo2Value !== newMinMaxValues.lowestKgCo2Value) {
			// 		stored.lowestKgCo2Value = newMinMaxValues.lowestKgCo2Value;
			// 	}
			// 	if (stored.highestKgCo2Value !== newMinMaxValues.highestKgCo2Value) {
			// 		stored.highestKgCo2Value = newMinMaxValues.highestKgCo2Value;
			// 	}
			// 	return stored;
			// });
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

		if (selectedDevices.length) {
			randomizedDeviceImgStore.set(
				getDeviceImgRandomized(
					selectedDevices,
					newMinMaxValues.lowestKgCo2Value,
					newMinMaxValues.highestKgCo2Value
				)
			);
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
				result = displayNb(value / eq.total);
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
	// const showCo2EqInfo = (e, co2Eq) => {
	// 	e.preventDefault();
	// 	selectedCo2EqStore.set(co2Eq);
	// 	deviceSidePanelMethods.close();
	// 	eqCo2SidePanelMethods.open();
	// };

	/**
	 * Opens side panel (device images measure items' click handler).
	 */
	const showDeviceInfo = (e, deviceImg) => {
		e.preventDefault();
		clickedDeviceImgStore.set(deviceImg);
		// eqCo2SidePanelMethods.close();
		deviceSidePanelMethods.open();
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
						{#each getDeviceInfo($clickedDeviceImgStore.device) as prop}
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
			<div class="details-zone full-vw fill-h">
				<div class="f-grid f-grid--g">
					{#each $co2EqStore as co2Eq}
						<div class="item">
							<!-- <CardBase> -->
								<!-- <h3 slot="title">{ co2Eq.emoji.trim() }&nbsp;{ co2Eq.name_fr }</h3> -->
								<!-- <h3 slot="title">{ getEqCo2($totalsStore.kg_co2eq.value, co2Eq.id) }</h3> -->
								<!-- <span class="co2eq-emoji" aria-hidden="true">{ co2Eq.emoji.trim() }</span> -->
								<h3>
									<!-- <div aria-hidden="true"> -->
										<span class="co2eq-emoji" aria-hidden="true">{ co2Eq.emoji.trim() }</span>
									<!-- </div> -->
									<span>
										{ getEqCo2($totalsStore.kg_co2eq.value, co2Eq.id) }&nbsp;{ co2Eq.name_fr }
									</span>
								</h3>
								<!-- <div slot="content"> -->
								<div>
									<!-- <p>{ getEqCo2($totalsStore.kg_co2eq.value, co2Eq.id) }</p> -->
									<!-- <strong><span class="co2eq-emoji">{ co2Eq.emoji.trim() }</span>&nbsp;{ co2Eq.name_fr }</strong> -->
									<!-- <span class="co2eq-emoji">{ co2Eq.emoji.trim() }</span> -->
									<p>{@html co2Eq.about }</p>
								</div>
							<!-- </CardBase> -->
						</div>
					{/each}
				</div>
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
				<li>
					<a href="https://github.com/GreenAlgorithms/green-algorithms-tool" target="_blank">
						Green Algorithms
					</a>
					-
					Lannelongue, L., Grealey, J., Inouye, M., <a href="https://doi.org/10.1002/advs.202100707" target="_blank">Green Algorithms: Quantifying the Carbon Footprint of Computation</a>. Adv. Sci. 2021, 2100707.
				</li>
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
		border: 1px solid gray;
		margin-right: -1px;
		margin-bottom: -1px;
		max-width: 38ch;
		font-size: .9rem;
	}
	.item h3 {
		margin-top: 0;
		display: flex;
		align-items: center;
	}
	.co2eq-emoji {
		/* float: left; */
		margin-right: var(--space);
		/* margin-bottom: .1em; */
		font-size: 2.15em;
		/* line-height: 1; */
	}
	/* .measurement {
		padding-right: var(--space-s);
		cursor: pointer;
	}
	.measurement:hover {
		color: cornflowerblue;
	} */
	.details-zone {
		position: relative;
	}
	.details-zone .f-grid {
		--gutter: 1.66em;
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
