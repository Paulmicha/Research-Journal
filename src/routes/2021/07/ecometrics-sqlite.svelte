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
	import EcoMetricsSqlite from '$lib/components/ecometrics/EcoMetricsSqlite.svelte';
	import currentPageData from '$content/page/doodle/2021/07/ecometrics-sqlite.json';
</script>

<ContentPage { currentPageData }>
	<EcoMetricsSqlite />
</ContentPage>
