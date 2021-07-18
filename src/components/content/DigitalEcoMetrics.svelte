<!-- <script context="module">
</script> -->

<script>
	import ExternalScript from '../ExternalScript.svelte';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	const dataStore = writable({
		"rows": [],
		"colNames": []
	});

	let db;
	let colNames;
	const rows = [];

	/**
	 * Wait for the external sql.js module to be loaded.
	 */
	const onLoaded = async () => {
		// @see onMount()
		if (rows.length > 0) {
			return
		}

		const sqlPromise = initSqlJs({
			locateFile: file => `./${file}`
		});
		const dataPromise = fetch('/data/ecometrics.sqlite').then(res => res.arrayBuffer());
		const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
		db = new SQL.Database(new Uint8Array(buf));

		// const stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN $start AND $end");
		// stmt.bind({ $start:0, $end:2 });
		const stmt = db.prepare("SELECT * FROM test");
		stmt.bind();

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

		colNames = rows[0].map(row => row.key);

		dataStore.set({
			rows,
			colNames
		});
	}

	/**
	 * Workaround : when navigating to page, it works, but not when loading the
	 * URL directly.
	 */
	onMount(() => {
		onLoaded();
	});

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
