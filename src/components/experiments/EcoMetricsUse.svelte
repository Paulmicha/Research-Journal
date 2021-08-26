<script>
	import { displayNb } from '../../lib/generic_utils.js';
	import { selectedDeviceStore, totalsStore } from '../../stores/ecometrics.js';
  import EcoMetricsCo2Equivalents from './EcoMetricsCo2Equivalents.svelte';

	let period = 'month';
	// let useStats = {};

	// const selectionHasServer = devices => {
	// 	for (let i = 0; i < devices.length; i++) {
	// 		const device = devices[i];
	// 		if (device.subcategory === 'server') {
	// 			return true;
	// 		}
	// 	}
	// 	return false;
	// };

	// totalsStore.subscribe(totals => {
	// 	if ($selectedDeviceStore.length) {
	// 		$selectedDeviceStore.forEach(device => {
	// 			console.log(device);
	// 		});
	// 	}
	// 	console.log(totals);
	// });

</script>

{#if $selectedDeviceStore.length}
	<!-- {#if selectionHasServer($selectedDeviceStore)}
		<p>TODO server config</p>
	{/if} -->
	{#if $totalsStore.kg_co2eq.value}
		<section>
			<h2>CO2 Equivalents</h2>
			<div class="rich-text">
				<p>Currently specified use of devices and services amounts to a total of <strong>{ displayNb($totalsStore.yearly_kwh.value) }</strong> Kw/h per year - that is, <strong>TODO</strong> Kg CO2 Equivalents over a period of <strong>1 { period }</strong>. Here's a list of corresponding measures for reference :</p>
			</div>
			<EcoMetricsCo2Equivalents />
		</section>
	{/if}
{/if}

<style>
</style>
