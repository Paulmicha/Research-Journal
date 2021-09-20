<script>
	import { route } from '../../stores/route.js';
	import { documentStore } from '../../stores/mscSearchIndex';
	import MScSearchIndexFilters from '../experiments/MScSearchIndexFilters.svelte';
	import MScSearchIndexResults from '../experiments/MScSearchIndexResults.svelte';
	import LoadingSpinner from '../LoadingSpinner.svelte';

	let totalDocs = 0;
	let isLoading = false;

	// Initial data "seeding", before loading the full dataset.
	route.subscribe(o => {
		if (o.data && o.data.channels_urls) {
			totalDocs = o.data.channels_urls.total;
			documentStore.set({
				initial: o.data.channels_urls.documents,
				results: o.data.channels_urls.documents
			});
		}
	});

	/**
	 * Loads to whole dataset (sqlite).
	 *
	 * @see static/data/search_index.sqlite
	 * @see src/components/content/DigitalEcoMetricsSqlite.svelte
	 */
	const loadAll = () => {
		// TODO (wip)
		console.log("TODO loadAll()");
		isLoading = true;
	}
</script>

{#if 'all' in $documentStore}
	<MScSearchIndexFilters />
{:else}
	{#if !isLoading}
		<p>Here's a preview of the last 30 documents indexed.</p>
		<button class="btn" on:click|preventDefault={ loadAll }>Load all</button>
	<!-- {:else}
		<LoadingSpinner /> -->
	{/if}
{/if}

{#if isLoading}
	<LoadingSpinner size="10vmin" border="1vmin" />
{/if}

<MScSearchIndexResults { totalDocs } />
