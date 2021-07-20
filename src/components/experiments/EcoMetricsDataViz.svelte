<script>
	import { selectedDeviceStore, co2EqStore } from '../../stores/ecometrics.js';
</script>

{#if $selectedDeviceStore.length && $co2EqStore.length}
	<!-- {#each $co2EqStore as co2Eq} -->
		<!-- Debug. -->
		<pre>co2Eq = {JSON.stringify($co2EqStore[3], null, 2)}</pre>
	<!-- {/each} -->
	{#each $selectedDeviceStore as device}
		<!-- Debug. -->
		<pre>device = {JSON.stringify(device, null, 2)}</pre>
	{/each}
{/if}
