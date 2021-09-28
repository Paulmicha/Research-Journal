<script context="module">
	import { appIsBusy } from '$lib/stores/globalState.js';

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load() {
		// Display loader until main component has rendered.
		appIsBusy.set(true);
		return true;
	}
</script>

<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import MScSearchIndex from '$lib/components/search_index/MScSearchIndex.svelte';
	import currentPageData from '$content/page/msc-search-index.json';
</script>

<ContentPage { currentPageData }>
	<MScSearchIndex />
</ContentPage>
