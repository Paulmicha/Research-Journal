<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import PerspectiveTest1 from '$lib/components/perspective/PerspectiveTest1.svelte';
	import currentPageData from '$content/page/doodle/2020/10/perspective-test-1.json';
</script>

<ContentPage { currentPageData }>
	<PerspectiveTest1 />
</ContentPage>
