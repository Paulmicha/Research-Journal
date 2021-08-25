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

	const selectionIsValid = devices => {
		if (!devices.length) {
			return false;
		}
		devices.forEach(device => {
			switch (device.type) {
				case value:

					break;

				default:
					break;
			}
		});
		return true;
	};
</script>

{#if selectionIsValid($selectedDeviceStore)}
	<p>TODO</p>
{/if}

<style>
</style>
