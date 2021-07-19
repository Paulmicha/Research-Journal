<script>
	import { writable } from 'svelte/store';
	import { route } from '../../stores/route.js';

	const dataStore = writable({
		"rows": [],
		"colNames": []
	});

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

			dataStore.set({
				rows,
				colNames: [...o.data.ecometrics.colNames]
			});
		}
	});
</script>

<div class="full-vw">
	<table>
		{#if $dataStore.colNames}
			<thead>
				<tr>
					{#each $dataStore.colNames as colName}
					<th>{ colName }</th>
					{/each}
				</tr>
			</thead>
		{/if}
		{#if $dataStore.rows}
			<tbody>
				{#each $dataStore.rows as cols}
					<tr>
						{#each cols as cell}
							{#if cell.key === 'sources'}
								<td><a href="{ cell.val }" target="_blank">source</a></td>
							{:else}
								<td>{ cell.val }</td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		{/if}
	</table>
</div>

<style>
	table {
		width: 100%;
	}
	tbody {
		font-size: .9rem;
	}
</style>
