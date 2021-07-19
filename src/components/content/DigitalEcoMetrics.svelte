<!-- <script context="module">
</script> -->

<script>
	import ExternalScript from '../ExternalScript.svelte';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	// import initSqlJs from '../../lib/sql-wasm.js';
	// import { initSqlJs } from 'sql.js';

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
			return;
		}
		if (!initSqlJs) {
			return;
		}

		const sqlPromise = initSqlJs({
			locateFile: file => `./${file}`
		});
		const dataPromise = fetch('/data/ecometrics.sqlite').then(res => res.arrayBuffer());
		const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
		db = new SQL.Database(new Uint8Array(buf));

		// const stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN $start AND $end");
		// stmt.bind({ $start:0, $end:2 });
		const stmt = db.prepare("SELECT * FROM devices");
		stmt.bind();

		let i = 0;
		while (stmt.step()) {
			rows[i] = [];
			const row = stmt.getAsObject();
			stmt.getColumnNames().forEach(colName => {
				rows[i].push({
					key: colName,
					val: row[colName]
				});
			});
			i++;
		}

		stmt.free();

		// colNames = rows[0].map(row => row.key);
		const res = db.exec("SELECT * FROM devicesCols");
		colNames = res[0].values.map(v => v[0]);

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
<!-- <pre>DigitalEcoMetrics.svelte : rows : { JSON.stringify($dataStore.rows, null, 2) } </pre> -->

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
