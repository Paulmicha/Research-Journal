<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import EcoMetrics from '$lib/components/ecometrics/EcoMetrics.svelte';
	import currentPageData from '$content/page/ecometrics.json';
</script>

<ContentPage { currentPageData }>
	<EcoMetrics />
</ContentPage>
