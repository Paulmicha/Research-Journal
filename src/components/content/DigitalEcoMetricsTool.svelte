<script>
	import { route } from '../../stores/route.js';
	import { randomizeArray } from '../../lib/generic_utils.js';
	import { deviceStore, co2EqStore, selectedDeviceStore } from '../../stores/ecometrics.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import EcoMetricsSelector from '../experiments/EcoMetricsSelector.svelte';
	import EcoMetricsManufacturing from '../experiments/EcoMetricsManufacturing.svelte';
	import Tabs from '../Tabs.svelte';
	import TabContent from '../TabContent.svelte';

	// Init custom data.
	route.subscribe(o => {
		if (o.data && o.data.ecometrics) {
			// For scaling images of devices to represent their manufacturing impact.
			// let devicesLowestKgCo2Value = 999999;
			// let devicesHighestKgCo2Value = 0;
			const devices = o.data.ecometrics.devices;

			// Seed the 'age' key by default based on manufacturing date.
			devices.forEach(device => {
				if ('date' in device && device.date.length) {
					device.age = new Date().getFullYear() - parseInt(device.date.replace(/\D/g, ''));
				} else {
					device.age = 1;
				}
				// if (device.kg_co2eq < devicesLowestKgCo2Value) {
				// 	devicesLowestKgCo2Value = device.kg_co2eq;
				// }
				// if (device.kg_co2eq > devicesHighestKgCo2Value) {
				// 	devicesHighestKgCo2Value = device.kg_co2eq;
				// }
			});

			// Store all devices.
			deviceStore.set({
				devices,
				devicesColNames: o.data.ecometrics.devicesColNamesByKey,
				// devicesDistinctValues: o.data.ecometrics.devicesDistinctValues
				devicesIcons: o.data.devicesIcons
				// devicesLowestKgCo2Value,
				// devicesHighestKgCo2Value
			});

			// Store randomized CO2 equivalences.
			co2EqStore.set(randomizeArray(o.data.ecometrics.co2Eq));

			// Presets from query args (shareable links).
			if ('s' in o.query && o.query.s.length) {
				let pos = 0;
				const devicesToSelect = [];

				o.query.s.split(',').forEach(part => {
					const deviceToSelect = {};

					part.split(':').forEach((subPart, i) => {
						deviceToSelect.pos = i;
						const firstChar = subPart.substring(0, 1);

						if (firstChar === 'a') {
							deviceToSelect.age = subPart.substring(1);
						} else if (firstChar === 'q') {
							deviceToSelect.qty = subPart.substring(1);
						} else {
							deviceToSelect.id = subPart;

							// Match data by device ID.
							devices.forEach(device => {
								if (device.id === subPart) {
									deviceToSelect.data = device;
								}
							});
						}
					});

					if ('data' in deviceToSelect) {
						deviceToSelect.pos = pos;
						devicesToSelect.push(deviceToSelect);
						pos++;
					} else {
						// TODO Fallback matching after v1 ?
						console.log(`Device ${deviceToSelect.id} data not matched (the source dataset was likely updated)`);
					}
				});

				selectedDeviceStore.set(devicesToSelect);
			}
		}
	});
</script>

{#if ! $deviceStore.devices.length}
	<div class="full-vw fill-h">
		<LoadingSpinner size="10vmin" border="1vmin" />
	</div>
{:else}
	<EcoMetricsSelector />
	{#if $selectedDeviceStore.length}
		<Tabs id="metrics" items={[{label:"Manufacturing"}, {label:"Usage"}]}>
			<TabContent i="0">
				<EcoMetricsManufacturing />
			</TabContent>
			<TabContent i="1">
				<p>TODO pane 2</p>
			</TabContent>
		</Tabs>
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
	{/if}
{/if}
