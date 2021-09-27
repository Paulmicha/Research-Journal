<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import ExpDocuWorkshop from '$lib/components/postures/ExpDocuWorkshop.svelte';
	import currentPageData from '$content/page/doodle/2020/10/position.json';
</script>

<ContentPage { currentPageData }>
	<ExpDocuWorkshop />
</ContentPage>
