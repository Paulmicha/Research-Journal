<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import MScSearchIndex from '$lib/components/search_index/MScSearchIndex.svelte';
	import currentPageData from '$content/page/msc-search-index.json';
</script>

<ContentPage { currentPageData }>
	<MScSearchIndex />
</ContentPage>
