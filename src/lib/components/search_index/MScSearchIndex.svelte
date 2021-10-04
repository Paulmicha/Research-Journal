<script>
	import { displayNb } from '$lib/generic_utils';
	import { documentStore } from '$lib/stores/mscSearchIndex';
	import MScSearchIndexFilters from '$lib/components/search_index/MScSearchIndexFilters.svelte';
	import MScSearchIndexResults from '$lib/components/search_index/MScSearchIndexResults.svelte';
	import searchIndexPreviewData from '$content/search_index_preview.json';

	documentStore.set({
		initial: searchIndexPreviewData.documents,
		results: searchIndexPreviewData.documents,
		totalDocs: searchIndexPreviewData.total,
		filters: []
	});
</script>

<div class="rich-text">
	<p>
		This page currently shows the last 150 entries indexed. The full dataset contains { displayNb(searchIndexPreviewData.total) } entries. You can load a local copy of the database to browse and filter all entries :
	</p>
	<a href="/msc-search-index-full" class="btn load u-m-b">
		Load the full dataset ({ displayNb(searchIndexPreviewData.dbSize) }&nbsp;ko)
	</a>
</div>

<MScSearchIndexFilters />
<MScSearchIndexResults />

<style>
	.load {
		display: block;
		margin-left: auto;
		margin-right: auto;
		width: 42ch;
	}
</style>
