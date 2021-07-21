<script>
	import CardBase from '../CardBase.svelte';
	import Text from '../Text.svelte';
	import Tag from '../Tag.svelte';

	export let title;
	export let path;
	export let description;
	export let published;
	export let image;
	export let tags = [];

	if (!image) {
		image = 'theme/article-default-500x309.jpg';
	}
</script>

<CardBase>
	<img slot="img" alt="{ title }" src="/{ image }" />
	<h2 slot="title">
		<a href="/{ path }">
			{ title }
		</a>
	</h2>
	<Text slot="content" text={ description } />
	<div slot="footer" class="o-fgrid">
		<small>
			{#each tags as uuid}
				<Tag {uuid} />
			{/each}
		</small>
		<small class="u-nowrap">
			{ published }
		</small>
	</div>
</CardBase>
