<script>
	import { route } from '../../stores/route.js';
	import { deviceStore, co2EqStore, selectedDeviceStore } from '../../stores/ecometrics.js';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import EcoMetricsSelector from '../experiments/EcoMetricsSelector.svelte';
	import EcoMetricsManufacturing from '../experiments/EcoMetricsManufacturing.svelte';

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
				devicesColNames: o.data.ecometrics.devicesColNames,
				// devicesDistinctValues: o.data.ecometrics.devicesDistinctValues
				devicesIcons: o.data.devicesIcons
			});

			// Store all CO2 equivalences.
			co2EqStore.set(o.data.ecometrics.co2Eq);

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

				selectedDeviceStore.update(selectedDevices => devicesToSelect);
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
	<EcoMetricsManufacturing />
{/if}
