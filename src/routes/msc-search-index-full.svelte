<script context="module">
	import { appIsBusy } from '$lib/stores/globalState.js';

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page }) {
		// Display loader until main component has rendered.
		appIsBusy.set(true);
		return {
			props: {
				pagerPos: page.query.has('p1') ? parseInt(page.query.get('p1')) : 0
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
	// query arg changed.
	console.log("pagerPos from route :");
	console.log(pagerPos);
</script>

<ContentPage { currentPageData }>
	{#if browser}
		<MScSearchIndexView { pagerPos } />
	{/if}
</ContentPage>
