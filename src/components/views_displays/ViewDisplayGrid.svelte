<script>
	// placeholder://src/preprocess.js#entity_view_modes

	export let results = [];
	export let align = '';
	export let space = '';
	export let view_mode = '';

	const c = view_mode;
</script>

<!-- DEBUG -->
<!-- <pre>ViewDisplayGrid.svelte : results = {JSON.stringify(results, null, 2)}</pre> -->

<div class="full-vw">
	<div class="f-grid { align === 'center' ? 'f-grid--center' : '' } { space === 'large' ? 'f-grid--gutter-l f-grid--vgutter-l' : '' }">
		{#each results as props}
			<div class="item">
				<!-- placeholder://src/preprocess.js#entity_view_modes -->
			</div>
		{/each}
	</div>
</div>

<style>
	.item {
		max-width: 30ch;
	}
</style>
