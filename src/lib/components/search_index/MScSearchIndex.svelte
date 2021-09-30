<script>
	import { displayNb } from '$lib/generic_utils';
	import { initDb, getResults, getResultsCount } from '$lib/search_index';
	import { createView, viewQueryBuilder } from '$lib/view';
	import { appIsBusy } from '$lib/stores/globalState.js';
	import { documentStore, documentCacheStore } from '$lib/stores/mscSearchIndex';
	import MScSearchIndexFiltersSqlite from '$lib/components/search_index/MScSearchIndexFiltersSqlite.svelte';
	import MScSearchIndexResults from '$lib/components/search_index/MScSearchIndexResults.svelte';
	import MScSearchIndexResultsSqlite from '$lib/components/search_index/MScSearchIndexResultsSqlite.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import searchIndexPreviewData from '$content/search_index_preview.json';

	let isLoading = true;
	let dbSize = searchIndexPreviewData.dbSize;
	let totalDocs = searchIndexPreviewData.total;

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
	 * (if any) and the one coming from content/search_index_preview.json
	 *
	 * @param {Boolean} forceReload [optional] bypass memoized instance.
	 *
	 * @see scripts/experiments/search_index/extract.js
	 * @see content/search_index.sqlite
	 * @see src/components/content/EcoMetricsSqlite.svelte
	 */
	const load = async forceReload => {
		isLoading = true;
		appIsBusy.set(true);

		const db = await getDb(forceReload);
		const results = getResults(db);
		totalDocs = getResultsCount(db);

		// TODO (wip) attempt more general approach.
		// const view = createView({
		// 	base_table: 'documents',
		// 	fields: {
		// 		"*": { table: "documents" }
		// 		// url: { label: "url" },
		// 		// tags: { label: "tags" },
		// 		// date_shared: { label: "date_shared" },
		// 		// description: { label: "description" },
		// 		// author: { label: "author" },
		// 		// title: { label: "title" },
		// 		// reactions: { label: "reactions" },
		// 		// id: { label: "id" }
		// 	}
		// });
		// console.log(view);
		// console.log(viewQueryBuilder(view));


		// First load = cache the results (or repeat if forceReload).
		if (!$documentCacheStore.unixTime || typeof forceReload !== 'undefined') {
			documentCacheStore.update(o => {
				o.unixTime = Math.floor(Date.now() / 1000);
				o.totalDocs = totalDocs;
				return o;
			});
		}

		// Replace the store initially based on preview data + bust any previously
		// active filters.
		documentStore.update(o => {
			o.db = db;
			o.filters = [];
			o.results = results;
			o.totalDocs = totalDocs;
			return o;
		});

		isLoading = false;
		appIsBusy.set(false);
	};

	// Initial state contains either the last 30 entries coming from
	// content/search_index_preview.json OR the last cached entries (if any).
	const initialState = {
		results: searchIndexPreviewData.documents,
		unixTime: searchIndexPreviewData.unixTime,
		totalDocs: searchIndexPreviewData.total,
		filters: []
	};

	// Always use the cached results first (if any), as there will be a button
	// to optionally refresh the data (if new data is available) in this case.
	if ($documentCacheStore.unixTime) {
		console.log('Cached results found -> load() immediately');
		load();
	} else {
		// documentStore.update(o => {
		// 	console.log('no cached results found -> initial state :');
		// 	console.log({ ...o, ...initialState });
		// 	return { ...o, ...initialState };
		// });
		documentStore.set(initialState);
		isLoading = false;
		appIsBusy.set(false);
	}

</script>

<p class="u-m-b u-fs-s">
	⚠️&nbsp;Work in progress (proof of concept)
</p>

{#if !isLoading}
	{#if $documentCacheStore.unixTime > 0}
		<MScSearchIndexFiltersSqlite />
		{#if $documentCacheStore.unixTime < searchIndexPreviewData.unixTime}
			<details>
				<summary>Update available</summary>
				The dataset has changed since your last visit ({ displayNb($documentStore.totalDocs - $documentCacheStore.totalDocs) } new entries).
				<button class="btn load u-m-b" on:click|preventDefault={ () => { load(true) } }>
					Download the update ({ displayNb(dbSize) }&nbsp;ko)
				</button>
			</details>
		{/if}
	{:else}
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

<div class="wrap">
	{#if isLoading}
		<LoadingSpinner size="10vmin" border="1vmin" />
	{/if}
	{#if $documentCacheStore.unixTime > 0}
		<MScSearchIndexResultsSqlite />
	{:else}
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
