<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import Lede from '$lib/components/Lede.svelte';
	import currentPageData from '$content/page/index.json';
</script>

<ContentPage { currentPageData }>
	<Lede text="This website is created specifically for publishing my ongoing research for the Msc Strategy and Design for the Anthropocene I'm currently doing. It contains interactive experiments and various public notes, bookmarks, and visualizations."></Lede>
	<div class="rich-text">
		<p>Initially based on Sapper, it is now converted to SvelteKit.</p>
		<p>The <a href="/msc-search-index">search index</a> is a proof of concept for evaluating the use of SQLite in the browser. The bookmarked links are aggregated from Discord.</p>
		<p><a href="/ecometrics">"Ecometrics"</a> is an experimental data visualization tool to represent environmental impacts of digital devices and services.</p>
	</div>
</ContentPage>
