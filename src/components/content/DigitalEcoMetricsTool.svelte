<script>
	import { route } from '../../stores/route.js';
	import { deviceStore, co2EqStore } from '../../stores/ecometrics.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import EcoMetricsSelector from '../experiments/EcoMetricsSelector.svelte';
	import EcoMetricsDataViz from '../experiments/EcoMetricsDataViz.svelte';

	// Init custom data.
	route.subscribe(o => {
		if (o.data && o.data.ecometrics) {
			const devices = [...o.data.ecometrics.devices];

			// Seed the 'age' key by default based on manufacturing date.
			devices.forEach(device => {
				if ('date' in device && device.date.length) {
					device.age = new Date().getFullYear() - parseInt(device.date.replace(/\D/g, ''));
				} else {
					device.age = 1;
				}
			});

			// Store all devices.
			deviceStore.set({
				devices,
				devicesColNames: [...o.data.ecometrics.devicesColNames]
			});

			// Store all CO2 equivalences.
			co2EqStore.set([...o.data.ecometrics.co2Eq]);

			// TODO presets from query args.
			// console.log(o.query);
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
