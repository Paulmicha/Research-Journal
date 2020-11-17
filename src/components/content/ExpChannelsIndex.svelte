<script>
	// import ExternalScript from '../ExternalScript.svelte';
	// import ChannelsIndex from '../experiments/ChannelsIndex.svelte';

	// let loading = true;
	// const onLoaded = () => {
	// 	loading = false;
	// };

	import { route } from '../../stores/route.js';
	import { writable } from 'svelte/store';

	const documentsStore = writable([]);

	// Init custom data.
	let documents = [];
	route.subscribe(o => {
		if (o.data && o.data.channels_urls) {
			documents = o.data.channels_urls.documents;
			documentsStore.update(() => documents);
		}
	});
</script>

<style>
	table {
		margin-left: var(--space);
		margin-right: var(--space);
	}
</style>

<!-- DEBUG -->
<!-- <pre>ChannelsIndex.svelte : documents = {JSON.stringify($documentsStore, null, 2)}</pre> -->

<!-- <ExternalScript url="https://unpkg.com/lunr/lunr.js" on:loaded="{onLoaded}" /> -->

<!-- {#if loading}
	<p>Loading external lib...</p>
{:else}
	<ChannelsIndex />
{/if} -->

<div class="full-vw">
	<!-- <div class="f-grid f-grid--p">
		{#each $documentsStore as doc, i}
			<article>
				<h2><a href="{ doc.url }">{ doc.title }</a></h2>
				<h3>{ doc.channel }{ doc.author ? ' / ' + doc.author : '' }</h3>
				<p>{ doc.description }</p>
			</article>
		{/each}
	</div> -->
	<table>
		<thead>
			<th>Date</th>
			<th>Title</th>
			<th>Type</th>
			<th>Tags</th>
			<th>Author</th>
			<th>Names</th>
			<th>Description</th>
		</thead>
		<tbody>
		{#each $documentsStore as doc, i}
			<tr>
				<td>{ doc.date || '' }</td>
				<td><a href="{ doc.url }">{ doc.title }</a></td>
				<td>{ doc.type || '' }</td>
				<td>{ doc.channel }{ doc.tags ? ', ' + doc.tags : '' }</td>
				<td>{ doc.author || '' }</td>
				<td>{ doc.names || '' }</td>
				<td>{ doc.description || '' }</td>
			</tr>
		{/each}
		</tbody>
	</table>
</div>
