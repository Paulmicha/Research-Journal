<script>
	/**
	 * @file
	 * TODO (wip) decision to separate concerns between SQLite technique (with
	 * cache busting logic) bound to this implementation, or doing something
	 * independant from all the results "fetching".
	 *
	 * For now, every "View" component always embarks all the logic for 1 sqlite
	 * database.
	 */
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { createView, viewQueryBuilder } from '$lib/view';
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { appIsBusy } from '$lib/stores/globalState.js';
	import ViewPager from '$lib/components/ViewPager.svelte';
	import ViewResults from '$lib/components/ViewResults.svelte';

	export let definition; // @see createView()
	export let store; // Exposed for reading only from the outside

	// TODO (wip) createView() now includes DB init -> async -> moved below.
	// let viewObj = createView(definition);
	// store = writable(viewObj);
	appIsBusy.set(true);
	store = writable();
	setContext('view', store);

	/**
	 * Because of Netlify, we wrap the arg getter in a function.
	 *
	 * TODO deprecate Netlify to only use Svelte's page store instead.
	 */
	 const arg = arg => {
		if ($page.query.has(arg)) {
			return $page.query.get(arg);
		}
		// Fallback : parsing manually window location.
		if (browser) {
			const regex = new RegExp(arg + "=([^&]*)", "g");
			const matches = `${window.location}`.match(regex);
			if (matches && matches.length) {
				return matches[0].substring((arg + "=").length);
			}
		}
	};

	// createView() now includes the DB init.
	createView(definition).then(viewObj => {
		const currentPageArg = arg('p' + viewObj.id);
		if (viewObj.pager.current_page != currentPageArg) {
			// TODO update results
		}

		// console.log(viewObj);
		// console.log(viewQueryBuilder(viewObj));

		store.set(viewObj);
		appIsBusy.set(false);
	});
</script>

{#if $store?.results?.length > 0}
	{#if $store?.pager?.total_results_nb > $store?.pager?.nb_per_page}
		<ViewPager />
	{/if}
	<ViewResults />
	{#if $store?.pager?.total_results_nb > $store?.pager?.nb_per_page}
		<ViewPager />
	{/if}
{/if}
