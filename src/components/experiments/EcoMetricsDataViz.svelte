<script>
	import { selectedDeviceStore } from '../../stores/ecometrics.js';
</script>

{#if $selectedDeviceStore.length}
	{#each $selectedDeviceStore as device}

		<!-- Debug. -->
		<pre>EcoMetricsDataViz.svelte : device = {JSON.stringify(device, null, 2)}</pre>

	{/each}
{/if}
