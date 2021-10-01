<script context="module">
	import { appIsBusy } from '$lib/stores/globalState.js';
	import { browser } from '$app/env';

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page }) {
		// Display loader until main component has rendered.
		appIsBusy.set(true);

		// There are 2 ways to determine the "switch" to the full version (SQLite) :
		// - cold cache = user followed a link with URL param
		// - localStorage value exists (used by documentCacheStore). Must be read
		// directly from the API because we can't read Svelte store values here.
		// TODO this still can't prevent the flash of preview contents.
		let fullVersionRequested = page.query.has('d');
		if (!fullVersionRequested && browser) {
			const storedVal = localStorage.getItem('mscSearchIndexCache');
			if (storedVal && storedVal.length) {
				const cache = JSON.parse(storedVal);
				fullVersionRequested = cache.unixTime > 0;
			}
		}

		// Component won't get re-rendered when using pager links (URL param).
		// -> send query arg as prop
		// -> TODO hardcode here the view id ?
		return {
			props: { fullVersionRequested  }
		};
	}
</script>

<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import MScSearchIndex from '$lib/components/search_index/MScSearchIndex.svelte';
	import MScSearchIndexView from '$lib/components/search_index/MScSearchIndexView.svelte';
	import currentPageData from '$content/page/msc-search-index.json';
	export let fullVersionRequested;
</script>

<ContentPage { currentPageData }>
	{#if fullVersionRequested}
		<MScSearchIndexView />
	{:else}
		<MScSearchIndex />
	{/if}
</ContentPage>
