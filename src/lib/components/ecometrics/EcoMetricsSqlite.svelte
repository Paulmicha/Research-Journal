<script>
	import ExternalScript from '$lib/components/ExternalScript.svelte';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	const dataStore = writable({
		"rows": [],
		"devicesColNames": []
	});

	let db;
	let devicesColNames;
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
			locateFile: file => `/${file}`
		});
		const dataPromise = fetch('/ecometrics.sqlite').then(res => res.arrayBuffer());
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

		devicesColNames = rows[0].map(row => row.key);
		// const res = db.exec("SELECT * FROM devicesCols");
		// devicesColNames = res[0].values.map(v => v[0]);

		dataStore.set({
			rows,
			devicesColNames
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

<ExternalScript url="/sql-wasm.js" on:loaded={ onLoaded } />

<!-- Debug. -->
<!-- <pre>DigitalEcoMetrics.svelte : devicesColNames : { JSON.stringify(devicesColNames, null, 2) } </pre> -->
<!-- <pre>DigitalEcoMetrics.svelte : rows : { JSON.stringify($dataStore.rows, null, 2) } </pre> -->

<div class="full-vw">
	<table>
		{#if $dataStore.devicesColNames}
			<thead>
				<tr>
					{#each $dataStore.devicesColNames as colName}
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
		width: calc(100% - var(--space) * 2);
	}
	tbody {
		font-size: .9rem;
	}
</style>
