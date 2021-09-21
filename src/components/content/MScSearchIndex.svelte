<script>
	import { displayNb } from '../../lib/generic_utils';
	import { initDb } from '../../lib/search_index';
	import { route } from '../../stores/route';
	import { documentStore, documentCacheStore } from '../../stores/mscSearchIndex';
	import MScSearchIndexFilters from '../experiments/MScSearchIndexFilters.svelte';
	import MScSearchIndexResults from '../experiments/MScSearchIndexResults.svelte';
	import LoadingSpinner from '../LoadingSpinner.svelte';

	let dbSize = 0;
	// let jsonSize = 0;
	let totalDocs = 0;
	let isLoading = true;

	/**
	 * Initializes (once) the SQLite database.
	 *
	 * @param {Boolean} forceReload [optional] bypass memoized instance.
	 * @returns {Object} the SQL.js DB instance.
	 *
	 * @see static/sql-wasm.js
	 * @see src/lib/search_index.js
	 */
	const getDb = async forceReload => {
		if (typeof forceReload === 'undefined' && 'db' in $documentStore && $documentStore.db) {
			return $documentStore.db;
		}
		const db = await initDb(forceReload);
		documentStore.update(o => {
			o.db = db;
			return o;
		});
		return db;
	};

	/**
	 * Loads the cached dataset, unless reload is forced.
	 *
	 * If no cached data is found, it will be built on first call. It uses the
	 * same technique as in this example :
	 * See https://github.com/rednaw/exhibitionDB/blob/main/src/Database.js
	 *
	 * The documentCacheStore (synced to localStorage) must remember if the full
	 * dataset was previously loaded, allowing to warn if cache is stale. This is
	 * done by comparing the "unixTime" key between the last locally stored value
	 * (if any) and the one coming from static/data/search_index_preview.json
	 *
	 * @param {Boolean} forceReload [optional] bypass memoized instance.
	 * @returns {Object} the last 30 cached results + the SQL.js DB instance + the
	 *   totalDocs number.
	 *
	 * @see scripts/experiments/search_index/extract.js
	 * @see static/data/search_index.sqlite
	 * @see src/components/content/DigitalEcoMetricsSqlite.svelte
	 */
	const load = async forceReload => {
		isLoading = true;
		let totalDocs = 0;
		const results = [];
		const db = await getDb(forceReload);

		const res = db.exec("SELECT COUNT(url) as total FROM documents");
		totalDocs = res[0].values[0][0];

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
			results.push(row);
		}
		stmt.free();

		if (!$documentCacheStore.unixTime || typeof forceReload !== 'undefined') {
			documentCacheStore.update(o => {
				o.unixTime = $documentStore.unixTime;
				o.totalDocs = totalDocs;
				return o;
			});
		}

		isLoading = false;
		return { results, db, totalDocs };
	};

	/**
	 * Updates locally cached data.
	 */
	const refresh = () => {
		const updated = load(true);
		documentStore.update(o => {
			o.db = updated.db;
			o.results = updated.results;
			o.totalDocs = updated.totalDocs;
			return o;
		});
	};

	// Initial state contains either the last 30 entries coming from
	// static/data/search_index_preview.json OR the last cached entries (if any).
	route.subscribe(async o => {
		if (o.data && o.data.search_index) {
			const initialState = {
				results: o.data.search_index.documents,
				unixTime: o.data.search_index.unixTime,
				totalDocs: o.data.search_index.total,
				filters: {}
			};
			dbSize = o.data.search_index.dbSize;
			// jsonSize = o.data.search_index.jsonSize;
			totalDocs = o.data.search_index.total;
			// Always use the cached results first (if any), as there will be a button
			// to optionally refresh the data in this case.
			if ($documentCacheStore.unixTime) {
				const cached = await load();
				initialState.db = cached.db;
				initialState.results = cached.results;
			}
			isLoading = true;
			documentStore.set(initialState);
			isLoading = false;
		}
	});
</script>

{#if $documentStore.results.length}
	{#if $documentCacheStore.unixTime > 0}
		{#if $documentStore.unixTime != $documentCacheStore.unixTime}
			<p>
				The dataset has changed since your last visit ({ displayNb($documentStore.totalDocs - $documentCacheStore.totalDocs) } new entries).
				<button class="btn load u-m-b" on:click|preventDefault={ refresh }>
					Download the update ({ displayNb(dbSize) }&nbsp;ko)
				</button>
			</p>
		{/if}
		<MScSearchIndexFilters />
	{:else}
		{#if !isLoading}
			<div class="rich-text">
				<p>
					This page currently shows the last 30 entries indexed. The full dataset contains { displayNb(totalDocs) } entries. You can load a local copy of the database to browse and filter all entries :
				</p>
				<button class="btn load u-m-b" on:click|preventDefault={ load }>
					Load the full dataset ({ displayNb(dbSize) }&nbsp;ko)
				</button>
			</div>
		{/if}
	{/if}
{/if}

<div class="wrap">
	{#if isLoading}
		<LoadingSpinner size="10vmin" border="1vmin" />
	{/if}
	{#if $documentStore.totalDocs}
		<MScSearchIndexResults />
	{/if}
</div>

<style>
	.load {
		display: block;
		margin-left: auto;
		margin-right: auto;
		width: 42ch;
	}
	.wrap {
		position: relative;
	}
</style>
