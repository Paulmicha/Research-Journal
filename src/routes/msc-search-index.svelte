<script context="module">
	import { browser } from '$app/env';

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load() {
		// If localStorage value exists (used by documentCacheStore, must be read
		// directly from the API because we can't read Svelte store values here),
		// immediately redirect to the "full" version.
		if (browser) {
			const storedVal = localStorage.getItem('mscSearchIndexCache');
			if (storedVal && storedVal.length) {
				const cache = JSON.parse(storedVal);
				if (cache.unixTime > 0) {
					return {
						redirect: '/msc-search-index-full',
						status: 302
					}
				}
			}
		}
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
