<script>
	import { page } from '$app/stores';
	import { randomizeArray, objectFlip } from '$lib/generic_utils.js';
	import { selectionShortenedPropMap } from '$lib/ecometrics/selection.js';
	import {
		deviceStore,
		co2EqStore,
		selectionStore,
		carbonIntensityStore,
		locationEntityStore,
		serviceStore
	} from '$lib/stores/ecometrics.js';
	import { preferencesStore } from '$lib/stores/preferences.js';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import EcoMetricsSelector from '$lib/components/ecometrics/EcoMetricsSelector.svelte';
	import EcoMetricsManufacturing from '$lib/components/ecometrics/EcoMetricsManufacturing.svelte';
	import EcoMetricsUse from '$lib/components/ecometrics/EcoMetricsUse.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import TabContent from '$lib/components/TabContent.svelte';
	import ecometricsData from '$content/ecometrics.json';
	import devicesIconsData from '$content/devicesIcons.json';
	import servicesIconsData from '$content/servicesIcons.json';

	const tabHasChanged = e => preferencesStore.update(prefs => {
		prefs.ecometricsLastActiveTab = e.detail.selected;
		return prefs;
	});

	// Swap key / value for share links decoding.
	// See https://stackoverflow.com/a/31614602/2592338
	const oneLetterPropMapInverted = objectFlip(selectionShortenedPropMap);

	// Init custom data.
	const devicesById = {};
	deviceStore.set({
		devices: ecometricsData.devices.map(device => {
			device.entityType = 'device';
			devicesById[device.id] = device;
			return device;
		}),
		devicesColNames: ecometricsData.devicesColNamesByKey,
		devicesIcons: devicesIconsData
	});

	co2EqStore.set(randomizeArray(ecometricsData.co2Eq));
	carbonIntensityStore.set(ecometricsData.carbonIntensity);

	const locationsById = {};
	ecometricsData.locations.map(location => {
		location.entityType = 'location';
		locationsById[location.id] = location;
	});
	locationEntityStore.set(locationsById);

	const servicesById = {};
	ecometricsData.services.map(service => {
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
		servicesIcons: servicesIconsData
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
	if (page.query && page.query.get('s')) {
		const devicesToSelect = [];
		const servicesToSelect = [];
		let defaultLocationToSelect = false;

		page.query.get('s').split(';').forEach(urlEncodedEntity => {
			const parts = urlEncodedEntity.split('/');
			const id = parts[0].substring(1);
			let entityToSelect = null;

			switch (parts[0].substring(0, 1)) {
				case 'd':
					entityToSelect = {...devicesById[id]};
					// Position follows the order of items in the URL.
					entityToSelect.selectionSettings = { pos: devicesToSelect.length };
					break;
				case 's':
					entityToSelect = {...servicesById[id]};
					// Position follows the order of items in the URL.
					entityToSelect.selectionSettings = { pos: servicesToSelect.length };
					break;
				case 'l':
					defaultLocationToSelect = locationsById[id];
					// Exit early because in this case, we're reading the default
					// location entity, which has no settings.
					return;
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

							// TODO test boolean values to convert based on defaults.
							// WIP
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

		// Update the selection store with all parsed data.
		// TODO workaround attempt to fix glitch in devices images in the
		// manufacturing tab.
		setTimeout(() => {
			selectionStore.update(selection => {
				selection.device = devicesToSelect;
				selection.service = servicesToSelect;
				selection.defaultLocation = defaultLocationToSelect || locationsById['10401578'];
				return selection;
			});
		}, 150);

		// When URLs with preset config are opened, close the collapsible zones
		// by default (because we assume the importance will not be the settings
		// or the details but the results).
		preferencesStore.update(prefs => {
			prefs.ecometricsDeviceSelectionListState = null;
			prefs.ecometricsCollapsibleWarningsState = null;
			return prefs;
		});
	}
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
					<h2>Infrastructure of the Web</h2>
					<p>This is currently not implemented as an interactive data visualization.</p>
					<figure>
						<blockquote cite="http://gauthierroussilhe.com/post/territoires-centres-de-donnees.html" lang="fr">
							<p>En 2020, 150 milliards de dollars ont été investi par les géants du cloud, dont la moitié pour construire des nouveaux centres de données. Les plus gros investissements sont dans l’ordre : Amazon, Microsoft, Google, Facebook, Apple, Alibaba et Tencent. S’il y avait 541 hyperscalers dans le monde en juin 2020, Synergy Research Group estime maintenant qu’il y en aurait 625 aujourd'hui.</p>
							<p>Comment tous ces nouveaux centres sont installés, quel a été l’impact de leur construction, de la fabrication du matériel, quelles sont leurs demandes locales en électricité et en eau, quels sont les conflits d’usage liés à cela, est-ce que ces développements sont compatibles avec un monde à +2°C ? Quid des réseaux de télécommunication [...] ?</p>
						</blockquote>
						<figcaption>
							— Gauthier Roussilhe,
							<cite>
								<a href="http://gauthierroussilhe.com/post/territoires-centres-de-donnees.html">Territorialiser les systèmes numériques, l'exemple des centres de données</a> (2021/07/25)
							</cite>
						</figcaption>
					</figure>
					<figure>
						<blockquote cite="https://designcommun.fr/cahiers/situer-le-numerique/" lang="fr">
							<p>au niveau de la production des équipements, notamment les phases d’extraction des matières premières, on observe de nombreux risques de pollution des eaux de surface et souterraines autour des zones d’exploitation minière, notamment dû aux écoulements d’acides liés à l’exposition de métaux à l’air libre ou à l’utilisation de cyanure ou d’acide sulfurique pour séparer un élément chimique du minerai. Les différentes fuites, les ruissellements, voire les ruptures de barrage d’une exploitation minière peuvent contaminer les eaux de tout un écosystème.</p>
							<p>Les sols et l’air sont aussi pollués par les opérations minières. Les opérations de minage provoquent des émissions de gaz, de poussières et de particules toxiques qui influent sur la qualité de l’air. Les sols sont contaminés par les poussières soulevées par les opérations de minage ainsi que par le déversement de produits chimiques et de différents résidus dans les sols. Ces pollutions ont des effets sur l’ensemble des écosystèmes qui y sont exposés, notamment la faune et la flore. La faune aquatique meurt et disparaît dans les cours d’eau contaminés. Ces écoulements toxiques influent aussi sur la santé de la faune et la croissance des plantes qui reposent sur les eaux de surface et souterraines. Enfin, les opérations de minage provoquent des bruits et des vibrations qui affectent la faune locale et la pousse à quitter leur habitat et à fuir.</p>
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
					<h3>More information :</h3>
					<ul>
						<li>
							📽️
							<a href="https://www.youtube.com/watch?v=QW9udH0vwlE">
								Under the hood of Sustainable IT : Promesses de dématérialisation et matérialité minérale
							</a>
							- Aurore Stephant, speaker at online event organized by the Belgian Institute for Sustainable IT (2021/09/07)
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
				<section class="rich-text">
					<h2>End of Life</h2>
					<p>This is also currently not implemented as an interactive data visualization.</p>
					<figure>
						<blockquote cite="https://theconversation.com/global-electronic-waste-up-21-in-five-years-and-recycling-isnt-keeping-up-141997">
							<p>Each year, the total amount of electric and electronic equipment the world uses grows by 2.5 million tonnes. Phones, radios, toys, laptops – if it has a power or battery supply it’s likely to join a growing mountain of “e-waste” after use.</p>
							<p>In 2019 alone, the world generated 53.6 million tonnes of e-waste. That’s about 7.3 kilograms per person and equivalent in weight to 350 cruise ships. Asia produced the lion’s share – 24.9 million tonnes – followed by the Americas (13.1 million tonnes) and Europe (12 million tonnes), while Africa and Oceania generated 2.9 and 0.7 million tonnes respectively.</p>
							<p>By 2030, the global total is likely to swell to 74.7 million tonnes, almost a doubling of the annual amount of new e-waste in just 16 years. This makes it the world’s fastest growing domestic waste stream, fuelled mainly by more people buying electronic products with shorter life cycles and fewer options for repair.</p>
						</blockquote>
						<figcaption>
							— Vanessa Forti,
							<cite>
								<a href="https://theconversation.com/global-electronic-waste-up-21-in-five-years-and-recycling-isnt-keeping-up-141997">
									Global electronic waste up 21% in five years, and recycling isn’t keeping up
								</a>
							</cite>
							(2020/07/10)
						</figcaption>
					</figure>
					<figure>
						<blockquote cite="https://designcommun.fr/cahiers/situer-le-numerique/" lang="fr">
							<p>Face au flux phénoménal de <abbr title="Déchets d'équipements électriques et électroniques">D.E.E.E</abbr>. étant produit et non tracé chaque année (44,3 Mt), des pollutions importantes apparaissent dans les pays où sont stockés et enterrés ces déchets. On estime que 50 tonnes de mercure échappent annuellement des e-déchets mis en décharge, ainsi que 71 kt de plastiques retardateurs de flamme (RFB ou BRF en anglais), des substances extrêmement toxiques pour les milieux vivants et sur les personnes qui y sont exposées. Les sites de décharge et de recyclage informel présentent donc des risques sanitaires et environnementaux importants.</p>
							<p>Les fuites de substances toxiques liées à l’oxydation des composants électroniques polluent les sols et les cours d’eau affectant les animaux, plantations et poissons qui seront consommés par les communautés aux alentours. Les personnes faisant du recyclage informel risquent de respirer des fumées toxiques en brûlant des fils et des circuits imprimés. Ces travailleurs s’exposent malgré eux à des risques plus importants de blessures ainsi qu’à des dommages génétiques, des déséquilibres de glucose dans le sang, des effets sur les fonctions du foie, et des troubles de la fertilité.</p>
							<p>[&hellip;] Face à une consommation toujours croissante de matières, le recyclage des e-déchets est toujours aussi peu favorisé, tant par la conception des équipements que par le niveau d’investissement nécessaire pour un centre de recyclage. Les métaux présents dans les équipements numériques sont difficilement récupérables et recyclables car ils sont présents en trop petite quantité, soit parce qu’ils sont utilisés dans un alliage et ne peuvent pas être séparés.</p>
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
					<figure>
						<blockquote cite="https://www.sciencedirect.com/science/article/abs/pii/S0301420720300805">
							<p>metal recycling requires high capital investments and so­phisticated technologies for separating most of the special­ ty/rare/precious/base metals. For example, $1 billion has been invested in the Umicore WEEE recycling and refining plant operating in Belgium (Hagelüken and Corti, 2010). This plant extracts 30 tons of gold, 37 tons of platinum group metals, 1000 tons of silver, and 68,500 tons of other metals per year from wastes. That makes it equivalent to the third largest gold mine in the world. For comparison, a standard paper recycling facility requires a base investment of $30–$50 million.</p>
						</blockquote>
						<figcaption>
							— Florian Fizaine,
							<cite>
								<a href="https://www.sciencedirect.com/science/article/abs/pii/S0301420720300805">
									The economics of recycling rate: New insights from waste electrical and electronic equipment
								</a>
							</cite>
							(2020/04/09)
						</figcaption>
					</figure>
					<h3>More information :</h3>
					<ul>
						<li>
							<a href="https://fr.wikipedia.org/wiki/Déchets_d'équipements_électriques_et_électroniques">
								Waste Electronic and Electrical Equipment (WEEE) / Déchets d'équipements électriques et électroniques (DEEE, D3E) ou produits électriques et électroniques en fin de vie (PEEFV)
							</a>
							— Wikipedia
						</li>
					</ul>
				</section>
			</TabContent>
		</Tabs>
	{/if}
{/if}

<style>
	p + p {
		margin-top: var(--space);
	}
	figure + figure {
		margin-top: calc(var(--space) * 2);
	}
</style>
