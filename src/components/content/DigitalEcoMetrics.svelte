<!-- <script context="module">
</script> -->

<script>
	import ExternalScript from '../ExternalScript.svelte';
	import { writable } from 'svelte/store';

	const dataStore = writable({
		"rows": [],
		"colNames": []
	});

	let db;
	let colNames;
	const rows = [];

	const onLoaded = async () => {
		const sqlPromise = initSqlJs({
			locateFile: file => `./${file}`
		});
		const dataPromise = fetch('/data/ecometrics.sqlite').then(res => res.arrayBuffer());
		const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
		db = new SQL.Database(new Uint8Array(buf));

		const stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN $start AND $end");
		stmt.bind({ $start:1, $end:2 });

		let i = 0;
		while (stmt.step()) {
			rows[i] = [];
			const row = stmt.getAsObject();
			stmt.getColumnNames().forEach(colName => {
				rows[i].push({
					key: colName,
					val: row[colName]
					// html: `<strong>${colName}</strong> : ${row[colName]}`
				});
			});
			i++;
		}

		colNames = rows[0].map(row => row.colName);

		dataStore.set({
			rows,
			colNames
		});
	}

	// const selection = {};
</script>

<ExternalScript url="/sql-wasm.js" on:loaded="{onLoaded}" />

<!-- Debug. -->
<!-- <pre>DigitalEcoMetrics.svelte : colNames : { JSON.stringify(colNames, null, 2) } </pre> -->
<pre>DigitalEcoMetrics.svelte : rows : { JSON.stringify($dataStore.rows, null, 2) } </pre>

<table>
	{#if $dataStore.colNames}
		<tr>
			{#each $dataStore.colNames as colName}
				<th>{ colName }</th>
			{/each}
		</tr>
	{/if}
	{#if $dataStore.rows}
		{#each $dataStore.rows as cols}
			<tr>
				{#each cols as cell}
					<td>{ cell.val }</td>
					<!-- <td>{ !cell.html }</td> -->
				{/each}
			</tr>
		{/each}
	{/if}
</table>

<style>
	/* TODO (wip) */
</style>
