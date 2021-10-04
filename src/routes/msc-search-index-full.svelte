<script context="module">
	/**
	 * @file
	 * Contains the SQLite experimental version of the MSc Discord search index.
	 *
	 * @see src/routes/msc-search-index.svelte
	 *
	 * Note : we can't place this page in a URL with a path that would break
	 * the loading of the WASM lib (i.e. cannot use /msc-search-index/full -> this
	 * causes a 404 error from within the static/sql-wasm.js implementation). The
	 * only workaround I found seem tricky enough to just not bother, e.g. :
	 * See https://blog.elmah.io/how-to-fix-blazor-wasm-base-path-problems/
	 */
	import { appIsBusy } from '$lib/stores/globalState.js';

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page }) {
		// Display loader until main component has rendered.
		appIsBusy.set(true);
		return {
			props: {
				// TODO still found no way to automatically assign a unique ID per View
				// component instance (manually hardcoded for now).
				// @see src/lib/components/search_index/MScSearchIndexView.svelte
				// @see src/lib/components/View.svelte
				// TODO (wip) Workaround build error :
				// Error: Cannot access query on a page with prerendering enabled
				pagerPos: 0
				// pagerPos: page.query.has('p1') ? parseInt(page.query.get('p1')) : 0
			}
		};
	}
</script>

<script>
	import { browser } from '$app/env';
	import ContentPage from '$lib/components/ContentPage.svelte';
	import MScSearchIndexView from '$lib/components/search_index/MScSearchIndexView.svelte';
	import currentPageData from '$content/page/msc-search-index.json';
	export let pagerPos;

	// TODO (wip) Sveltekit does not re-render this component even though the
	// query arg changed. Workaround : use a 100% store-based implementation.
	// Also note we can't use any dynamic route either because of the 404 error in
	// the WASM lib loader script (see comments above in @file docblock).
	// @see src/lib/components/ViewPager.svelte
	// console.log("pagerPos from route :");
	// console.log(pagerPos);
</script>

<ContentPage { currentPageData }>
	<!--
		TODO the way to do server-side pre-rendering is the same as what we do to
		create the sqlite file in the first place (it's a Node script).
		@see scripts/experiments/search_index/extract.js
		-> when ready, remove {#if browser} condition - actual implementation in :
		@see initDb() in src/lib/sqlite.js
	-->
	{#if browser}
		<MScSearchIndexView { pagerPos } />
	{/if}
</ContentPage>
