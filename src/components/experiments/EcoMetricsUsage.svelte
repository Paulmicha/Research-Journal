<script>
	import { displayNb } from '../../lib/generic_utils.js';
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
  import EcoMetricsCo2Equivalents from './EcoMetricsCo2Equivalents.svelte';

	const selectionIsValid = devices => {
		if (!devices.length) {
			return false;
		}
		return true;
	};
</script>

{#if selectionIsValid($selectedDeviceStore)}
	<section>
		<h2>CO2 Equivalents</h2>
		<div class="rich-text">
			<p>Current selection of devices amounts to a total of <strong>{ displayNb($totalsStore.kg_co2eq.value) }</strong> Kg CO2 Equivalents for their production. Here's a list of corresponding measures for reference :</p>
		</div>
		<EcoMetricsCo2Equivalents />
	</section>
{/if}

<style>
</style>
