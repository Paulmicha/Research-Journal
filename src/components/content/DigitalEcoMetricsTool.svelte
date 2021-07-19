<script>
	import { route } from '../../stores/route.js';
	import { deviceStore } from '../../stores/ecometrics.js';
	import EcoMetricsSelector from '../experiments/EcoMetricsSelector.svelte';
	import LoadingSpinner from '../LoadingSpinner.svelte';

	// Init custom data.
	route.subscribe(o => {
		if (o.data && o.data.ecometrics) {
			const rows = [];

			o.data.ecometrics.rows.forEach((row, i) => {
				rows[i] = [];
				o.data.ecometrics.colIds.forEach((colName, j) => {
					rows[i].push({
						key: colName,
						val: row[j]
					});
				});
			});

			deviceStore.set({
				rows,
				colNames: [...o.data.ecometrics.colNames]
			});
		}
	});
</script>

{#if ! $deviceStore.rows.length}
	<div class="full-vw fill-h">
		<LoadingSpinner size="10vmin" border="1vmin" />
	</div>
{:else}
	<EcoMetricsSelector />
{/if}
