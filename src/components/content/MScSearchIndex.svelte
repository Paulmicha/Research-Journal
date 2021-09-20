<script context="module">
	const loaded = [];
</script>

<script>
	import { displayNb } from '../../lib/generic_utils.js';
	import { route } from '../../stores/route.js';
	import { documentStore, documentCacheStore } from '../../stores/mscSearchIndex';
	import MScSearchIndexFilters from '../experiments/MScSearchIndexFilters.svelte';
	import MScSearchIndexResults from '../experiments/MScSearchIndexResults.svelte';
	import LoadingSpinner from '../LoadingSpinner.svelte';

	let db;
	let dbSize = 0;
	let totalDocs = 0;
	let isLoading = false;

	// Initial data "seeding", before loading the full dataset.
	route.subscribe(o => {
		if (o.data && o.data.search_index) {
			dbSize = o.data.search_index.dbSize;
			totalDocs = o.data.search_index.total;
			documentStore.set({
				initial: o.data.search_index.documents,
				results: o.data.search_index.documents
			});
		}
	});

	/**
	 * Utility to dynamically load scripts (only once).
	 *
	 * TODO refactor in progress :
	 * @see loadAll()
	 *
	 * See https://stackoverflow.com/a/39008859/2592338 (current approach)
	 * See https://stackoverflow.com/a/45032548/2592338 (synchronous alternative)
	 * See https://stackoverflow.com/a/51669062/2592338 (untested import)
	 */
	const injectScript = src => {
		if (loaded.includes(src)) {
			return;
		}
		loaded.push(src);
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = src;
			script.addEventListener('load', resolve);
			script.addEventListener('error', e => reject(e.error));
			document.head.appendChild(script);
		});
	}

	/**
	 * Loads the whole dataset (sqlite).
	 *
	 * TODO refactor to use :
	 * import localforage from 'localforage';
	 * -> locally cache SQLite db, like in this example :
	 * See https://github.com/rednaw/exhibitionDB/blob/main/src/Database.js
	 *
	 * TODO also, the documentCacheStore (synced to localStorage) must remember if
	 * the full dataset was previously loaded, and warn if cache is stale.
	 *
	 * @see scripts/experiments/search_index/extract.js
	 * @see static/data/search_index.sqlite
	 * @see src/components/content/DigitalEcoMetricsSqlite.svelte
	 */
	const loadAll = async () => {
		isLoading = true;
		await injectScript('/sql-wasm.js');

		const [SQL, buf] = await Promise.all([
			initSqlJs({ locateFile: file => `./${file}` }),
			fetch('/data/search_index.sqlite').then(res => res.arrayBuffer())
		]);
		db = new SQL.Database(new Uint8Array(buf));

		const rows = [];
		const stmt = db.prepare("SELECT * FROM documents LIMIT 0,30");
		stmt.bind();
		while (stmt.step()) {
			const row = stmt.getAsObject();
			// Attempt to convert every value starting with '[' or '{' to object.
			// @see props2Arr() in scripts/experiments/ecometrics/utils.js
			Object.keys(row).forEach(key => {
				if (row[key].substring(0, 1) === '[' || row[key].substring(0, 1) === '{') {
					try {
						row[key] = JSON.parse(row[key]);
					} catch (error) {}
				}
			});
			rows.push(row);
		}
		stmt.free();

		documentStore.update(o => {
			o.all = rows;
			return o;
		});

		isLoading = false;
	}
</script>

<!--
	TODO detect if local cached DB exists, in which case automatically display
	the full dataset + filters.
-->

{#if 'all' in $documentStore}
	<MScSearchIndexFilters />
{:else}
	{#if !isLoading}
		<div class="rich-text">
			<p>
				This page currently shows a preview of the last 30 documents indexed.
				The full dataset contains { displayNb(totalDocs) } documents (about { displayNb(dbSize) } ko).
			</p>
			<button class="btn load u-m-b" on:click|preventDefault={ loadAll }>
				Load the full dataset
			</button>
		</div>
	{/if}
{/if}

{#if isLoading}
	<LoadingSpinner size="10vmin" border="1vmin" />
{/if}

<!-- TODO (wip) refactor in progress : @see loadAll() -->
{#if !$documentCacheStore.unixTime && !('all' in $documentStore) }
	<p>Here's a preview of the last 30 documents indexed.</p>
{/if}

<MScSearchIndexResults { totalDocs } />

<style>
	.load {
		display: block;
		margin-left: auto;
		margin-right: auto;
		width: 42ch;
	}
</style>
