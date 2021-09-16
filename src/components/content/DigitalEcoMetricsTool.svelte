<script>
	import { route } from '../../stores/route.js';
	import { randomizeArray, objectFlip } from '../../lib/generic_utils.js';
	import { addSelectedItem, selectionShortenedPropMap } from '../../lib/ecometrics/selection.js';
	import {
		deviceStore,
		co2EqStore,
		selectionStore,
		carbonIntensityStore,
		locationEntityStore,
		serviceStore
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
	const oneLetterPropMapInverted = objectFlip(selectionShortenedPropMap);

	// Init custom data.
	route.subscribe(o => {
		if (o.data && o.data.ecometrics) {
			const devicesById = {};
			deviceStore.set({
				devices: o.data.ecometrics.devices.map(device => {
					device.entityType = 'device';
					devicesById[device.id] = device;
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
				// Some services have a list of locations where the 1st is to be
				// considered as the default location.
				// @see scripts/experiments/ecometrics/manual-data/services.json
				if ('locations' in service) {
					service.selectionSettings = {};
					service.selectionSettings.location = locationsById[service.locations[0]];
				}
				service.entityType = 'service';
				servicesById[service.id] = service;
			});
			serviceStore.set({
				services: servicesById,
				servicesIcons: o.data.servicesIcons
			});

			// Preset the default location to "World" if empty.
			if (!$selectionStore.defaultLocation) {
				selectionStore.update(selection => {
					selection.defaultLocation = locationsById['10401578'];
					return selection;
				});
			}

			// Presets from query args (shareable links).
			// The separator between entities is ';'.
			// The separator between entity setting is '/'.
			// Example :
			// host.tld/path?s=l39266913;d52609815;d22777652/q2;s58190969/l74923856/i2000/otrue
			// -> 4 entities :
			//   - l39266913 : location of ID 39266913
			//   - d52609815 : device of ID 52609815
			//   - d22777652/q2 : device with 1 setting (quantity = 2)
			//   - s58190969/l74923856/i2000/otrue : a service with 3 settings
			// @see src/components/experiments/EcoMetricsShareLink.svelte
			// @see src/components/experiments/EcoMetricsSelectionSettings.svelte
			if ('s' in o.query && o.query.s.length) {
				const devicesToSelect = [];
				const servicesToSelect = [];
				let defaultLocationToSelect = false;

				o.query.s.split(';').forEach((urlEncodedEntity, i) => {
					const parts = urlEncodedEntity.split('/');
					const id = parts[0].substring(1);
					let entityToSelect;

					switch (parts[0].substring(0, 1)) {
						case 'd':
							entityToSelect = devicesById[id];
							break;
						case 's':
							entityToSelect = servicesById[id];
							break;
						case 'l':
							defaultLocationToSelect = locationsById[id];
							// Exit early because in this case, we're reading the default
							// location entity, which has no settings.
							return;
					}

					if (!('selectionSettings' in entityToSelect)) {
						entityToSelect.selectionSettings = {};
					}

					// When there is nothing more than the entity ID, it means that all
					// settings are defaults. When there's more than 1 part, we have
					// non-default settings to parse.
					if (parts.length > 1) {
						// Part 0 is the entity ID, and all remaining parts are settings
						// -> start the loop at 1.
						for (let i = 1; i < parts.length; i++) {
							const urlEncodedSetting = parts[i];
							const firstChar = urlEncodedSetting.substring(0, 1);

							Object.keys(oneLetterPropMapInverted).forEach(l => {
								if (firstChar === l) {
									entityToSelect.selectionSettings[oneLetterPropMapInverted[l]] = urlEncodedSetting.substring(1);

									// TODO avoid manual exceptions here and in the "encoding"
									// part of the URL sharing mechanism by only allowing strings
									// in 'selectionSettings' ?
									if (l === 'l') {
										// Location overrides are (for now) the entity objects
										// themselves (instead of just the ID).
										entityToSelect.selectionSettings[oneLetterPropMapInverted[l]] = locationsById[urlEncodedSetting.substring(1)];
									}
								}
							});
						}
					}

					switch (entityToSelect.entityType) {
						case 'device':
							devicesToSelect.push(entityToSelect);
							break;
						case 'service':
							servicesToSelect.push(entityToSelect);
							break;
					}
				});

				// Finally, update the selection store with all parsed data.
				selectionStore.update(selection => {
					selection.device = devicesToSelect;
					selection.service = servicesToSelect;
					selection.defaultLocation = defaultLocationToSelect || locationsById['10401578'];
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
			selected={ 'ecometricsLastActiveTab' in $preferencesStore ? $preferencesStore.ecometricsLastActiveTab : 1 }
			on:change={ tabHasChanged }
			items={[ "Infrastructure", "Manufacturing", "Use", "End of life" ]}
		>
			<TabContent i="0">
				<section class="rich-text">
					<h2>Infrastructure building</h2>
					<p>This is currently not implemented in this tool. It should cover the impacts of extraction (minerals), buildings, networks, antennas, etc.</p>
					<figure>
						<blockquote cite="http://gauthierroussilhe.com/post/territoires-centres-de-donnees.html">
							<p>En 2020, 150 milliards de dollars ont été investi par les géants du cloud, dont la moitié pour construire des nouveaux centres de données. Les plus gros investissements sont dans l’ordre : Amazon, Microsoft, Google, Facebook, Apple, Alibaba et Tencent. S’il y avait 541 hyperscalers dans le monde en juin 2020, Synergy Research Group estime maintenant qu’il y en aurait 625 aujourd'hui.</p>
							<p>Comment tous ces nouveaux centres sont installés, quel a été l’impact de leur construction, de la fabrication du matériel, quelles sont leurs demandes locales en électricité et en eau, quels sont les conflits d’usage liés à cela, est-ce que ces développements sont compatibles avec un monde à +2°C ? Quid des réseaux de télécommunication [...] ?</p>
						</blockquote>
						<figcaption>
							— Gauthier Roussilhe,
							<cite>
								<a href="http://gauthierroussilhe.com/post/territoires-centres-de-donnees.html">Territorialiser les systèmes numériques, l'exemple des centres de données</a>
							</cite>
						</figcaption>
					</figure>
					<h3>More information :</h3>
					<ul>
						<li>
							<a href="https://www.youtube.com/watch?v=QW9udH0vwlE">
								Promesses de dématérialisation et matérialité minérale (online event "Under the hood of Sustainable IT" organized by the Belgian Institute for Sustainable IT)
							</a>
						</li>
					</ul>
				</section>
			</TabContent>
			<TabContent i="1">
				<EcoMetricsManufacturing />
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
					</ul>
				</section>
			</TabContent>
			<TabContent i="2">
				<EcoMetricsUse />
				<section class="rich-text">
					<h2>Sources</h2>
					<ul>
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
								Green Algorithms tool
							</a>
							-
							Lannelongue, L., Grealey, J., Inouye, M., <a href="https://doi.org/10.1002/advs.202100707" target="_blank">Green Algorithms: Quantifying the Carbon Footprint of Computation</a>. Adv. Sci. 2021, 2100707.
						</li>
						<li>
							<a href="https://davidmytton.blog/assessing-the-suitability-of-the-greenhouse-gas-protocol-for-calculation-of-emissions-from-public-cloud-computing-workloads/" target="_blank">
								Assessing the suitability of the Greenhouse Gas Protocol for calculation of emissions from public cloud computing workloads
							</a>
							by David Mytton (2020/08/09)
						</li>
						<li>
							<a href="https://onlinelibrary.wiley.com/doi/full/10.1111/jiec.12630" target="_blank">
								Electricity Intensity of Internet Data Transmission: Untangling the Estimates
							</a>
							by Joshua Aslan, Kieren Mayers, Jonathan G. Koomey, Chris France (2017/08/01)
						</li>
						<li>
							<a href="https://medium.com/teads-engineering/estimating-aws-ec2-instances-power-consumption-c9745e347959" target="_blank">
								Estimating AWS EC2 Instances Power Consumption
							</a>
							by Benjamin DAVY (2021/03/25)
						</li>
					</ul>
				</section>
			</TabContent>
			<TabContent i="3">
				<h2>End of life</h2>
				<p>Il manque ici des données sur la phase de fin de vie des équipements et des infrastructures (bâtiments, réseaux).</p>
			</TabContent>
		</Tabs>
	{/if}
{/if}
