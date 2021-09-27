<script>
	import ContentPage from '$lib/components/ContentPage.svelte';
	import Card from '$lib/components/Card.svelte';
	import currentPageData from '$content/page/doodles.json';
</script>

<ContentPage { currentPageData }>
	<div class="rich-text">
		<p>Individual experiments meant for testing out ideas and/or complementing various MSc workshops.</p>
	</div>
	<div class="full-vw">
		<div class="f-grid f-grid--center f-grid--g">
			{#each currentPageData.doodles as d}
				<div class="item">
					<Card { ...d } />
				</div>
			{/each}
		</div>
	</div>
</ContentPage>

<style>
	.item {
		max-width: 30ch;
	}
</style>
