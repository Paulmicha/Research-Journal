<script>
	import { route } from '../../stores/route.js';
	import { deviceStore, co2EqStore } from '../../stores/ecometrics.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import EcoMetricsSelector from '../experiments/EcoMetricsSelector.svelte';
	import EcoMetricsDataViz from '../experiments/EcoMetricsDataViz.svelte';

	// Init custom data.
	route.subscribe(o => {
		if (o.data && o.data.ecometrics) {
			// Store all devices.
			deviceStore.set({
				devices: [...o.data.ecometrics.devices],
				devicesColNames: [...o.data.ecometrics.devicesColNames]
			});
			// Store all CO2 equivalences.
			co2EqStore.set([...o.data.ecometrics.co2Eq]);
		}
	});
</script>

{#if ! $deviceStore.devices.length}
	<div class="full-vw fill-h">
		<LoadingSpinner size="10vmin" border="1vmin" />
	</div>
{:else}
	<EcoMetricsSelector />
	<EcoMetricsDataViz />
{/if}
