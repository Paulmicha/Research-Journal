<script>
	import { route } from '../../stores/route.js';
	import { deviceStore, co2EqStore } from '../../stores/ecometrics.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import EcoMetricsSelector from '../experiments/EcoMetricsSelector.svelte';
	import EcoMetricsDataViz from '../experiments/EcoMetricsDataViz.svelte';

	// Init custom data.
	route.subscribe(o => {
		if (o.data && o.data.ecometrics) {
			const rows = [];

			// Store all devices.
			o.data.ecometrics.devices.forEach((row, i) => {
				rows[i] = [];
				o.data.ecometrics.devicesKeys.forEach((colName, j) => {
					rows[i].push({
						key: colName,
						val: row[j]
					});
				});
			});

			deviceStore.set({
				rows,
				devicesColNames: [...o.data.ecometrics.devicesColNames]
			});

			// Store all CO2 equivalences.
			co2EqStore.set([...o.data.ecometrics.co2Eq]);
		}
	});
</script>

{#if ! $deviceStore.rows.length}
	<div class="full-vw fill-h">
		<LoadingSpinner size="10vmin" border="1vmin" />
	</div>
{:else}
	<EcoMetricsSelector />
	<EcoMetricsDataViz />
{/if}
