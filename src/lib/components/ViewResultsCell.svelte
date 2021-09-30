<script>
	export let cell;
	export let result;
</script>

<div class="{ cell.class || '' }">
	{#if cell.href_from}
		<a class="link-title" href="{ result[cell.href_from] }" target="_blank">
			{ cell.value }
		</a>
	{:else}
		{ cell.value }
	{/if}
</div>

<style>
	.link-title {
		display: inline-block;
		max-width: 42ch;
	}
	.narrow {
		max-width: 10ch;
	}
</style>
