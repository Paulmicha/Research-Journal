<script>
	import { route } from '../../stores/route.js';
	import { randomizeArray, objectFlip } from '../../lib/generic_utils.js';
	import { selectionOneLetterPropMap } from '../../lib/ecometrics/selection.js';
	import {
		deviceStore,
		co2EqStore,
		selectionStore,
		carbonIntensityStore,
		locationEntityStore,
		serviceEntityStore
	} from '../../stores/ecometrics.js';
	import { preferencesStore } from '../../stores/preferences.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import EcoMetricsSelector from '../experiments/EcoMetricsSelector.svelte';
	import EcoMetricsManufacturing from '../experiments/EcoMetricsManufacturing.svelte';
	import EcoMetricsUse from '../experiments/EcoMetricsUse.svelte';
	import Tabs from '../Tabs.svelte';
	import TabContent from '../TabContent.svelte';

	const tabHasChanged = e => preferencesStore.update(prefs => {
		prefs.ecometricsLastActiveTab = e.detail.selected;
		return prefs;
	});

	// Swap key / value for share links decoding.
	// See https://stackoverflow.com/a/31614602/2592338
	const oneLetterPropMapInverted = objectFlip(selectionOneLetterPropMap);

	// Init custom data.
	route.subscribe(o => {
		if (o.data && o.data.ecometrics) {
			deviceStore.set({
				devices: o.data.ecometrics.devices.map(device => {
					device.entityType = 'device';
					return device;
				}),
				devicesColNames: o.data.ecometrics.devicesColNamesByKey,
				devicesIcons: o.data.devicesIcons
			});

			co2EqStore.set(randomizeArray(o.data.ecometrics.co2Eq));
			carbonIntensityStore.set(o.data.ecometrics.carbonIntensity);

			const locationsById = {};
			o.data.ecometrics.locations.map(location => {
				location.entityType = 'location';
				locationsById[location.id] = location;
			});
			locationEntityStore.set(locationsById);

			const servicesById = {};
			o.data.ecometrics.services.map(service => {
				service.entityType = 'service';
				servicesById[service.id] = service;
			});
			serviceEntityStore.set(servicesById);

			// Preset the default location to "World" if empty.
			if (!$selectionStore.defaultLocation) {
				selectionStore.update(selection => {
					selection.defaultLocation = locationsById['10401578'];
					return selection;
				});
			}

			// Presets from query args (shareable links).
			// TODO (wip) services
			if ('s' in o.query && o.query.s.length) {
				let pos = 0;
				const devicesToSelect = [];

				o.query.s.split(',').forEach(part => {
					const deviceToSelect = {};

					part.split(':').forEach((subPart, i) => {
						deviceToSelect.pos = i;
						const firstChar = subPart.substring(0, 1);
						let firstCharMatched = false;

						Object.keys(oneLetterPropMapInverted).forEach(l => {
							if (firstChar === l) {
								deviceToSelect[oneLetterPropMapInverted[l]] = subPart.substring(1);
								firstCharMatched = true;
							}
						});

						if (!firstCharMatched) {
							deviceToSelect.id = subPart;

							// Match data by device ID.
							devices.forEach(device => {
								if (device.id === subPart) {
									deviceToSelect.data = device;
									return;
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

				selectionStore.update(selection => {
					selection.device = devicesToSelect;
					return selection;
				});
			}
		}
	});
</script>

<!-- Debug. -->
<!-- <pre>$preferencesStore : { JSON.stringify($preferencesStore, null, 2) } </pre> -->

{#if ! $deviceStore.devices.length}
	<div class="full-vw fill-h">
		<LoadingSpinner size="10vmin" border="1vmin" />
	</div>
{:else}
	<EcoMetricsSelector />
	{#if $selectionStore.device.length || $selectionStore.service.length}
		<Tabs
			id="metrics"
			selected={$preferencesStore.ecometricsLastActiveTab || 0}
			on:change={tabHasChanged}
			items={[{label:"Manufacturing"}, {label:"Use"}]}
		>
			<TabContent i="0">
				<EcoMetricsManufacturing />
			</TabContent>
			<TabContent i="1">
				<EcoMetricsUse />
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
