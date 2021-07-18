<script>
	// TODO (wip)
	const selection = {};
</script>

<!-- <svelte:head>
	<script src='/sql-wasm.js'></script>
	<script type="module">
		// Load sqj.js module and database
		const sqlPromise = initSqlJs({
			locateFile: file => `./${file}`
		});
		const dataPromise = fetch("filename.sqlite").then(res => res.arrayBuffer());
		const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
		const db = new SQL.Database(new Uint8Array(buf));

		// Grab the table element
		const table = document.querySelector( "table" );
		table.innerHTML = '<tr><th>Col1</th><th>Col2</th></tr>';

		// Prepare a statement
		var stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN $start AND $end");
		stmt.getAsObject({$start:1, $end:1}); // {col1:1, col2:111}

		// Bind new values
		stmt.bind({$start:1, $end:2});
		while(stmt.step()) { //
		var row = stmt.getAsObject();
			table.innerHTML += `<tr><td>${row['col1']}</td><td>${row['col2']}</td></tr>`;
		}
		console.log( "Done" );
	</script>
</svelte:head> -->

<!-- Debug. -->
<pre>DigitalEcoMetrics.svelte : selection : { JSON.stringify(selection, null, 2) } </pre>

<style>
	/* TODO (wip) */
</style>
