<script>
	import { getContext } from 'svelte';

	export let i = 0;
	export let selected = 0;

	i = parseInt(i);
	selected = parseInt(selected);

	const id = getContext('Tabs.id');
</script>

<div
	id="{ id }-{ i }"
	role="tabpanel"
	aria-hidden="{ selected === i ? 'false' : 'true' }"
	aria-labelledby="{ id }-{ i }-label"
	class="{ selected === i ? 'is-on' : 'is-off' }"
>
	<slot />
</div>

<style>
	.is-off {
		display: none;
	}
</style>
