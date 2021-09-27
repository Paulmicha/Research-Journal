<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import EcoMetricsSqlite from '$lib/components/ecometrics/EcoMetricsSqlite.svelte';
	import currentPageData from '$content/page/doodle/2021/07/ecometrics-sqlite.json';
</script>

<ContentPage { currentPageData }>
	<EcoMetricsSqlite />
</ContentPage>
